import type { RetrievedSection } from "@/lib/knowledge/retrieve";
import { getSection } from "@/lib/knowledge/source";
import {
  detectMediaIntent,
  resolveShareRequest,
  unavailable,
  type ShareMediaInput,
  type ShareMediaResult,
} from "@/lib/media/select";
import type { ChatTurn } from "./conversation";

/**
 * Mock mode: a deterministic intent router that stands in for the model when
 * no API key is configured. It reads the same snapshot, uses the same media
 * gate and produces the same tool calls, so every UI path can be exercised.
 * Everything it says is labelled "Mock mode" in the interface.
 */

export type MockMediaCall = { input: ShareMediaInput; output: ShareMediaResult };

export type MockReply = {
  intent: string;
  text: string;
  media: MockMediaCall[];
};

type Pkg = "eco" | "deluxe" | "vip";

const PACKAGES: Record<Pkg, { name: string; price: string; line: string }> = {
  eco: { name: "ECO", price: "฿9,500", line: "the jump, nothing else" },
  deluxe: { name: "Deluxe", price: "฿12,500", line: "video and photos included" },
  vip: { name: "VIP", price: "฿14,000", line: "a personal cameraman and an edited film" },
};

function cite(sectionId: string): string {
  const s = getSection(sectionId);
  return s ? `\n\nSource: [${s.title}](${s.url})` : "";
}

function findPackage(text: string): Pkg | undefined {
  const m = text.toLowerCase().match(/\b(eco|deluxe|vip)\b/);
  return m?.[1] as Pkg | undefined;
}

const has = (text: string, re: RegExp) => re.test(text.toLowerCase());

