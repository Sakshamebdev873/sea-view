import { traceQuestion } from "@/lib/agent/run";
import { describeIssues, TraceRequestSchema } from "@/lib/validation/schemas";

export const maxDuration = 30;

/**
 * Runs one test question through the real agent pipeline and returns what
 * happened: the sections retrieved, the exact prompt text given to the model,
 * the tool calls it made and the media the server resolved. Nothing is stored.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "The request body must be JSON." }, { status: 400 });
  }
  const parsed = TraceRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: describeIssues(parsed.error) }, { status: 400 });
  }
  return Response.json(await traceQuestion(parsed.data.question));
}
