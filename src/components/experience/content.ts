/**
 * Copy for the redesigned page. Facts mirror the captured snapshot in
 * src/lib/knowledge/snapshot.json (what the assistant reads); the editorial
 * lines around them are presentation only.
 */

export const PAGE_URL = "https://www.greedyadventures.com/experiences/sea-view-skydiving";
export const SITE = "https://www.greedyadventures.com";

export const FACTS = ["13,000 ft", "No experience needed", "USPA-certified instructors"];

export const PACKAGES = [
  {
    id: "eco",
    name: "Eco",
    price: "฿9,500",
    tagline: "The jump, nothing else.",
    detail: "Tandem skydive · safety briefing · ocean-view jump · certificate of completion",
    featured: false,
  },
  {
    id: "deluxe",
    name: "Deluxe",
    price: "฿12,500",
    tagline: "Video and photos included.",
    detail: "Everything in Eco · handy cam video from your instructor · photos",
    featured: false,
  },
  {
    id: "vip",
    name: "VIP",
    price: "฿14,000",
    tagline: "Personal cameraman and edited film.",
    detail: "Everything in Eco · a cameraman of your own · an edited film",
    featured: true,
  },
] as const;

export const FAQS = [
  {
    q: "Where does the activity take place?",
    a: "The tandem skydive is listed for Pattaya, Thailand. The dropzone address given is 95 M.4, Chakphong, Klaeng District, Rayong 21190, so please confirm your meeting point before you travel.",
  },
  {
    q: "Which package should I choose?",
    a: "Choose Eco for the standard jump, Deluxe if you want handy cam video, and VIP if you want full media coverage.",
  },
  {
    q: "Is Bangkok pickup available?",
    a: "Yes. Bangkok pickup is available as a fixed-price add-on.",
  },
] as const;
