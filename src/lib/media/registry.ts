/**
 * Every PDF and video the assistant is allowed to share. The model can only
 * refer to items by `id`; the server resolves ids here, so a hallucinated or
 * tampered id can never turn into a link.
 */

export type MediaType = "pdf" | "video";

export type MediaOrigin =
  /** Copied from greedyadventures.com. */
  | "website"
  /** A simple sample we made from the page facts. Must be labelled. */
  | "demo";

export type MediaItem = {
  id: string;
  type: MediaType;
  title: string;
  description: string;
  /** Same-origin path served from /public. */
  url: string;
  /** Where the original lives, for the "open on website" link. */
  sourceUrl: string;
  posterUrl?: string;
  origin: MediaOrigin;
  /** Rendered as the "Demo material" badge whenever origin is demo. */
  isDemo: boolean;
  mimeType: "application/pdf" | "video/mp4";
  /** Human-readable size shown on the card. */
  size: string;
  /** Words a customer might use to ask for this item. */
  tags: string[];
  /** Used when the customer asks for "a video" or "a brochure" in general. */
  isDefaultForType: boolean;
};

const PAGE_URL = "https://www.greedyadventures.com/experiences/sea-view-skydiving";

export const MEDIA: readonly MediaItem[] = [
  {
    id: "brochure-sea-view",
    type: "pdf",
    title: "Sea View Skydiving brochure",
    description:
      "Two-page sample brochure built from the captured page: packages, prices, the plan and location.",
    url: "/media/sea-view-brochure-demo.pdf",
    sourceUrl: PAGE_URL,
    posterUrl: "/media/sea-view-brochure-cover.jpg",
    origin: "demo",
    isDemo: true,
    mimeType: "application/pdf",
    size: "2 pages",
    tags: ["brochure", "pdf", "leaflet", "flyer", "packages", "prices", "overview", "document"],
    isDefaultForType: true,
  },
  {
    id: "video-main-jump",
    type: "video",
    title: "Main video of the jump",
    description:
      "The page's main film: aircraft exit and freefall over the Gulf of Thailand.",
    url: "/media/sea-view-film.mp4",
    sourceUrl: PAGE_URL,
    posterUrl: "/media/sea-view-film-poster.jpg",
    origin: "website",
    isDemo: false,
    mimeType: "video/mp4",
    size: "12.8 MB",
    tags: ["video", "film", "jump", "freefall", "main", "experience", "watch"],
    isDefaultForType: true,
  },
  {
    id: "video-customer-clip",
    type: "video",
    title: "Customer clip",
    description:
      "A short vertical clip from a real customer's jump, from the page's \"A glimpse of the jump\" gallery.",
    url: "/media/customer-clip.mp4",
    sourceUrl: `${PAGE_URL}#customer-clips`,
    posterUrl: "/media/customer-clip-poster.jpg",
    origin: "website",
    isDemo: false,
    mimeType: "video/mp4",
    size: "6.9 MB",
    tags: ["video", "clip", "customer", "real", "vertical", "deluxe", "vip", "footage"],
    isDefaultForType: false,
  },
] as const;

export function getMedia(id: string): MediaItem | undefined {
  return MEDIA.find((m) => m.id === id);
}

export function listMedia(type?: MediaType): MediaItem[] {
  return MEDIA.filter((m) => !type || m.type === type);
}

export function defaultMedia(type: MediaType): MediaItem {
  const item = MEDIA.find((m) => m.type === type && m.isDefaultForType);
  if (!item) throw new Error(`No default ${type} in the media registry`);
  return item;
}
