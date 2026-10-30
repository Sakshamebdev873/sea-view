// Builds public/media/sea-view-brochure-demo.pdf from the captured page facts.
// Run with: npm run make:brochure
//
// This is a simple sample, not an official Greedy Adventures document, so
// every page is stamped "DEMO MATERIAL". Standard PDF fonts cannot draw the
// baht sign, so prices are written as THB.

import { readFile, writeFile } from "node:fs/promises";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const root = new URL("../", import.meta.url);
const snapshot = JSON.parse(await readFile(new URL("src/lib/knowledge/snapshot.json", root), "utf8"));

const hex = (h) => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
const INK = hex("#10241E");
const PAPER = hex("#E8EFE7");
const GOLD = hex("#D9B65E");
const MUTED = hex("#4F6058");
const LINE = hex("#C6D3C8");
const MIST = hex("#C3D1C9");

const doc = await PDFDocument.create();
doc.setTitle("Sea View Skydiving brochure (demo material)");
doc.setAuthor("Sea View demo — built from greedyadventures.com");
doc.setSubject(`Sample brochure from the page captured on ${snapshot.capturedAt}`);
doc.setKeywords(["demo material", "sample", "sea view skydiving"]);

const serif = await doc.embedFont(StandardFonts.TimesRoman);
const serifItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);
const sans = await doc.embedFont(StandardFonts.Helvetica);
const sansBold = await doc.embedFont(StandardFonts.HelveticaBold);
const cover = await doc.embedJpg(await readFile(new URL("scripts/assets/brochure-cover.jpg", root)));
const plane = await doc.embedJpg(await readFile(new URL("scripts/assets/brochure-plane.jpg", root)));

const W = 595.28; // A4
const H = 841.89;
const M = 48;

function demoStamp(page, color) {
  const label = "DEMO MATERIAL";
  const size = 8;
  const w = sansBold.widthOfTextAtSize(label, size) + 16;
  page.drawRectangle({ x: W - M - w, y: H - 40, width: w, height: 18, borderColor: color, borderWidth: 0.8 });
  page.drawText(label, { x: W - M - w + 8, y: H - 34, size, font: sansBold, color, characterSpacing: 1.2 });
}

function wrap(text, font, size, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function paragraph(page, text, { x, y, size, font, color, width, leading = 1.45 }) {
  for (const line of wrap(text, font, size, width)) {
    page.drawText(line, { x, y, size, font, color });
    y -= size * leading;
  }
  return y;
}

// --- Page 1: cover --------------------------------------------------------
{
  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: INK });

  const imgH = 470;
  const scale = Math.max(W / cover.width, imgH / cover.height);
  page.drawImage(cover, {
    x: (W - cover.width * scale) / 2,
    y: H - imgH - 70 + (imgH - cover.height * scale) / 2,
    width: cover.width * scale,
    height: cover.height * scale,
  });
  // Masks keep the photo inside its frame on both sides.
  page.drawRectangle({ x: 0, y: H - 70, width: W, height: 70, color: INK });
  page.drawRectangle({ x: 0, y: 0, width: W, height: H - imgH - 70, color: INK });

  page.drawText("N° 01 — THAILAND", { x: M, y: H - 34, size: 8, font: sans, color: MIST, characterSpacing: 1.6 });
  demoStamp(page, GOLD);

  page.drawText("Sea View", { x: M - 4, y: 250, size: 104, font: serif, color: PAPER });
  page.drawText("Tandem skydive from 13,000 ft over the Gulf of Thailand", {
    x: M, y: 214, size: 17, font: serifItalic, color: MIST,
  });

  const facts = ["13,000 FT EXIT", "~60 S FREEFALL", "5–7 MIN CANOPY", "3 H AT THE DROPZONE"];
  let fx = M;
  for (const f of facts) {
    page.drawText(f, { x: fx, y: 170, size: 8, font: sans, color: PAPER, characterSpacing: 1.2 });
    fx += sans.widthOfTextAtSize(f, 8) + f.length * 1.2 + 22;
  }
  page.drawLine({ start: { x: M, y: 150 }, end: { x: W - M, y: 150 }, thickness: 0.6, color: hex("#21453A") });
  page.drawText("FROM THB 9,500 PER PERSON", { x: M, y: 124, size: 9, font: sansBold, color: GOLD, characterSpacing: 1.4 });

  paragraph(
    page,
    `Demo material: a sample brochure made for a prototype from the public Sea View Skydiving page (captured ${snapshot.capturedAt}). It is not an official Greedy Adventures document. Check prices and availability on the website.`,
    { x: M, y: 74, size: 8, font: sans, color: MIST, width: W - 2 * M, leading: 1.5 },
  );
  page.drawText("Photo: greedyadventures.com", { x: M, y: 36, size: 7, font: sans, color: MUTED });
}

