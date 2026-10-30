import { connection } from "next/server";
import { getAgentConfig } from "@/lib/agent/config";
import { sections, snapshot } from "@/lib/knowledge/source";
import { MEDIA } from "@/lib/media/registry";

/**
 * Read-only view of everything the assistant knows: the captured source page,
 * its sections, and the media registry. Public website and demo content only.
 */
export async function GET() {
  await connection(); // report the mode of the running server, not the build
  const agent = getAgentConfig();
  return Response.json({
    agent: { mode: agent.mode, model: agent.model },
    sources: [
      {
        id: snapshot.id,
        title: snapshot.title,
        url: snapshot.url,
        capturedAt: snapshot.capturedAt,
        captureMethod: snapshot.captureMethod,
        sections: sections.map(({ id, title, url, text }) => ({ id, title, url, text })),
      },
    ],
    media: MEDIA.map(({ id, type, title, description, url, sourceUrl, isDemo, size, tags }) => ({
      id, type, title, description, url, sourceUrl, isDemo, size, tags,
    })),
  });
}
