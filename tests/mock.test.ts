import { describe, expect, it } from "vitest";
import type { ChatTurn } from "@/lib/agent/conversation";
import { retrievalQuery } from "@/lib/agent/conversation";
import { mockRespond } from "@/lib/agent/mock";
import { retrieve } from "@/lib/knowledge/retrieve";

function ask(...messages: string[]) {
  // Alternate user / assistant so follow-ups have real history.
  const turns: ChatTurn[] = [];
  messages.forEach((text, i) => turns.push({ role: i % 2 === 0 ? "user" : "assistant", text }));
  const { query, context } = retrievalQuery(turns);
  return mockRespond(turns, retrieve(query, { context }));
}

const mediaIds = (r: ReturnType<typeof ask>) =>
  r.media.map((m) => (m.output.status === "available" ? m.output.media.id : `unavailable:${m.input.type}`));

describe("mock mode router (verification steps V1–V7)", () => {
  it("V1 answers what is included in text only, with a source link", () => {
    const r = ask("What is included in the package?");
    expect(r.media).toEqual([]);
    expect(r.text).toContain("Certificate of completion");
    expect(r.text).toMatch(/\]\(https:\/\/www\.greedyadventures\.com\/experiences\/sea-view-skydiving#options\)/);
  });

  it("V2 follow-up uses the earlier turn", () => {
    const r = ask("What is included in the package?", "Every package includes…", "Which one has the cameraman?");
    expect(r.text).toContain("VIP");
    expect(r.text).toContain("฿14,000");
  });

  it("follow-up price resolves the package named earlier", () => {
    const r = ask("Tell me about the Deluxe package", "Deluxe is ฿12,500…", "How much is it?");
    expect(r.text).toContain("฿12,500");
    expect(r.text).not.toContain("฿14,000");
  });

  it("V3 sends the demo brochure", () => {
    expect(mediaIds(ask("Can you send me a brochure?"))).toEqual(["brochure-sea-view"]);
  });

  it("V4 sends a video and no PDF", () => {
    expect(mediaIds(ask("Can I see a video of the experience?"))).toEqual(["video-main-jump"]);
  });

  it("V5 sends both", () => {
    expect(mediaIds(ask("Send me the brochure and a video."))).toEqual(["brochure-sea-view", "video-main-jump"]);
  });

  it("V6 says so when the page does not have the answer", () => {
    const r = ask("What's the weight limit?");
    expect(r.intent).toBe("not-found");
    expect(r.text).toMatch(/couldn't find/i);
    expect(r.text).not.toMatch(/\d+\s?kg/);
  });

  it("V7 reports a missing file instead of substituting one silently", () => {
    const r = ask("Send me the VIP-only brochure");
    expect(mediaIds(r)).toEqual(["unavailable:pdf"]);
    expect(r.text).toMatch(/no VIP-only brochure/i);
  });

  it("flags the Pattaya / Rayong address mismatch", () => {
    expect(ask("Where is it?").text).toMatch(/confirm your meeting point/);
  });
});