// --- Page 2: packages, plan, location -------------------------------------
{
  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: PAPER });
  page.drawText("SEA VIEW SKYDIVING · PATTAYA DROPZONE", { x: M, y: H - 34, size: 8, font: sans, color: MUTED, characterSpacing: 1.6 });
  demoStamp(page, INK);

  page.drawText("Three ways to fall.", { x: M, y: H - 104, size: 40, font: serif, color: INK });
  page.drawText("Same aircraft, altitude and instructors in every package.", {
    x: M, y: H - 128, size: 12, font: serifItalic, color: MUTED,
  });

  const packages = [
    ["ECO", "THB 9,500", "The jump, nothing else"],
    ["DELUXE", "THB 12,500", "Video and photos included"],
    ["VIP", "THB 14,000", "Personal cameraman and edited film"],
  ];
  let y = H - 170;
  page.drawLine({ start: { x: M, y: y + 14 }, end: { x: W - M, y: y + 14 }, thickness: 0.8, color: INK });
  for (const [name, price, line] of packages) {
    page.drawText(name, { x: M, y: y - 14, size: 22, font: serif, color: INK });
    page.drawText(price, { x: W - M - serif.widthOfTextAtSize(price, 22), y: y - 14, size: 22, font: serif, color: INK });
    page.drawText(line, { x: M, y: y - 34, size: 11, font: serifItalic, color: MUTED });
    y -= 56;
    page.drawLine({ start: { x: M, y: y + 6 }, end: { x: W - M, y: y + 6 }, thickness: 0.5, color: LINE });
  }
  y = paragraph(
    page,
    "Included in every package: tandem skydive experience in Pattaya, Thailand · safety briefing and tandem instructor support · aircraft ascent and ocean-view jump experience · certificate of completion.",
    { x: M, y: y - 14, size: 9.5, font: sans, color: INK, width: W - 2 * M },
  );

  // Plan (left) + photo (right)
  const colW = (W - 2 * M - 24) / 2;
  let py = y - 30;
  page.drawText("The plan", { x: M, y: py, size: 22, font: serif, color: INK });
  py -= 22;
  const steps = [
    ["Arrival and check-in", "Sign in at the dropzone and bring your photo ID."],
    ["Safety briefing and gear fitting", "Meet your instructor for the briefing and harness fitting."],
    ["Boarding and the climb", "Board the aircraft and climb to jump altitude."],
    ["Exit and freefall", "Freefall with your instructor over the Gulf of Thailand."],
    ["Canopy flight and landing", "Fly under the parachute and land back at the dropzone."],
  ];
  steps.forEach(([title, body], i) => {
    page.drawText(`0${i + 1}`, { x: M, y: py, size: 8, font: sans, color: MUTED });
    page.drawText(title, { x: M + 20, y: py, size: 10, font: sansBold, color: INK });
    py = paragraph(page, body, { x: M + 20, y: py - 13, size: 9, font: sans, color: MUTED, width: colW - 20 }) - 8;
  });

  // The photo is pre-cropped (scripts/assets) so it can be drawn at its own ratio.
  const imgX = M + colW + 24;
  const imgTop = y - 30 + 16;
  const imgH = colW * (plane.height / plane.width);
  page.drawImage(plane, { x: imgX, y: imgTop - imgH, width: colW, height: imgH });
  py = Math.min(py, imgTop - imgH);

  // Location + good to know
  let ly = py - 22;
  page.drawLine({ start: { x: M, y: ly + 12 }, end: { x: W - M, y: ly + 12 }, thickness: 0.8, color: INK });
  page.drawText("WHERE YOU JUMP", { x: M, y: ly - 6, size: 8, font: sansBold, color: MUTED, characterSpacing: 1.4 });
  paragraph(page, "Pattaya Sea View, Pattaya, Thailand. 95 M.4, Chakphong, Klaeng District, Rayong 21190, Thailand. Operated by Dropzone Thailand.", {
    x: M, y: ly - 22, size: 9.5, font: sans, color: INK, width: colW,
  });
  page.drawText("GOOD TO KNOW", { x: imgX, y: ly - 6, size: 8, font: sansBold, color: MUTED, characterSpacing: 1.4 });
  paragraph(page, "No experience needed: your USPA-certified instructor flies the jump. Bangkok pickup is available as a fixed-price add-on.", {
    x: imgX, y: ly - 22, size: 9.5, font: sans, color: INK, width: colW,
  });

  page.drawText(`Source: ${snapshot.url} · captured ${snapshot.capturedAt}`, { x: M, y: 36, size: 7, font: sans, color: MUTED });
}

const bytes = await doc.save();
await writeFile(new URL("public/media/sea-view-brochure-demo.pdf", root), bytes);
console.log(`Wrote sea-view-brochure-demo.pdf (${(bytes.length / 1024).toFixed(0)} KB)`);
