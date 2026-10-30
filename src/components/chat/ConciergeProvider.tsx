"use client";

import { AssistantRuntimeProvider, useAui } from "@assistant-ui/react";
import { AssistantChatTransport, useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { AgentMode } from "./types";

type ConciergeState = {
  open: boolean;
  setOpen: (open: boolean) => void;
  mode: AgentMode;
};

const ConciergeContext = createContext<ConciergeState | null>(null);

/**
 * Reviewer switch: opening the page with `?simulate=model-error` makes the
 * server answer with a model failure, so the error state can be checked
 * without breaking the real API key. Read at send time, never stored.
 */
function simulateFlag(): { simulate?: string } {
  if (typeof window === "undefined") return {};
  const value = new URLSearchParams(window.location.search).get("simulate");
  return value === "model-error" ? { simulate: value } : {};
}

/**
 * Holds the chat runtime for the whole page, so any "Ask the dropzone"
 * button can open the assistant. The thread lives in the browser and the
 * full history is sent with every turn; nothing is stored on the server.
 */
export function ConciergeProvider({ mode, children }: { mode: AgentMode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const transport = useMemo(() => new AssistantChatTransport({ api: "/api/chat", body: simulateFlag }), []);
  const runtime = useChatRuntime({ transport });
  const value = useMemo(() => ({ open, setOpen, mode }), [open, mode]);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ConciergeContext.Provider value={value}>{children}</ConciergeContext.Provider>
    </AssistantRuntimeProvider>
  );
}

export function useConcierge() {
  const ctx = useContext(ConciergeContext);
  if (!ctx) throw new Error("useConcierge must be used inside <ConciergeProvider>");
  const aui = useAui();
  const { setOpen } = ctx;

  /** Opens the assistant and, if given, sends a question straight away. */
  const ask = useCallback(
    (question?: string) => {
      setOpen(true);
      if (question) aui.thread().append(question);
    },
    [aui, setOpen],
  );

  return { ...ctx, ask };
}
