import "server-only";
import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  stepCountIs,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { retrieve, type RetrievedSection } from "@/lib/knowledge/retrieve";
import type { MediaCard, ShareMediaResult } from "@/lib/media/select";
import { getAgentConfig, type AgentConfig } from "./config";
import { retrievalQuery, toTurns, type ChatTurn } from "./conversation";
import { mockRespond } from "./mock";
import { buildSystemPrompt } from "./prompt";
import { agentTools, SHARE_MEDIA } from "./tools";

/**
 * The agent pipeline, shared by the chat endpoint and the knowledge view:
 *
 *   validated messages → retrieve page sections → system prompt with those
 *   sections → model (or mock router) → optional shareMedia tool calls,
 *   each resolved against the media registry → streamed answer.
 */

const MAX_STEPS = 3;

/** Shown to the customer when the model fails. Details stay in server logs. */
export const MODEL_ERROR_MESSAGE =
  "Sorry, the assistant couldn't get an answer from the AI model just now. Please try again in a moment.";
export const SIMULATED_ERROR_MESSAGE = `${MODEL_ERROR_MESSAGE} (Simulated failure for review.)`;

export type MessageMetadata = {
  mode: AgentConfig["mode"];
  /** Page sections that were passed to the model for this answer. */
  sources: { title: string; url: string }[];
};

type PreparedTurn = {
  config: AgentConfig;
  turns: ChatTurn[];
  query: string;
  context?: string;
  retrieved: RetrievedSection[];
  systemPrompt: string;
};

function prepare(messages: UIMessage[]): PreparedTurn {
  const config = getAgentConfig();
  const turns = toTurns(messages);
  const { query, context } = retrievalQuery(turns);
  const retrieved = retrieve(query, { context, k: 3 });
  return { config, turns, query, context, retrieved, systemPrompt: buildSystemPrompt(retrieved) };
}

function metadataFor(p: PreparedTurn): MessageMetadata {
  const seen = new Set<string>();
  const sources = p.retrieved
    .filter((r) => !seen.has(r.section.url) && seen.add(r.section.url))
    .map((r) => ({ title: r.section.title, url: r.section.url }));
  return { mode: p.config.mode, sources };
}

function logModelError(error: unknown) {
  // Log the message only: provider errors can echo request details.
  const message = error instanceof Error ? error.message : String(error);
  console.error("[agent] model error:", message.slice(0, 500));
}

// ---------------------------------------------------------------------------
// Chat: streamed to assistant-ui
// ---------------------------------------------------------------------------

export async function streamChat(
  messages: UIMessage[],
  options: { simulate?: "model-error"; signal?: AbortSignal } = {},
): Promise<Response> {
  const p = prepare(messages);
  const metadata = metadataFor(p);

  if (options.simulate === "model-error") {
    return createUIMessageStreamResponse({
      stream: createUIMessageStream({
        execute: async ({ writer }) => {
          writer.write({ type: "start", messageMetadata: metadata });
          await pause(400);
          throw new Error("simulated");
        },
        onError: () => SIMULATED_ERROR_MESSAGE,
      }),
    });
  }

  if (p.config.mode === "mock") {
    const reply = mockRespond(p.turns, p.retrieved);
    return createUIMessageStreamResponse({
      stream: createUIMessageStream({
        execute: async ({ writer }) => {
          writer.write({ type: "start", messageMetadata: metadata });
          writer.write({ type: "start-step" });
          await pause(350); // lets the "checking the page" state show briefly
          writer.write({ type: "text-start", id: "t1" });
          for (const chunk of reply.text.match(/\S+\s*/g) ?? []) {
            writer.write({ type: "text-delta", id: "t1", delta: chunk });
            await pause(12);
          }
          writer.write({ type: "text-end", id: "t1" });
          reply.media.forEach((call, i) => {
            const toolCallId = `mock-${i}`;
            writer.write({ type: "tool-input-available", toolCallId, toolName: SHARE_MEDIA, input: call.input });
            writer.write({ type: "tool-output-available", toolCallId, output: call.output });
          });
          writer.write({ type: "finish-step" });
          writer.write({ type: "finish", messageMetadata: metadata });
        },
      }),
    });
  }

  const result = streamText({
    model: google(p.config.model),
    system: p.systemPrompt,
    messages: await convertToModelMessages(messages, { tools: agentTools, ignoreIncompleteToolCalls: true }),
    tools: agentTools,
    stopWhen: stepCountIs(MAX_STEPS),
    temperature: 0.2,
    abortSignal: options.signal,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      tools: agentTools,
      messageMetadata: ({ part }) =>
        part.type === "start" || part.type === "finish" ? metadata : undefined,
      onError: (error) => {
        logModelError(error);
        return MODEL_ERROR_MESSAGE;
      },
    }),
  });
}

