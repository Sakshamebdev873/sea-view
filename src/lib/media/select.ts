import { defaultMedia, getMedia, listMedia, type MediaItem, type MediaType } from "./registry";

/** The subset of a media item the browser needs to render a card. */
export type MediaCard = Pick<
  MediaItem,
  "id" | "type" | "title" | "description" | "url" | "sourceUrl" | "posterUrl" | "origin" | "isDemo" | "mimeType" | "size"
>;

export type ShareMediaResult =
  | { status: "available"; media: MediaCard }
  | {
      status: "unavailable";
      type: MediaType;
      requested: string;
      reason: string;
      /** Real items the customer could have instead. Never invented. */
      alternatives: MediaCard[];
    };

export function toCard(item: MediaItem): MediaCard {
  const { id, type, title, description, url, sourceUrl, posterUrl, origin, isDemo, mimeType, size } = item;
  return { id, type, title, description, url, sourceUrl, posterUrl, origin, isDemo, mimeType, size };
}

export type ShareMediaInput = {
  type: MediaType;
  /** An id from the registry. Omitted means "the default item of this type". */
  mediaId?: string;
  /** What the customer asked for, in their words. Shown when unavailable. */
  requested?: string;
};

/**
 * The single gate between a model decision and a link in the chat.
 * Unknown ids, or ids of the wrong type, resolve to "unavailable" with the
 * real alternatives, so nothing that is not in the registry is ever shown.
 */
export function resolveShareRequest(input: ShareMediaInput): ShareMediaResult {
  const requested = input.requested?.trim() || (input.type === "pdf" ? "a PDF" : "a video");

  if (!input.mediaId) {
    return { status: "available", media: toCard(defaultMedia(input.type)) };
  }

  const item = getMedia(input.mediaId);
  if (!item || item.type !== input.type) {
    return {
      status: "unavailable",
      type: input.type,
      requested,
      reason: item
        ? `"${input.mediaId}" is a ${item.type}, not a ${input.type}.`
        : `There is no ${input.type === "pdf" ? "PDF" : "video"} matching "${requested}" in the website material.`,
      alternatives: listMedia(input.type).map(toCard),
    };
  }
  return { status: "available", media: toCard(item) };
}

/** Builds an explicit "not available" result for something we do not have. */
export function unavailable(type: MediaType, requested: string, reason: string): ShareMediaResult {
  return { status: "unavailable", type, requested, reason, alternatives: listMedia(type).map(toCard) };
}

// ---------------------------------------------------------------------------
// Request detection. Used by mock mode and by tests; the live model decides
// for itself but goes through resolveShareRequest above either way.
// ---------------------------------------------------------------------------

const PDF_WORDS = /\b(brochures?|pdfs?|leaflets?|flyers?|booklets?|documents?|catalogue|catalog)\b/i;
const VIDEO_WORDS = /\b(videos?|films?|clips?|footage|movie|watch|reel)\b/i;
const PACKAGE_WORDS = /\b(eco|deluxe|vip)\b/i;
/** Documents customers ask for that the website does not publish. */
const MISSING_DOCS =
  /\b(waivers?|contracts?|invoices?|receipts?|price ?lists?|itinerar(y|ies)|timetables?|insurance|medical forms?)\b/i;
/** Video subjects the website does not have. */
const MISSING_VIDEO_SUBJECTS = /\b(drone|underwater|night|landing only|safety video|briefing video|360)\b/i;

export type MediaIntent = {
  pdf: boolean;
  video: boolean;
  /** Set when the customer wants something specific we do not have. */
  missingPdf?: string;
  missingVideo?: string;
};

export function detectMediaIntent(message: string): MediaIntent {
  const text = message.toLowerCase();
  const intent: MediaIntent = { pdf: PDF_WORDS.test(text), video: VIDEO_WORDS.test(text) };

  const doc = text.match(MISSING_DOCS);
  const asksForFile = intent.pdf || /\b(send|share|email|download|copy of|attach)\b/.test(text);
  if (doc && asksForFile) {
    intent.pdf = true;
    intent.missingPdf = doc[0];
  } else if (intent.pdf) {
    // The brochure covers all packages. A package-specific brochure
    // ("VIP-only brochure", "the Deluxe brochure") does not exist.
    const pkg = text.match(PACKAGE_WORDS);
    if (pkg && /\b(only|specific|separate|own|dedicated)\b|-only/.test(text)) {
      intent.missingPdf = `${pkg[0].toUpperCase()}-only brochure`;
    } else if (pkg && new RegExp(`${pkg[0]}\\s+(brochure|pdf)`, "i").test(text)) {
      intent.missingPdf = `${pkg[0].toUpperCase()} brochure`;
    }
  }

  const vid = text.match(MISSING_VIDEO_SUBJECTS);
  if (intent.video && vid) intent.missingVideo = `${vid[0]} video`;

  return intent;
}
