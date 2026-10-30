import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MEDIA } from "@/lib/media/registry";
import { detectMediaIntent, resolveShareRequest } from "@/lib/media/select";

describe("media registry", () => {
  it("only lists files that exist in /public", () => {
    for (const item of MEDIA) {
      expect(existsSync(join(process.cwd(), "public", item.url)), item.url).toBe(true);
      if (item.posterUrl) expect(existsSync(join(process.cwd(), "public", item.posterUrl))).toBe(true);
    }
  });

  it("labels every demo item and nothing else", () => {
    for (const item of MEDIA) expect(item.isDemo).toBe(item.origin === "demo");
    expect(MEDIA.find((m) => m.type === "pdf")?.isDemo).toBe(true);
  });

  it("has unique ids and one default per type", () => {
    expect(new Set(MEDIA.map((m) => m.id)).size).toBe(MEDIA.length);
    for (const type of ["pdf", "video"] as const) {
      expect(MEDIA.filter((m) => m.type === type && m.isDefaultForType)).toHaveLength(1);
    }
  });
});

describe("resolveShareRequest (the gate between the model and a link)", () => {
  it("returns the demo brochure for a general PDF request", () => {
    const r = resolveShareRequest({ type: "pdf" });
    expect(r.status).toBe("available");
    if (r.status === "available") {
      expect(r.media.id).toBe("brochure-sea-view");
      expect(r.media.isDemo).toBe(true);
    }
  });

  it("returns the main film for a general video request", () => {
    const r = resolveShareRequest({ type: "video" });
    expect(r.status === "available" && r.media.id).toBe("video-main-jump");
  });

  it("rejects ids that are not in the registry and offers only real alternatives", () => {
    const r = resolveShareRequest({ type: "pdf", mediaId: "brochure-vip-only", requested: "VIP-only brochure" });
    expect(r.status).toBe("unavailable");
    if (r.status === "unavailable") {
      expect(r.requested).toBe("VIP-only brochure");
      expect(r.alternatives.map((a) => a.id)).toEqual(["brochure-sea-view"]);
    }
  });

  it("rejects a real id used with the wrong type", () => {
    const r = resolveShareRequest({ type: "video", mediaId: "brochure-sea-view" });
    expect(r.status).toBe("unavailable");
  });
});

describe("detectMediaIntent", () => {
  it.each([
    ["What is included in the package?", { pdf: false, video: false }],
    ["Can you send me a brochure?", { pdf: true, video: false }],
    ["Can I see a video of the experience?", { pdf: false, video: true }],
    ["Send me the brochure and a video.", { pdf: true, video: true }],
    ["Is insurance included?", { pdf: false, video: false }],
  ])("%j", (message, expected) => {
    expect(detectMediaIntent(message)).toMatchObject(expected);
  });

  it("flags files the website does not have", () => {
    expect(detectMediaIntent("Send me the VIP-only brochure").missingPdf).toBe("VIP-only brochure");
    expect(detectMediaIntent("Can you email me the waiver?").missingPdf).toBe("waiver");
    expect(detectMediaIntent("Do you have a drone video?").missingVideo).toBe("drone video");
  });

  it("treats a brochure 'for the VIP package' as the general brochure", () => {
    expect(detectMediaIntent("Send me the brochure for the VIP package").missingPdf).toBeUndefined();
  });
});
