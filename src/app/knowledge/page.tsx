import type { Metadata } from "next";
import { KnowledgeView } from "./KnowledgeView";

export const metadata: Metadata = {
  title: "Knowledge view — Sea View concierge",
  description: "Read-only view of the sources, media and live agent traces behind the Sea View concierge.",
};

export default function KnowledgePage() {
  return <KnowledgeView />;
}
