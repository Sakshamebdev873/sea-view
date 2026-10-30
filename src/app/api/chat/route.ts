import type { UIMessage } from "ai";
import { streamChat } from "@/lib/agent/run";
import { ChatRequestSchema, describeIssues } from "@/lib/validation/schemas";

// Live model answers usually take a few seconds; allow for slow tool steps.
export const maxDuration = 30;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "The request body must be JSON." }, { status: 400 });
  }

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: describeIssues(parsed.error) }, { status: 400 });
  }

  // Only the validated messages go further; the shape was checked above.
  const messages = parsed.data.messages as unknown as UIMessage[];
  return streamChat(messages, { simulate: parsed.data.simulate, signal: req.signal });
}