// ---------------------------------------------------------------------------
// Trace: the same pipeline, run once and returned as data for the knowledge view
// ---------------------------------------------------------------------------

export type ToolCallTrace = { toolName: string; input: unknown; output: ShareMediaResult | unknown };

export type AgentTrace = {
  question: string;
  ranAt: string;
  durationMs: number;
  mode: AgentConfig["mode"];
  model: string;
  retrieval: {
    query: string;
    results: { id: string; title: string; url: string; score: number; matchedTerms: string[]; text: string }[];
  };
  /** The exact system prompt string sent to the model (or mock router). */
  systemPrompt: string;
  toolCalls: ToolCallTrace[];
  mediaSelected: MediaCard[];
  mediaUnavailable: { requested: string; reason: string }[];
  answer: string;
  mockIntent?: string;
  error?: string;
};

export async function traceQuestion(question: string): Promise<AgentTrace> {
  const started = Date.now();
  const messages: UIMessage[] = [{ id: "trace", role: "user", parts: [{ type: "text", text: question }] }];
  const p = prepare(messages);

  const base = {
    question,
    ranAt: new Date().toISOString(),
    mode: p.config.mode,
    model: p.config.model,
    retrieval: {
      query: p.query,
      results: p.retrieved.map((r) => ({
        id: r.section.id,
        title: r.section.title,
        url: r.section.url,
        score: r.score,
        matchedTerms: r.matchedTerms,
        text: r.section.text,
      })),
    },
    systemPrompt: p.systemPrompt,
  };

  let toolCalls: ToolCallTrace[] = [];
  let answer = "";
  let mockIntent: string | undefined;
  let error: string | undefined;

  if (p.config.mode === "mock") {
    const reply = mockRespond(p.turns, p.retrieved);
    toolCalls = reply.media.map((c) => ({ toolName: SHARE_MEDIA, input: c.input, output: c.output }));
    answer = reply.text;
    mockIntent = reply.intent;
  } else {
    try {
      const result = await generateText({
        model: google(p.config.model),
        system: p.systemPrompt,
        messages: await convertToModelMessages(messages),
        tools: agentTools,
        stopWhen: stepCountIs(MAX_STEPS),
        temperature: 0.2,
      });
      toolCalls = result.steps.flatMap((step) =>
        step.toolResults.map((r) => ({ toolName: r.toolName, input: r.input, output: r.output })),
      );
      answer = result.text;
    } catch (e) {
      logModelError(e);
      error = MODEL_ERROR_MESSAGE;
    }
  }

  const outputs = toolCalls.map((c) => c.output as ShareMediaResult);
  return {
    ...base,
    durationMs: Date.now() - started,
    toolCalls,
    mediaSelected: outputs.flatMap((o) => (o?.status === "available" ? [o.media] : [])),
    mediaUnavailable: outputs.flatMap((o) =>
      o?.status === "unavailable" ? [{ requested: o.requested, reason: o.reason }] : [],
    ),
    answer,
    mockIntent,
    error,
  };
}

function pause(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
