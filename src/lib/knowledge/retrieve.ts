import { sections, type KnowledgeSection } from "./source";

/**
 * Small, deterministic BM25 retriever over the captured page sections.
 *
 * The corpus is seven sections, so a vector database would add cost and
 * nondeterminism without improving recall. BM25 is easy to explain, easy to
 * test, and its scores are shown verbatim in the knowledge view trace.
 */

const STOPWORDS = new Set(
  "a an and are as at be but by can could do does for from had has have how i if in into is it its me my of on or our so than that the their them then there these they this to us was we were what when which who will with would you your yours please tell send show give get".split(
    " ",
  ),
);

/** Maps customer phrasing onto words the page actually uses. */
const SYNONYMS: Record<string, string[]> = {
  cost: ["price"],
  costs: ["price"],
  much: ["price"],
  expensive: ["price"],
  cheap: ["price", "eco"],
  cheapest: ["price", "eco"],
  thb: ["price", "baht"],
  camera: ["cameraman", "video"],
  photographer: ["cameraman", "photos"],
  gopro: ["video"],
  pictures: ["photos"],
  pics: ["photos"],
  footage: ["video"],
  movie: ["film", "video"],
  address: ["location"],
  located: ["location"],
  directions: ["location"],
  transfer: ["pickup"],
  transport: ["pickup"],
  hotel: ["pickup"],
  long: ["duration", "hours"],
  first: ["experience", "needed"],
  beginner: ["experience", "needed"],
  height: ["altitude"],
  high: ["altitude"],
  feet: ["altitude"],
  ft: ["altitude"],
  safe: ["safety", "instructor"],
};

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/[\s-]+/)
    .map(stem)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/** Very light stemming: enough to match "packages" with "package". */
function stem(token: string): string {
  if (token.length > 4 && token.endsWith("ies")) return token.slice(0, -3) + "y";
  if (token.length > 3 && token.endsWith("s") && !token.endsWith("ss"))
    return token.slice(0, -1);
  return token;
}

const STEMMED_SYNONYMS = new Map(
  Object.entries(SYNONYMS).map(([word, syns]) => [stem(word), syns.map(stem)]),
);

function expand(tokens: string[]): string[] {
  const out = [...tokens];
  for (const t of tokens) out.push(...(STEMMED_SYNONYMS.get(t) ?? []));
  return out;
}

type IndexedSection = {
  section: KnowledgeSection;
  termFreq: Map<string, number>;
  length: number;
};

const K1 = 1.2;
const B = 0.75;
/** Keywords are curated retrieval hints, so they count more than body text. */
const KEYWORD_WEIGHT = 2;
const TITLE_WEIGHT = 2;

function buildIndex(corpus: KnowledgeSection[]) {
  const docs: IndexedSection[] = corpus.map((section) => {
    const terms = [
      ...tokenize(section.text),
      ...repeat(tokenize(section.title), TITLE_WEIGHT),
      ...repeat(section.keywords.flatMap(tokenize), KEYWORD_WEIGHT),
    ];
    const termFreq = new Map<string, number>();
    for (const t of terms) termFreq.set(t, (termFreq.get(t) ?? 0) + 1);
    return { section, termFreq, length: terms.length };
  });
  const avgLength = docs.reduce((n, d) => n + d.length, 0) / docs.length;
  const docFreq = new Map<string, number>();
  for (const d of docs) {
    for (const t of d.termFreq.keys()) docFreq.set(t, (docFreq.get(t) ?? 0) + 1);
  }
  return { docs, avgLength, docFreq, n: docs.length };
}

function repeat<T>(items: T[], times: number): T[] {
  return Array.from({ length: times }, () => items).flat();
}

const index = buildIndex(sections);

function idf(term: string): number {
  const df = index.docFreq.get(term) ?? 0;
  return Math.log(1 + (index.n - df + 0.5) / (df + 0.5));
}

export type RetrievedSection = {
  section: KnowledgeSection;
  score: number;
  matchedTerms: string[];
};

type RetrieveOptions = {
  /** Maximum sections to return. */
  k?: number;
  /** Earlier user turns, weighted lower, so follow-ups keep their topic. */
  context?: string;
};

const CONTEXT_WEIGHT = 0.5;
/** Sections scoring below this are treated as irrelevant. */
const MIN_SCORE = 1;

export function retrieve(query: string, options: RetrieveOptions = {}): RetrievedSection[] {
  const { k = 3, context } = options;
  const weights = new Map<string, number>();
  for (const t of expand(tokenize(query))) weights.set(t, 1);
  if (context) {
    for (const t of expand(tokenize(context))) {
      if (!weights.has(t)) weights.set(t, CONTEXT_WEIGHT);
    }
  }

  const scored = index.docs.map((doc) => {
    let score = 0;
    const matched: string[] = [];
    for (const [term, weight] of weights) {
      const tf = doc.termFreq.get(term);
      if (!tf) continue;
      const norm = tf + K1 * (1 - B + (B * doc.length) / index.avgLength);
      score += weight * idf(term) * ((tf * (K1 + 1)) / norm);
      matched.push(term);
    }
    return { section: doc.section, score: round(score), matchedTerms: matched };
  });

  return scored
    .filter((r) => r.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score || a.section.id.localeCompare(b.section.id))
    .slice(0, k);
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
