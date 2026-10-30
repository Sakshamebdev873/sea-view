// Client-side mirrors of server types. Imported as types only, so no server
// code (or secret) can end up in the browser bundle.
export type { AgentMode } from "@/lib/agent/config";
export type { MessageMetadata } from "@/lib/agent/run";
export type { MediaCard, ShareMediaResult } from "@/lib/media/select";
export type { ShareMediaToolInput } from "@/lib/agent/tools";
