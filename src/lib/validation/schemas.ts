import { z } from "zod";

const MAX_MESSAGES = 40;
export const MAX_USER_TEXT = 1000;

const PartSchema = z.looseObject({ type: z.string().max(64) });

const MessageSchema = z.looseObject({
  id: z.string().max(128),
  role: z.enum(["user", "assistant"]),
  parts: z.array(PartSchema).max(40),
});

/**
 * Body sent by the assistant-ui chat transport. Only `messages` is used.
 * The transport may also send `system` and `tools`; those are ignored on
 * purpose so a browser can never rewrite the system prompt or add tools.
 */
export const ChatRequestSchema = z
  .looseObject({
    messages: z.array(MessageSchema).min(1).max(MAX_MESSAGES),
    /** Reviewer switch to rehearse a model failure (see README). */
    simulate: z.enum(["model-error"]).optional(),
  })
  .superRefine((body, ctx) => {
    const last = body.messages.at(-1);
    if (last?.role !== "user") {
      ctx.addIssue({ code: "custom", message: "The last message must come from the user." });
    }
    body.messages.forEach((m, i) => {
      if (m.role !== "user") return;
      for (const part of m.parts) {
        if (part.type !== "text") {
          ctx.addIssue({ code: "custom", path: ["messages", i], message: "Only text messages are accepted." });
        } else if (typeof part.text !== "string" || part.text.length > MAX_USER_TEXT) {
          ctx.addIssue({
            code: "custom",
            path: ["messages", i],
            message: `Messages must be text of at most ${MAX_USER_TEXT} characters.`,
          });
        }
      }
    });
  });

export const TraceRequestSchema = z.object({
  question: z.string().trim().min(1, "Type a question.").max(MAX_USER_TEXT),
});

/** One readable line for a 400 response. Never echoes the input back. */
export function describeIssues(error: z.ZodError): string {
  return error.issues.map((i) => i.message).slice(0, 3).join(" ");
}
