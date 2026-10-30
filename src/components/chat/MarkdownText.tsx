"use client";

import { MarkdownTextPrimitive, memoizeMarkdownComponents } from "@assistant-ui/react-markdown";
import { memo } from "react";
import remarkGfm from "remark-gfm";

/** Hosts the assistant may link to. Anything else renders as plain text. */
const ALLOWED_HOSTS = new Set(["www.greedyadventures.com", "greedyadventures.com", "instagram.com"]);

export function safeHref(href: string | undefined): string | null {
  if (!href) return null;
  if (href.startsWith("/") && !href.startsWith("//")) return href; // same-origin path
  try {
    const url = new URL(href);
    return url.protocol === "https:" && ALLOWED_HOSTS.has(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}

/*
 * react-markdown never renders raw HTML (no rehype-raw), so model output
 * cannot inject markup. Links are additionally limited to an allowlist and
 * open in a new tab without access to this window.
 */
const components = memoizeMarkdownComponents({
  a: ({ href, children }) => {
    const safe = safeHref(href);
    if (!safe) return <span>{children}</span>;
    const external = !safe.startsWith("/");
    return (
      <a href={safe} {...(external && { target: "_blank", rel: "noopener noreferrer" })}>
        {children}
        {external && <span className="sr-only"> (opens in a new tab)</span>}
      </a>
    );
  },
  img: () => null,
  h1: ({ children }) => <p><strong>{children}</strong></p>,
  h2: ({ children }) => <p><strong>{children}</strong></p>,
  h3: ({ children }) => <p><strong>{children}</strong></p>,
});

function MarkdownTextImpl() {
  return <MarkdownTextPrimitive remarkPlugins={[remarkGfm]} className="chat-md" components={components} />;
}

export const MarkdownText = memo(MarkdownTextImpl);