export function mockRespond(turns: ChatTurn[], retrieved: RetrievedSection[]): MockReply {
  const users = turns.filter((t) => t.role === "user");
  const message = users.at(-1)?.text ?? "";
  // Follow-ups like "how much is that one?" resolve against earlier turns.
  const earlier = turns.slice(0, -1).map((t) => t.text).reverse().join("\n");

  const media = detectMediaIntent(message);
  if (media.pdf || media.video) return mediaReply(message, media);

  const pkg = findPackage(message) ?? findPackage(earlier);

  if (has(message, /\b(camera ?man|cameraman|photographer|edited film)\b/)) {
    return text("cameraman", `The **VIP** package (${PACKAGES.vip.price} per person) is the one with a personal cameraman and an edited film. Deluxe (${PACKAGES.deluxe.price}) includes video and photos, and ECO is the jump on its own.${cite("packages")}`);
  }
  if (has(message, /\b(include[sd]?|what do i get|what's in|comes with)\b/)) {
    const extras = pkg
      ? `With **${PACKAGES[pkg].name}** (${PACKAGES[pkg].price}) you get ${PACKAGES[pkg].line}.`
      : `On top of that, **Deluxe** adds video and photos, and **VIP** adds a personal cameraman and an edited film.`;
    return text("included", `Every package includes:\n\n- Tandem skydive experience in Pattaya, Thailand\n- Safety briefing and tandem instructor support\n- Aircraft ascent and ocean-view jump experience\n- Certificate of completion\n\n${extras}${cite("packages")}`);
  }
  if (has(message, /\b(price|prices|cost|costs|how much|baht|thb|expensive|cheap|cheapest)\b/)) {
    if (pkg) return text("price", `The **${PACKAGES[pkg].name}** package is ${PACKAGES[pkg].price} per person: ${PACKAGES[pkg].line}.${cite("packages")}`);
    return text("price", `There are three packages, priced per person:\n\n- **ECO** ฿9,500: the jump, nothing else\n- **Deluxe** ฿12,500: video and photos included\n- **VIP** ฿14,000: personal cameraman and edited film${cite("packages")}`);
  }
  if (has(message, /\b(which|recommend|should i|best|choose|difference)\b/) && has(message, /\b(package|one|option)/)) {
    return text("choose", `The page suggests ECO for the standard jump, Deluxe if you want handy cam video, and VIP if you want full media coverage. The aircraft, altitude and instructors are the same in every package.${cite("faqs")}`);
  }
  if (has(message, /\b(bangkok|pick ?up|pickup|transfer|transport|hotel)\b/)) {
    return text("pickup", `Yes. Bangkok pickup is available as a fixed-price add-on. The page does not list the add-on price, so please ask Greedy Adventures for it.${cite("faqs")}`);
  }
  if (has(message, /\b(where|address|location|located|meeting point|directions)\b/)) {
    return text("location", `The jump is listed for Pattaya Sea View, Pattaya, Thailand, and the dropzone address given is 95 M.4, Chakphong, Klaeng District, Rayong 21190. Because those are different places, please confirm your meeting point before you travel. It is operated by Dropzone Thailand.${cite("location")}`);
  }
  if (has(message, /\b(how long|duration|hours|schedule|plan|what happens|steps|bring)\b/)) {
    return text("plan", `Plan on about 3 hours at the dropzone:\n\n1. Arrival and check-in (bring your photo ID)\n2. Safety briefing and harness fitting\n3. Boarding and the climb\n4. Exit and about 60 seconds of freefall\n5. Canopy flight and landing back at the dropzone${cite("plan")}`);
  }
  if (has(message, /\b(altitude|high|feet|ft|freefall|free fall|seconds|canopy)\b/)) {
    return text("jump", `You exit at 13,000 ft with the Gulf of Thailand on the horizon, freefall for around sixty seconds, then spend five to seven minutes under canopy along the coast.${cite("details")}`);
  }
  if (has(message, /\b(experience|first time|beginner|never|need to know how)\b/)) {
    return text("experience", `No experience is needed: your USPA-certified instructor flies the jump. You get a safety briefing and harness fitting before boarding.${cite("details")}`);
  }
  if (pkg && has(message, /\b(what about|and|tell me about|how about)\b|^\s*(eco|deluxe|vip)\s*\??\s*$/)) {
    return text("package", `**${PACKAGES[pkg].name}** is ${PACKAGES[pkg].price} per person: ${PACKAGES[pkg].line}. It includes the same jump, briefing, aircraft and certificate as the other packages.${cite("packages")}`);
  }
  if (has(message, /^\s*(hi|hello|hey|thanks|thank you)\b/)) {
    return text("greeting", `Hello! Ask me anything about the Sea View tandem jump: packages, prices, the plan for the day or the location. I can also send you the brochure or the film.`);
  }

  // Anything else: only answer if the page clearly covers it.
  const top = retrieved[0];
  if (top && top.score >= 4) {
    const firstLines = top.section.text.split("\n").slice(0, 3).join(" ");
    return text("retrieved", `Here is what the page says: ${firstLines}${cite(top.section.id)}`);
  }
  return text(
    "not-found",
    `I couldn't find that on the Sea View Skydiving page, so I don't want to guess. Please ask Greedy Adventures directly: [Contact us](https://www.greedyadventures.com/contact).`,
  );
}

function text(intent: string, body: string): MockReply {
  return { intent, text: body, media: [] };
}

function mediaReply(message: string, media: ReturnType<typeof detectMediaIntent>): MockReply {
  const calls: MockMediaCall[] = [];
  const lines: string[] = [];

  if (media.pdf) {
    if (media.missingPdf) {
      calls.push({
        input: { type: "pdf", mediaId: "unlisted", requested: media.missingPdf },
        output: unavailable("pdf", media.missingPdf, `The website material has no ${media.missingPdf}.`),
      });
      lines.push(`There's no ${media.missingPdf} in the website material, so I can't send one. The general brochure covers all three packages if that helps.`);
    } else {
      const input: ShareMediaInput = { type: "pdf", requested: message.slice(0, 200) };
      calls.push({ input, output: resolveShareRequest(input) });
      lines.push(`Here's the brochure. It's demo material: a sample made from the page, not an official Greedy Adventures document.`);
    }
  }
  if (media.video) {
    if (media.missingVideo) {
      calls.push({
        input: { type: "video", mediaId: "unlisted", requested: media.missingVideo },
        output: unavailable("video", media.missingVideo, `The website has no ${media.missingVideo}.`),
      });
      lines.push(`The website doesn't have a ${media.missingVideo}. The main video of the jump is available if you'd like it.`);
    } else {
      const wantsClip = /\b(customer|clip|real|vertical)\b/i.test(message);
      const input: ShareMediaInput = {
        type: "video",
        mediaId: wantsClip ? "video-customer-clip" : "video-main-jump",
        requested: message.slice(0, 200),
      };
      calls.push({ input, output: resolveShareRequest(input) });
      lines.push(wantsClip ? `Here's a real customer clip from the page.` : `Here's the main video of the jump, from the website.`);
    }
  }

  const intent = [media.pdf && "pdf", media.video && "video"].filter(Boolean).join("+");
  return { intent: `media:${intent}`, text: lines.join(" "), media: calls };
}
