"use client";

import {
  ActionBarPrimitive,
  AuiIf,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAuiState,
} from "@assistant-ui/react";
import { MarkdownText } from "./MarkdownText";
import { ShareMediaTool } from "./ShareMediaTool";
import type { MessageMetadata } from "./types";

/** The four questions from the brief, offered as one-tap starters. */
const STARTERS = [
  "What is included in the package?",
  "Can you send me a brochure?",
  "Can I see a video of the experience?",
  "Send me the brochure and a video.",
];

export function Thread() {
  return (
    <ThreadPrimitive.Root className="flex h-full min-h-0 flex-col">
      <ThreadPrimitive.Viewport
        className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-5 pt-5 pb-3 [scrollbar-color:var(--color-forest-line)_transparent]"
        aria-label="Conversation"
      >
        <AuiIf condition={(s) => s.thread.isEmpty}>
          <Welcome />
        </AuiIf>
        <div role="log" aria-live="polite" aria-relevant="additions" className="flex flex-col gap-5">
          <ThreadPrimitive.Messages components={{ UserMessage, AssistantMessage }} />
        </div>
      </ThreadPrimitive.Viewport>
      <Composer />
    </ThreadPrimitive.Root>
  );
}

function Welcome() {
  return (
    <div className="flex flex-col gap-5 pt-2">
      <p className="m-0 font-serif text-[26px] leading-[1.1] text-foam">
        Ask anything about the jump, <em className="text-gold">or ask for the brochure and the film.</em>
      </p>
      <p className="m-0 text-[13px] leading-relaxed text-sage">
        Answers come only from the Sea View Skydiving page, with a link to where each fact is.
      </p>
      <ul className="m-0 flex list-none flex-col gap-2 p-0" aria-label="Suggested questions">
        {STARTERS.map((prompt) => (
          <li key={prompt}>
            <ThreadPrimitive.Suggestion
              prompt={prompt}
              send
              className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-forest-line px-4 py-2.5 text-left text-[14px] text-mist transition-colors hover:border-sage hover:text-foam"
            >
              {prompt}
              <span aria-hidden="true" className="text-gold">→</span>
            </ThreadPrimitive.Suggestion>
          </li>
        ))}
      </ul>
    </div>
  );
}

function UserMessage() {
  return (
    <MessagePrimitive.Root className="flex justify-end">
      <div className="max-w-[85%] rounded-[18px] rounded-br-md bg-forest px-4 py-2.5 text-[15px] leading-normal break-words text-foam">
        <span className="sr-only">You said: </span>
        <MessagePrimitive.Parts />
      </div>
    </MessagePrimitive.Root>
  );
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="flex flex-col gap-3 text-mist">
      <span className="sr-only">The dropzone assistant said: </span>
      <Thinking />
      <MessagePrimitive.Parts
        components={{
          Text: MarkdownText,
          tools: { by_name: { shareMedia: ShareMediaTool }, Fallback: () => null },
        }}
      />
      <MessagePrimitive.Error>
        <ErrorPrimitive.Root role="alert" className="flex flex-col items-start gap-3 rounded-2xl border border-[#8c4a3c] bg-[#2a1d18]/40 p-3.5">
          <ErrorPrimitive.Message className="text-[14px] leading-normal text-foam" />
          <ActionBarPrimitive.Root>
            <ActionBarPrimitive.Reload className="inline-flex min-h-11 items-center rounded-full bg-foam px-4 text-[13px] font-medium text-ink hover:bg-white">
              Try again
            </ActionBarPrimitive.Reload>
          </ActionBarPrimitive.Root>
        </ErrorPrimitive.Root>
      </MessagePrimitive.Error>
      <Sources />
    </MessagePrimitive.Root>
  );
}

/** Loading state shown until the first words of an answer arrive. */
function Thinking() {
  const waiting = useAuiState((s) => s.message.status?.type === "running" && s.message.parts.length === 0);
  if (!waiting) return null;
  return (
    <div role="status" className="flex items-center gap-2.5 text-[13px] text-sage">
      <span aria-hidden="true" className="flex gap-1">
        <span className="size-1.5 animate-pulse rounded-full bg-gold" />
        <span className="size-1.5 animate-pulse rounded-full bg-gold [animation-delay:150ms]" />
        <span className="size-1.5 animate-pulse rounded-full bg-gold [animation-delay:300ms]" />
      </span>
      Checking the Sea View page…
    </div>
  );
}

/**
 * The page sections retrieved for this answer, sent by the server as message
 * metadata. Deterministic, so a source link is shown even if the model
 * forgets to cite inline.
 */
function Sources() {
  const sources = useAuiState((s) => (s.message.metadata.custom as Partial<MessageMetadata>).sources);
  const done = useAuiState((s) => s.message.status?.type === "complete");
  const isError = useAuiState((s) => s.message.status?.type === "incomplete");
  if (!done || isError || !sources?.length) return null;
  return (
    <details className="group text-[12px] text-sage">
      <summary className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 hover:text-foam">
        <span aria-hidden="true" className="transition-transform group-open:rotate-90">›</span>
        Sections checked on the page ({sources.length})
      </summary>
      <ul className="m-0 mt-1 flex list-none flex-col gap-1 p-0 pl-4">
        {sources.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-mist underline underline-offset-2 hover:text-gold">
              {s.title}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

function Composer() {
  return (
    <ComposerPrimitive.Root className="px-3 pt-1 pb-3">
      <div className="flex items-end gap-2 rounded-[26px] border border-forest-line bg-[#0b1c17] py-1.5 pr-1.5 pl-4 focus-within:border-sage">
        <label htmlFor="concierge-input" className="sr-only">
          Message the dropzone assistant
        </label>
        <ComposerPrimitive.Input
          id="concierge-input"
          rows={1}
          maxLength={1000}
          autoFocus
          placeholder="Ask about the jump…"
          submitMode="enter"
          className="max-h-32 min-h-11 flex-1 resize-none bg-transparent py-3 text-[15px] leading-5 text-foam placeholder:text-sage focus:outline-none"
        />
        <AuiIf condition={(s) => !s.thread.isRunning}>
          <ComposerPrimitive.Send
            aria-label="Send message"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold text-ink transition-opacity disabled:opacity-40"
          >
            <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M6 11l6-6 6 6" />
            </svg>
          </ComposerPrimitive.Send>
        </AuiIf>
        <AuiIf condition={(s) => s.thread.isRunning}>
          <ComposerPrimitive.Cancel
            aria-label="Stop answering"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-sage text-foam"
          >
            <span aria-hidden="true" className="size-3 rounded-[2px] bg-current" />
          </ComposerPrimitive.Cancel>
        </AuiIf>
      </div>
    </ComposerPrimitive.Root>
  );
}
