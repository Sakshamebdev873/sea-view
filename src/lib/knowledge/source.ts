import { z } from "zod";
import raw from "./snapshot.json";

/**
 * The knowledge base is one captured snapshot of the public Sea View Skydiving
 * page. It is validated once at import time so a malformed edit to the JSON
 * fails loudly instead of silently feeding the model bad context.
 */
const SectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  anchor: z.string(),
  /** Retrieval hints only. They are never passed to the model as facts. */
  keywords: z.array(z.string()),
  text: z.string().min(1),
});

const SnapshotSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.url(),
  capturedAt: z.iso.date(),
  captureMethod: z.string(),
  sections: z.array(SectionSchema).min(1),
});

type Snapshot = z.infer<typeof SnapshotSchema>;

export type KnowledgeSection = z.infer<typeof SectionSchema> & {
  /** Deep link to the section on the live page, used for citations. */
  url: string;
};

export const snapshot: Snapshot = SnapshotSchema.parse(raw);

export const sections: KnowledgeSection[] = snapshot.sections.map((s) => ({
  ...s,
  url: s.anchor ? `${snapshot.url}#${s.anchor}` : snapshot.url,
}));

export function getSection(id: string): KnowledgeSection | undefined {
  return sections.find((s) => s.id === id);
}
