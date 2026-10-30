"use client";

import { AssistantModalPrimitive, ThreadListPrimitive } from "@assistant-ui/react";
import Link from "next/link";
import { useConcierge } from "./ConciergeProvider";
import { Thread } from "./Thread";

/**
 * The floating "Ask the dropzone" assistant: assistant-ui's AssistantModal
 * primitive (a Radix popover: Esc closes, focus returns to the trigger),
 * styled for the page and controlled so page buttons can open it too.
 */
export function Concierge() {
  const { open, setOpen, mode } = useConcierge();

  return (
    <AssistantModalPrimitive.Root open={open} onOpenChange={setOpen}>
      <AssistantModalPrimitive.Anchor className="fixed right-[max(16px,env(safe-area-inset-right))] bottom-[max(16px,env(safe-area-inset-bottom))] z-40 sm:right-6 sm:bottom-6">
        <AssistantModalPrimitive.Trigger
          aria-label={open ? "Close the dropzone assistant" : "Open the dropzone assistant"}
          className="group inline-flex min-h-14 items-center gap-3 rounded-full border border-gold bg-ink p-2 font-sans sm:pr-5 text-[15px] font-medium text-foam shadow-[0_14px_36px_rgba(16,36,30,0.38)] transition-transform duration-300 ease-[var(--ease-editorial)] hover:-translate-y-0.5"
        >
          <span aria-hidden="true" className="relative flex size-10 items-center justify-center rounded-full bg-gold text-ink">
            <span className={`font-serif text-[21px] italic transition-all duration-300 ${open ? "scale-50 opacity-0" : ""}`}>G</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={`absolute transition-all duration-300 ${open ? "" : "scale-50 opacity-0"}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
          <span aria-hidden="true" className="hidden sm:inline">
            {open ? "Close" : "Ask the dropzone"}
          </span>
        </AssistantModalPrimitive.Trigger>
      </AssistantModalPrimitive.Anchor>

      <AssistantModalPrimitive.Content
        side="top"
        align="end"
        sideOffset={14}
        collisionPadding={12}
        aria-label="Dropzone assistant"
        className="z-50 flex h-[min(700px,calc(100dvh-104px))] w-[min(440px,calc(100vw-24px))] flex-col overflow-hidden rounded-[22px] border border-forest-line bg-ink text-foam shadow-[0_30px_80px_rgba(6,16,13,0.55)] outline-none data-[state=open]:animate-[rise_0.45s_var(--ease-editorial)]"
      >
        <header className="flex items-start justify-between gap-2 border-b border-forest-line py-3.5 pr-2 pl-5">
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="m-0 font-serif text-[24px] leading-none font-normal">The dropzone</h2>
            <p className="m-0 flex flex-wrap items-center gap-2 text-[12px] text-sage">
              Answers from the Sea View Skydiving page
              <ModeBadge mode={mode} />
            </p>
          </div>
          <div className="flex shrink-0">
            <ThreadListPrimitive.New
              aria-label="Start a new conversation"
              title="New conversation"
              className="flex size-11 items-center justify-center rounded-full text-mist hover:bg-forest hover:text-foam"
            >
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </ThreadListPrimitive.New>
            <button
              type="button"
              aria-label="Close the dropzone assistant"
              onClick={() => setOpen(false)}
              className="flex size-11 items-center justify-center rounded-full text-mist hover:bg-forest hover:text-foam"
            >
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </header>
        <div className="min-h-0 flex-1">
          <Thread />
        </div>
        <p className="m-0 border-t border-forest-line px-5 py-2 text-[11px] text-sage">
          Prototype. No bookings are made here.{" "}
          <Link href="/knowledge" className="text-mist underline underline-offset-2 hover:text-gold">
            See what it knows
          </Link>
        </p>
      </AssistantModalPrimitive.Content>
    </AssistantModalPrimitive.Root>
  );
}

function ModeBadge({ mode }: { mode: "live" | "mock" }) {
  if (mode === "live") {
    return (
      <span className="rounded-[4px] border border-forest-line px-1.5 py-px text-[10px] tracking-[0.1em] text-mist">
        LIVE · GEMINI
      </span>
    );
  }
  return (
    <span
      title="No AI key is configured, so a scripted router answers from the same page data."
      className="rounded-[4px] border border-gold px-1.5 py-px text-[10px] tracking-[0.1em] text-gold"
    >
      MOCK MODE
    </span>
  );
}
