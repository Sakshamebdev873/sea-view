import { describe, expect, it } from "vitest";
import { retrieve, tokenize } from "@/lib/knowledge/retrieve";
import { sections, snapshot } from "@/lib/knowledge/source";

const topIds = (q: string, context?: string) => retrieve(q, { context }).map((r) => r.section.id);

describe("knowledge snapshot", () => {
  it("has a capture date, a source URL and usable text for every section", () => {
    expect(snapshot.capturedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(snapshot.url).toBe("https://www.greedyadventures.com/experiences/sea-view-skydiving");
    for (const s of sections) {
      expect(s.text.length).toBeGreaterThan(40);
      expect(s.url.startsWith(snapshot.url)).toBe(true);
    }
  });

  it("keeps the page's prices verbatim", () => {
    const packages = sections.find((s) => s.id === "packages")!.text;
    expect(packages).toContain("฿9,500 per person");
    expect(packages).toContain("฿12,500 per person");
    expect(packages).toContain("฿14,000 per person");
  });
});

describe("retrieve", () => {
  it.each([
    ["What is included in the package?", "packages"],
    ["How much does the VIP package cost?", "packages"],
    ["Which one has the cameraman?", "packages"],
    ["Where is the dropzone?", "location"],
    ["What's the address?", "location"],
    ["Is Bangkok pickup available?", "faqs"],
    ["How long will I be at the dropzone, what's the schedule?", "plan"],
    ["Do I need to bring ID?", "plan"],
    ["Do I need experience for my first jump?", "details"],
  ])("ranks the right section first for %j", (question, expected) => {
    expect(topIds(question)[0]).toBe(expected);
  });

  it("returns nothing for questions the page does not cover", () => {
    expect(topIds("What's the weight limit?")).toEqual([]);
    expect(topIds("Is there a minimum age?")).toEqual([]);
  });

  it("uses the previous question as context for a short follow-up", () => {
    expect(topIds("and how much is it?", "Tell me about the VIP package")[0]).toBe("packages");
  });

  it("is deterministic", () => {
    expect(retrieve("video and photos")).toEqual(retrieve("video and photos"));
  });

  it("tokenizes with light stemming and stopword removal", () => {
    expect(tokenize("What are the Packages?")).toEqual(["package"]);
  });
});
