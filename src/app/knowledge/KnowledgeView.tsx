"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { AgentTrace } from "@/lib/agent/run";

/*
 * Read-only knowledge view. Everything here is fetched from the backend:
 * GET /api/knowledge for sources and media, POST /api/knowledge/trace to run
 * a test question through the real agent pipeline. No editing, no uploads.
 */

type KnowledgeData = {
  agent: { mode: "live" | "mock"; model: string };
  sources: {
    id: string;
    title: string;
    url: string;
    capturedAt: string;
    captureMethod: string;
    sections: { id: string; title: string; url: string; text: string }[];
  }[];
  media: {
    id: string;
    type: "pdf" | "video";
    title: string;
    description: string;
    url: string;
    sourceUrl: string;
    origin: "website" | "demo";
    isDemo: boolean;
    size: string;
    tags: string[];
  }[];
};

const SAMPLE_QUESTIONS = [
  "What is included in the package?",
  "Can you send me a brochure?",
  "Can I see a video of the experience?",
  "Send me the brochure and a video.",
  "What's the weight limit?",
  "Send me the VIP-only brochure",
];

const mono = "font-mono text-[12.5px]";

export function KnowledgeView() {
  const [data, setData] = useState<KnowledgeData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/knowledge", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setData)
      .catch((e: Error) => {
        if (e.name !== "AbortError") setLoadError("Couldn't load the knowledge base from the server. Refresh to try again.");
      });
    return () => ctrl.abort();
  }, []);

  return (
    <div className="min-h-screen pb-24">
      <header className="border-b border-line bg-paper-deep">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/" className="text-[14px] underline underline-offset-4 hover:text-forest">
              ← Back to the demo
            </Link>
            <h1 className="m-0 font-serif text-[32px] leading-none font-normal">Knowledge view</h1>
            <Badge>READ-ONLY</Badge>
            {data && <Badge tone={data.agent.mode === "mock" ? "warn" : "ok"}>{data.agent.mode === "mock" ? "MOCK MODE" : `LIVE · ${data.agent.model}`}</Badge>}
          </div>
          <p className="m-0 text-[13px] text-muted">Public website and demo content only. No keys, no customer chats.</p>
        </div>
        <nav aria-label="Knowledge sections" className="mx-auto flex max-w-[1200px] flex-wrap gap-1 px-2 sm:px-4">
          {[
            ["#sources", "Sources"],
            ["#media", "Media"],
            ["#trace", "Test a question"],
          ].map(([href, label]) => (
            <a key={href} href={href} className="inline-flex min-h-11 items-center px-3 text-[14px] font-medium text-muted hover:text-ink">
              {label}
            </a>
          ))}
        </nav>
      </header>

      <main className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 pt-8 sm:px-6">
        {loadError && <Alert>{loadError}</Alert>}
        {!data && !loadError && <p role="status" className="text-muted">Loading the knowledge base…</p>}
        {data && (
          <>
            <Sources sources={data.sources} />
            <Media media={data.media} />
          </>
        )}
        <TraceRunner />
      </main>
    </div>
  );
}

function Sources({ sources }: { sources: KnowledgeData["sources"] }) {
  return (
    <Panel id="sources" title="Website sources" aside={`${sources.length} page · captured once, no crawler`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-[14px]">
          <thead>
            <tr className="bg-paper text-muted">
              <th scope="col" className="px-5 py-3 font-medium">Page title</th>
              <th scope="col" className="px-5 py-3 font-medium">URL</th>
              <th scope="col" className="px-5 py-3 font-medium">Captured</th>
              <th scope="col" className="px-5 py-3 font-medium">Sections</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.id} className="border-t border-line align-top">
                <td className="px-5 py-4 font-medium">{s.title}</td>
                <td className={`px-5 py-4 ${mono}`}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 break-all">
                    {s.url.replace("https://", "")}
                  </a>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <time dateTime={s.capturedAt}>{s.capturedAt}</time>
                </td>
                <td className="px-5 py-4">{s.sections.map((x) => x.title).join(" · ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sources.map((s) => (
        <div key={s.id} className="border-t border-line px-5 py-4">
          <p className="m-0 mb-3 text-[13px] text-muted">{s.captureMethod} Usable text, as given to the assistant:</p>
          <div className="flex flex-col gap-2">
            {s.sections.map((sec) => (
              <details key={sec.id} className="rounded-lg border border-line bg-paper">
                <summary className="flex min-h-11 cursor-pointer flex-wrap items-center justify-between gap-2 px-4 py-2 text-[14px] font-medium">
                  {sec.title}
                  <span className={`${mono} text-muted`}>#{sec.id}</span>
                </summary>
                <pre className={`m-0 border-t border-line px-4 py-3 leading-relaxed whitespace-pre-wrap ${mono}`}>{sec.text}</pre>
                <p className="m-0 px-4 pb-3 text-[12px]">
                  <a href={sec.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    Open this section on the website ↗
                  </a>
                </p>
              </details>
            ))}
          </div>
        </div>
      ))}
    </Panel>
  );
}

