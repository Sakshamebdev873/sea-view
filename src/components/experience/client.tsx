"use client";

import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { useConcierge } from "@/components/chat/ConciergeProvider";

/** Any button on the page that opens the assistant, optionally with a question. */
export function AskButton({
  question,
  children,
  ...props
}: { question?: string; children: ReactNode } & Omit<ComponentProps<"button">, "onClick" | "type">) {
  const { ask } = useConcierge();
  return (
    <button type="button" onClick={() => ask(question)} {...props}>
      {children}
    </button>
  );
}

/**
 * Fades sections in as they scroll into view. Content stays visible without
 * JavaScript and with reduced motion; this only adds the effect.
 */
export function RevealOnScroll() {
  useEffect(() => {
    const root = document.documentElement;
    const items = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!("IntersectionObserver" in window)) return;
    root.classList.add("reveal-ready");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-shown", "");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    items.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      root.classList.remove("reveal-ready");
    };
  }, []);
  return null;
}

/**
 * A muted, looping film that plays while on screen and pauses off screen.
 * Never autoplays for people who prefer reduced motion; controls stay visible.
 */
export function AmbientVideo(props: ComponentProps<"video">) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} muted loop playsInline controls preload="none" {...props} />;
}
