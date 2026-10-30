"use client";

import type { ToolCallMessagePartComponent } from "@assistant-ui/react";
import { MediaError, MediaLoading, PdfCard, UnavailableCard, VideoCard } from "./MediaCards";
import type { ShareMediaResult, ShareMediaToolInput } from "./types";

/**
 * assistant-ui Tool UI for the server's `shareMedia` tool. The model decides
 * *whether* to share; the server decides *what* (registry lookup); this
 * component only chooses how each result state looks.
 */
export const ShareMediaTool: ToolCallMessagePartComponent<ShareMediaToolInput, ShareMediaResult> = ({
  args,
  result,
  status,
  isError,
}) => {
  if (isError || status.type === "incomplete") return <MediaError />;
  if (!result) return <MediaLoading type={args?.type} />;
  if (result.status === "unavailable") return <UnavailableCard result={result} />;
  return result.media.type === "pdf" ? <PdfCard media={result.media} /> : <VideoCard media={result.media} />;
};
