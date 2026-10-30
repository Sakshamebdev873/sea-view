"use client";

import { useAui } from "@assistant-ui/react";
import { useId, useState } from "react";
import type { MediaCard, ShareMediaResult } from "./types";

/* Cards the shareMedia tool renders inside the chat. Pure presentation:
   every URL here came from the server-side media registry. */

function DemoBadge() {
  return (
    <span className="inline-flex items-center rounded-[4px] border border-gold px-1.5 py-0.5 text-[10px] font-medium tracking-[0.12em] text-gold">
      DEMO MATERIAL
    </span>
  );
}

function SourceBadge() {
  return <span className="text-[11px] text-sage">From greedyadventures.com</span>;
}

export function PdfCard({ media }: { media: MediaCard }) {
  const [preview, setPreview] = useState(false);
  const previewId = useId();

  return (
    <figure className="m-0 overflow-hidden rounded-2xl border border-forest-line bg-ink">
      <div className="flex gap-4 p-3">
        {media.posterUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- small static thumbnail
          <img
            src={media.posterUrl}
            alt=""
            width={66}
            height={94}
            className="h-[94px] w-[66px] shrink-0 rounded-[4px] object-cover shadow-[0_6px_18px_rgba(0,0,0,0.35)]"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
          <div className="flex flex-col gap-1">
            <figcaption className="font-serif text-[20px] leading-[1.1] text-foam">{media.title}</figcaption>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-sage">
              <span>PDF · {media.size}</span>
              {media.isDemo ? <DemoBadge /> : <SourceBadge />}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={media.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-full bg-foam px-4 text-[13px] font-medium text-ink transition-colors hover:bg-white"
            >
              Open<span className="sr-only"> {media.title} in a new tab</span>
            </a>
            <a
              href={media.url}
              download
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-sage/50 px-4 text-[13px] text-foam transition-colors hover:border-foam"
            >
              <DownloadIcon />
              Download<span className="sr-only"> {media.title}</span>
            </a>
            <button
              type="button"
              aria-expanded={preview}
              aria-controls={previewId}
              onClick={() => setPreview((p) => !p)}
              className="hidden min-h-11 items-center px-2 text-[13px] text-sage underline-offset-4 hover:text-foam hover:underline sm:inline-flex"
            >
              {preview ? "Hide preview" : "Preview"}
            </button>
          </div>
        </div>
      </div>
      {preview && (
        <iframe
          id={previewId}
          src={`${media.url}#view=FitH&toolbar=0`}
          title={`Preview of ${media.title}`}
          className="block h-[380px] w-full border-t border-forest-line bg-paper"
        />
      )}
    </figure>
  );
}

export function VideoCard({ media }: { media: MediaCard }) {
  const vertical = media.id === "video-customer-clip";
  return (
    <figure className="m-0 overflow-hidden rounded-2xl border border-forest-line bg-ink">
      <div className="flex justify-center bg-black">
        <video
          src={media.url}
          poster={media.posterUrl}
          controls
          playsInline
          preload="metadata"
          aria-label={media.title}
          className={vertical ? "aspect-[9/16] max-h-[420px] w-auto" : "aspect-video w-full"}
        />
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-3">
        <span className="flex flex-col gap-0.5">
          <span className="font-serif text-[18px] leading-tight text-foam">{media.title}</span>
          <span className="text-[11px] text-sage">
            Video · {media.size} · {media.isDemo ? "Demo material" : "from greedyadventures.com"}
          </span>
        </span>
        <a
          href={media.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center text-[13px] text-gold underline-offset-4 hover:underline"
        >
          Watch on the website ↗<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </figcaption>
    </figure>
  );
}

export function UnavailableCard({ result }: { result: Extract<ShareMediaResult, { status: "unavailable" }> }) {
  const aui = useAui();
  return (
    <div role="note" className="flex flex-col gap-2 rounded-2xl border border-dashed border-sage/50 p-3.5">
      <span className="eyebrow !text-[10px] text-sage">Not available</span>
      <p className="m-0 font-serif text-[18px] leading-tight text-foam">{result.requested}</p>
      <p className="m-0 text-[13px] leading-normal text-mist">{result.reason}</p>
      {result.alternatives.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {result.alternatives.map((alt) => (
            <button
              key={alt.id}
              type="button"
              onClick={() => aui.thread().append(`Send me the ${alt.title.toLowerCase()}.`)}
              className="inline-flex min-h-11 items-center rounded-full border border-sage/50 px-4 text-[13px] text-foam hover:border-foam"
            >
              Send the {alt.title.toLowerCase()} instead
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function MediaLoading({ type }: { type?: "pdf" | "video" }) {
  return (
    <div role="status" className="flex items-center gap-3 rounded-2xl border border-forest-line p-3.5 text-[13px] text-sage">
      <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-gold" />
      {type === "video" ? "Finding the video…" : type === "pdf" ? "Preparing the brochure…" : "Preparing the file…"}
    </div>
  );
}

export function MediaError() {
  return (
    <div role="alert" className="rounded-2xl border border-[#8c4a3c] p-3.5 text-[13px] text-mist">
      The file couldn&apos;t be loaded. Please ask again, or use the links on the page.
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </svg>
  );
}