function Media({ media }: { media: KnowledgeData["media"] }) {
  return (
    <Panel id="media" title="Available media" aside={`${media.length} files the assistant may share`}>
      <ul className="m-0 list-none p-0">
        {media.map((m) => (
          <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 first:border-t-0">
            <div className="flex min-w-0 items-center gap-4">
              <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-ink text-[11px] font-semibold text-gold">
                {m.type === "pdf" ? "PDF" : "MP4"}
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <a href={m.url} target="_blank" rel="noopener noreferrer" className="font-medium underline-offset-2 hover:underline">
                  {m.title}
                </a>
                <span className="text-[13px] text-muted">{m.description}</span>
                <span className={`${mono} text-muted`}>
                  id: {m.id} · {m.size} · tags: {m.tags.join(", ")}
                </span>
              </div>
            </div>
            <Badge tone={m.isDemo ? "warn" : "ok"}>{m.isDemo ? "DEMO MATERIAL" : "FROM WEBSITE"}</Badge>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function TraceRunner() {
  const [question, setQuestion] = useState(SAMPLE_QUESTIONS[3]);
  const [trace, setTrace] = useState<AgentTrace | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(e?: FormEvent) {
    e?.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/knowledge/trace", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
      setTrace(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The trace request failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Panel id="trace" title="Test a question" aside="Runs the real pipeline once. Nothing is stored.">
      <form onSubmit={run} className="flex flex-col gap-3 px-5 py-5">
        <label htmlFor="trace-q" className="text-[13px] font-medium text-muted">
          Question
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            id="trace-q"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={1000}
            required
            className="min-h-12 min-w-0 flex-[1_1_320px] rounded-lg border border-[#9fb3a6] bg-white px-4 text-[15px] focus:border-ink focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending}
            className="min-h-12 rounded-lg bg-ink px-6 text-[14px] font-medium text-foam hover:bg-forest disabled:opacity-60"
          >
            {pending ? "Running…" : "Run trace"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Sample questions">
          {SAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuestion(q)}
              aria-pressed={question === q}
              className="min-h-9 rounded-full border border-line px-3 text-[13px] text-muted hover:border-ink hover:text-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-foam"
            >
              {q}
            </button>
          ))}
        </div>
      </form>

      <div aria-live="polite">
        {pending && <p role="status" className="m-0 border-t border-line px-5 py-4 text-muted">Running retrieval and the model…</p>}
        {error && (
          <div className="border-t border-line px-5 py-4">
            <Alert>{error}</Alert>
          </div>
        )}
        {trace && !pending && <TraceResult trace={trace} />}
      </div>
    </Panel>
  );
}

function TraceResult({ trace }: { trace: AgentTrace }) {
  return (
    <div className="grid border-t border-line md:grid-cols-2">
      <div className="flex flex-col gap-3 border-line p-5 md:border-r">
        <h3 className="m-0 text-[15px] font-semibold">Source text passed to the model</h3>
        {trace.retrieval.results.length === 0 && (
          <p className="m-0 rounded-lg bg-paper p-3 text-[14px]">
            No section matched. The model was told: &ldquo;No section of the page matched this question.&rdquo;
          </p>
        )}
        {trace.retrieval.results.map((r) => (
          <div key={r.id} className="flex flex-col gap-1.5 rounded-lg bg-paper p-3">
            <span className={`${mono} text-muted`}>
              {r.id} · BM25 {r.score.toFixed(2)} · matched: {r.matchedTerms.join(", ")}
            </span>
            <pre className={`m-0 leading-relaxed whitespace-pre-wrap ${mono}`}>{r.text}</pre>
          </div>
        ))}
        <details className="rounded-lg border border-line">
          <summary className="min-h-11 cursor-pointer px-3 py-2.5 text-[14px] font-medium">Full prompt text sent to the model</summary>
          <pre className={`m-0 max-h-[420px] overflow-auto border-t border-line px-3 py-3 leading-relaxed whitespace-pre-wrap ${mono}`}>
            {trace.systemPrompt}
          </pre>
        </details>
      </div>
      <div className="flex flex-col gap-4 p-5">
        <h3 className="m-0 text-[15px] font-semibold">Agent decision</h3>
        <dl className="m-0 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2.5 text-[14px]">
          <dt className="text-muted">Mode</dt>
          <dd className="m-0">{trace.mode === "mock" ? `Mock mode (${trace.model})` : `Live model · ${trace.model}`}</dd>
          {trace.mockIntent && (
            <>
              <dt className="text-muted">Mock intent</dt>
              <dd className={`m-0 ${mono}`}>{trace.mockIntent}</dd>
            </>
          )}
          <dt className="text-muted">Tool calls</dt>
          <dd className={`m-0 ${mono}`}>
            {trace.toolCalls.length ? trace.toolCalls.map((c, i) => <div key={i}>{c.toolName}({JSON.stringify(c.input)})</div>) : "none"}
          </dd>
          <dt className="text-muted">Media chosen</dt>
          <dd className="m-0">
            {trace.mediaSelected.length
              ? trace.mediaSelected.map((m) => (
                  <div key={m.id}>
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className={`${mono} underline`}>
                      {m.id}
                    </a>{" "}
                    {m.isDemo && <Badge tone="warn">DEMO</Badge>}
                  </div>
                ))
              : "none"}
          </dd>
          {trace.mediaUnavailable.length > 0 && (
            <>
              <dt className="text-muted">Unavailable</dt>
              <dd className="m-0">{trace.mediaUnavailable.map((u) => `${u.requested}: ${u.reason}`).join(" ")}</dd>
            </>
          )}
          <dt className="text-muted">Ran at</dt>
          <dd className="m-0">
            <time dateTime={trace.ranAt}>{new Date(trace.ranAt).toLocaleString()}</time> · {trace.durationMs} ms
          </dd>
        </dl>
        <div className="flex flex-col gap-1.5">
          <h4 className="m-0 text-[13px] font-medium text-muted">Answer</h4>
          {trace.error ? (
            <Alert>{trace.error}</Alert>
          ) : (
            <pre className="m-0 rounded-lg bg-paper p-3 font-sans text-[14px] leading-relaxed whitespace-pre-wrap">{trace.answer || "(no text, media only)"}</pre>
          )}
        </div>
      </div>
    </div>
  );
}

function Panel({ id, title, aside, children }: { id: string; title: string; aside?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-4 overflow-hidden rounded-2xl border border-line bg-[#f4f8f3]">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-5 py-4">
        <h2 id={`${id}-h`} className="m-0 font-serif text-[26px] leading-none font-normal">
          {title}
        </h2>
        {aside && <span className="text-[13px] text-muted">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

function Badge({ children, tone = "plain" }: { children: ReactNode; tone?: "plain" | "warn" | "ok" }) {
  const tones = {
    plain: "bg-line/60 text-ink",
    warn: "bg-[#f3e2b3] text-[#5c4300]",
    ok: "bg-[#d6e6d9] text-[#1b4a33]",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] ${tones[tone]}`}>{children}</span>;
}

function Alert({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="m-0 rounded-lg border border-[#c9877a] bg-[#f7e4df] px-4 py-3 text-[14px] text-[#5a1f14]">
      {children}
    </p>
  );
}
