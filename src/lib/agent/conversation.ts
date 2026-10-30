import type { UIMessage } from "ai";

export type ChatTurn = { role: "user" | "assistant"; text: string };

/** Plain-text view of the thread, used for retrieval and mock mode. */
export function toTurns(messages: UIMessage[]): ChatTurn[] {
  return messages
    .filter((m): m is UIMessage & { role: "user" | "assistant" } => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role,
      text: m.parts
        .map((p) => (p.type === "text" ? p.text : ""))
        .join(" ")
        .trim(),
    }))
    .filter((t) => t.text.length > 0);
}

/**
 * The retrieval query for this turn: the latest question, plus the previous
 * user question as lower-weighted context so short follow-ups ("and the VIP
 * one?") still find the right section.
 */
export function retrievalQuery(turns: ChatTurn[]): { query: string; context?: string } {
  const users = turns.filter((t) => t.role === "user");
  const query = users.at(-1)?.text ?? "";
  const context = users.length > 1 ? users.at(-2)?.text : undefined;
  return { query, context };
}
