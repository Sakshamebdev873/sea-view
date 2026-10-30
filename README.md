# Sea View Skydiving: redesign + AI concierge

A one-page Next.js prototype for the Greedy Adventures **Sea View Skydiving** experience: a redesigned hero and packages section, and an [assistant-ui](https://www.assistant-ui.com/) chat that answers from the page, links to its sources, remembers the conversation, and shows the brochure (PDF) or the film (video) in the chat when asked.

- **Demo:** https://sea-view-tau.vercel.app/
- **Knowledge view:** https://sea-view-tau.vercel.app/knowledge (also linked from the footer and the chat)
- **Reference page:** https://www.greedyadventures.com/experiences/sea-view-skydiving

---

## Run it

Requires Node 20+.

```bash
npm install
cp .env.example .env.local   # add GOOGLE_GENERATIVE_AI_API_KEY for live answers
npm run dev                  # http://localhost:3000
```

| Variable | Required | Purpose |
|---|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | No | Gemini key, read only on the server. Without it the app runs in **mock mode**. |
| `GEMINI_MODEL` | No | Model id, default `gemini-2.5-flash`. |
| `AGENT_MODE` | No | `mock` forces mock mode even with a key. |

**Mock mode.** With no key, a deterministic intent router answers from the same snapshot and uses the same media gate. A gold **MOCK MODE** badge shows in the chat header and in the knowledge view, so it is never mistaken for the model.

Other scripts:

```bash
npm test               # vitest: retrieval, media selection, fallbacks, API routes
npm run typecheck      # tsc --noEmit
npm run lint
npm run make:brochure  # rebuild public/media/sea-view-brochure-demo.pdf from the snapshot
```

---

## How it works

### Agent flow

```
Browser (assistant-ui AssistantModal + Thread)
   │  full thread sent each turn (that is the memory; nothing stored server-side)
   ▼
POST /api/chat ── zod validation (text only, ≤1000 chars, ≤40 messages; client "system"/"tools" ignored)
   │
   ├─ 1. retrieve()        BM25 over the 7 page sections, using the latest question
   │                       plus the previous one at half weight (so follow-ups keep their topic)
   ├─ 2. buildSystemPrompt rules + media catalogue + the retrieved section text with URLs
   ├─ 3. Gemini (streamText, temperature 0.2, ≤3 steps)   — or the mock router
   ├─ 4. shareMedia tool   model picks type/id → resolveShareRequest() checks the registry
   │                       unknown/mistyped id → "unavailable" + real alternatives only
   └─ 5. UI message stream text + tool results + metadata (mode, sections used)
   ▼
assistant-ui renders: markdown text (no raw HTML, allow-listed links) · PDF card · video
player · "not available" card · loading · error with "Try again" · "Sections checked" list
```

The model decides **whether** to share a file; the server decides **which** file exists. A made-up id can never become a link.

### Code layout (UI / knowledge / chat-model logic / media are separate)

```
src/
  app/
    page.tsx                     page shell (server component)
    knowledge/                   read-only knowledge view (client, fetches the API)
    api/chat/route.ts            validate → streamChat()
    api/knowledge/route.ts       GET sources + media + current mode
    api/knowledge/trace/route.ts POST question → traceQuestion() (same pipeline)
  lib/
    knowledge/  snapshot.json, source.ts (zod-validated), retrieve.ts (BM25)
    media/      registry.ts (allowed files), select.ts (resolve, detect, fallbacks)
    agent/      config.ts (live/mock), prompt.ts, tools.ts, mock.ts, conversation.ts, run.ts
    validation/ schemas.ts (zod request schemas)
  components/
    experience/ Cover, Editorial (contents/feature/film/essay), Menu, Questions/Footer
    chat/       ConciergeProvider, Concierge (modal), Thread, MarkdownText, ShareMediaTool, MediaCards
scripts/make-brochure.mjs        builds the demo PDF from the snapshot (pdf-lib)
tests/                           vitest suites
```

### Knowledge view

Open **`/knowledge`** (footer → "Knowledge view", or "See what it knows" in the chat).

- **Website sources:** page title, URL, capture date, capture method, and the usable text of every section exactly as the model receives it.
- **Available media:** every PDF and video in the registry with id, size, tags and a **DEMO MATERIAL** or **FROM WEBSITE** badge.
- **Test a question:** runs the question through the real pipeline on the server (`POST /api/knowledge/trace`) and shows the sections retrieved with BM25 scores and matched terms, the **full prompt text sent to the model**, the tool calls, the media the server resolved, the answer, mode, time and duration. This is computed live on every click, not stored or mocked, so it also works on serverless.

It shows public website and demo content only: no keys, no chat history, no editing or uploads.

---

## Sources and media

| Item | Origin | Label |
|---|---|---|
| Page text (7 sections) | One HTTP GET of the reference page on **2026-10-30**, visible text copied verbatim into `src/lib/knowledge/snapshot.json`. No crawler. | Shown in the knowledge view |
| Brochure PDF (`/media/sea-view-brochure-demo.pdf`) | **Sample** we generated from the page facts with `scripts/make-brochure.mjs` | **Demo material** on every page of the PDF, in the chat and in the knowledge view |
| Main video of the jump (`/media/sea-view-film.mp4`) | The page's main film, copied from greedyadventures.com | From website |
| Customer clip (`/media/customer-clip.mp4`) | A clip from the page's "A glimpse of the jump" gallery | From website |
| Photos | greedyadventures.com | Credited in captions and footer |

The `keywords` field on each section is a retrieval hint we added; it is never passed to the model.

The page lists the jump for Pattaya but gives a Rayong address. The page copy and the assistant both state both and suggest confirming the meeting point.

---

## Verification steps

Run with `npm run dev` (live with a key, or mock without). The automated column runs with `npm test`.

| # | Do this | Expect | Automated |
|---|---|---|---|
| V1 | Ask "What is included in the package?" | Text only: the four inclusions, what Deluxe and VIP add, a source link to *Choose your package* | `mock.test.ts` V1 |
| V2 | Then ask "Which one has the cameraman?" | VIP, ฿14,000, using the earlier turn | `mock.test.ts` V2, follow-up price |
| V3 | Ask "Can you send me a brochure?" | PDF card with cover, **DEMO MATERIAL**, Open (new tab) and Download work | `media.test.ts`, `api.test.ts` |
| V4 | Ask "Can I see a video of the experience?" | Video player in the chat plus "Watch on the website ↗", no PDF | `mock.test.ts` V4 |
| V5 | Ask "Send me the brochure and a video." | Both cards in one reply | `mock.test.ts` V5, `api.test.ts` |
| V6 | Ask "What's the weight limit?" | Says the page does not say it, links to Contact, invents nothing | `mock.test.ts` V6, `retrieve.test.ts` |
| V7 | Ask "Send me the VIP-only brochure" | Says it is not available, offers the general brochure (button) | `mock.test.ts` V7, `media.test.ts` |
| V8 | Open `/?simulate=model-error`, send anything | Red error card with the customer-facing message and **Try again** | `api.test.ts` |
| V9 | Remove the key, restart | **MOCK MODE** badge in chat and knowledge view; answers still work | `api.test.ts` (runs in mock) |
| V10 | In `/knowledge`, run "Send me the brochure and a video." | Retrieved text, prompt text, two `shareMedia` calls, both media ids | `api.test.ts` trace |
| V11 | Keyboard only: Tab to "Ask the dropzone", Enter, type, Enter, Tab to Open/Download, Esc | Focus lands in the input; Esc closes and returns focus to the trigger | manual |
| V12 | 375 px wide | No horizontal scroll; chat fits the screen; trigger shrinks to its medallion | manual |

A real model failure (bad key, quota) shows the same error card; the details go to the server log only.

---

## Safety

- The API key is read only in `src/lib/agent/config.ts` (marked `server-only`). The browser receives only the mode label.
- Every API input is validated with zod. The chat accepts user **text** messages only, and ignores any `system` prompt or `tools` the client sends.
- Model output is rendered as markdown **without raw HTML**. Links are limited to greedyadventures.com, instagram.com and same-origin paths, open in a new tab with `noopener`. Images in model output are dropped.
- Media URLs come only from the registry, never from the model.

## Limitations

- One captured page. If the live page changes, the snapshot must be re-captured by hand.
- Keyword retrieval (BM25 + small synonym list) can miss paraphrases that share no words with the page. Fine for one page; a larger site would need embeddings.
- No rate limiting or abuse protection on `/api/chat` (prototype). On a public deployment I would add per-IP limits.
- The demo uses Gemini's free tier. Many messages in quick succession can hit its rate limit; the chat then shows the error card with **Try again** instead of failing silently.
- The conversation lives in the browser tab only; refreshing clears it (by design: no database).
- Mock mode understands a fixed set of intents; it is for demonstrating the flow, not for open conversation.
- "Check availability" links out to the real page. There are no bookings, payments or logins (out of scope).
- The demo brochure uses standard PDF fonts, so prices are written as THB rather than ฿.

## Credits

- [assistant-ui](https://www.assistant-ui.com/) (`@assistant-ui/react`, `react-ai-sdk`, `react-markdown`): chat primitives, AssistantModal, tool UI rendering
- [Vercel AI SDK](https://ai-sdk.dev/) (`ai`, `@ai-sdk/google`): streaming, tools, Gemini provider
- [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/), [zod](https://zod.dev/), [pdf-lib](https://pdf-lib.js.org/), [remark-gfm](https://github.com/remarkjs/remark-gfm)
- Fonts: Instrument Serif and Inter Tight (Google Fonts, OFL)
- Photos, film and customer clip: greedyadventures.com (used for this assignment only)

## AI assistance

I used Claude Code (Anthropic) as a pair programmer for scaffolding, the first drafts of components and tests, and visual QA in a headless browser. I chose the architecture (snapshot + BM25 instead of a vector DB, server-side media gate, mock mode, trace endpoint), reviewed every file, and checked each verification step above myself. I can walk through or change any part of it.
