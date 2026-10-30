import { tool, zodSchema } from "ai";
import { z } from "zod";
import { resolveShareRequest } from "@/lib/media/select";

export const SHARE_MEDIA = "shareMedia";

export const shareMediaInput = z.object({
  type: z.enum(["pdf", "video"]).describe('"pdf" for the brochure, "video" for a film'),
  mediaId: z
    .string()
    .max(64)
    .optional()
    .describe("An id from the MEDIA list. Omit to use the default item for the type."),
  requested: z
    .string()
    .max(200)
    .optional()
    .describe("What the customer asked for, in a few of their own words"),
});

export type ShareMediaToolInput = z.infer<typeof shareMediaInput>;

/**
 * The model's only way to put a file in the chat. `execute` runs on the
 * server and returns a registry entry (or an "unavailable" result), which the
 * client renders as a PDF card or video player.
 */
export const agentTools = {
  [SHARE_MEDIA]: tool({
    description:
      "Show the customer a PDF or video from the Sea View media list, rendered as a card in the chat.",
    inputSchema: zodSchema(shareMediaInput),
    execute: async (input) => resolveShareRequest(input),
  }),
};
