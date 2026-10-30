import Image, { type StaticImageData } from "next/image";
import canopy from "@/assets/photos/canopy-landing.webp";
import checkIn from "@/assets/photos/check-in.jpg";
import gear from "@/assets/photos/gearing-up.webp";
import instructor from "@/assets/photos/instructor.webp";
import exit from "@/assets/photos/jump-after-exit.webp";
import plane from "@/assets/photos/plane.webp";
import { AmbientVideo } from "./client";

const CONTENTS = [
  { n: "01", title: "The jump", note: "13,000 ft", href: "#feature" },
  { n: "02", title: "The film", note: "Watch", href: "#film" },
  { n: "03", title: "The day, in five frames", note: "3 hours", href: "#essay" },
  { n: "04", title: "The menu", note: "3 packages", href: "#menu" },
  { n: "05", title: "Questions", note: "Ask live", href: "#questions" },
];

export function Contents() {
  return (
    <nav aria-labelledby="toc-title" className="gutter flex flex-wrap gap-x-18 gap-y-8 pt-[clamp(80px,10vw,120px)]">
      <h2 id="toc-title" data-reveal className="display m-0 flex-[0_1_320px] text-[clamp(44px,4.6vw,72px)] leading-[0.95] tracking-[-0.02em]">
        In this <br className="hidden sm:block" />
        <em>issue</em>
      </h2>
      <ol data-reveal className="m-0 flex-[1_1_560px] list-none border-t border-ink p-0">
        {CONTENTS.map((c) => (
          <li key={c.n}>
            <a href={c.href} className="group flex items-baseline gap-4 border-b border-line py-5 sm:gap-5 sm:py-[22px]">
              <span className="text-[13px] text-muted">{c.n}</span>
              <span className="font-serif text-[clamp(24px,3vw,32px)] transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:translate-x-2">
                {c.title}
              </span>
              <span aria-hidden="true" className="leader text-muted" />
              <span className="text-[13px] whitespace-nowrap text-muted">{c.note}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function SectionHead({ id, eyebrow, children }: { id: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <div data-reveal className="flex flex-wrap items-end justify-between gap-6 border-b border-ink pb-6">
      <p className="eyebrow m-0 text-muted">{eyebrow}</p>
      <h2 id={id} className="display m-0 text-right text-[clamp(44px,6vw,96px)]">
        {children}
      </h2>
    </div>
  );
}

export function Feature() {
  return (
    <section id="feature" aria-labelledby="feature-title" className="gutter flex scroll-mt-6 flex-col gap-14 pt-[clamp(96px,12vw,140px)]">
      <SectionHead id="feature-title" eyebrow="Feature · The jump">
        A minute that <br />
        <em>feels like ten.</em>
      </SectionHead>
      <div className="flex flex-wrap gap-x-16 gap-y-10">
        <div data-reveal className="flex-[1_1_560px] text-[17px] leading-[1.7] text-ink-soft [column-gap:48px] [column-width:300px]">
          <p className="m-0 mb-[18px] first-letter:float-left first-letter:mt-1.5 first-letter:mr-3 first-letter:font-serif first-letter:text-[112px] first-letter:leading-[0.75] first-letter:text-ink">
            You sign in at the dropzone with your photo ID, meet your instructor for the safety briefing and step
            into your harness. Then the aircraft climbs to 13,000 ft, with the Gulf of Thailand on the horizon.
          </p>
          <p className="m-0 mb-[18px]">
            The door opens. For around sixty seconds you fall. Then the canopy opens, and the next five to seven
            minutes are quiet and slow, spent under the parachute along the coast and back to the dropzone.
          </p>
          <p className="m-0">
            No experience is needed: a USPA-certified tandem instructor flies the jump. The aircraft, altitude and
            instructors are the same in every package. All you choose is how you&apos;d like to remember it.
          </p>
        </div>
        <figure data-reveal className="m-0 flex flex-[1_1_360px] flex-col gap-3">
          <div className="relative h-[clamp(380px,45vw,520px)] overflow-hidden">
            <Image
              src={instructor}
              alt="A tandem instructor with a customer at the dropzone"
              fill
              placeholder="blur"
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="text-[13px] text-muted italic">
            Your instructor stays with you from briefing to touchdown.
          </figcaption>
        </figure>
      </div>
      <blockquote data-reveal className="mx-auto mt-10 flex max-w-[980px] flex-col gap-[18px] text-center">
        <p className="m-0 font-serif text-[clamp(34px,4.4vw,68px)] leading-[1.05] tracking-[-0.02em] italic">
          &ldquo;Same aircraft, altitude and instructors in every package.&rdquo;
        </p>
        <cite className="eyebrow text-muted not-italic">From the Sea View Skydiving page</cite>
      </blockquote>
    </section>
  );
}

export function Film() {
  return (
    <section id="film" aria-labelledby="film-title" className="mt-[clamp(96px,12vw,140px)] scroll-mt-0 bg-ink text-foam">
      <div className="gutter flex flex-col gap-10 py-[clamp(80px,10vw,120px)]">
        <div data-reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-[18px]">
            <p className="m-0 text-[12px] tracking-[0.3em] text-gold">— THE FILM —</p>
            <h2 id="film-title" className="display m-0 text-[clamp(44px,6vw,96px)]">
              See it <em className="text-gold">before</em>
              <br />
              you feel it.
            </h2>
          </div>
          <p className="m-0 max-w-[360px] text-[15px] leading-relaxed text-mist">
            The main video of the jump from the Sea View page: aircraft exit and freefall over the Gulf of Thailand.
          </p>
        </div>
        <AmbientVideo
          data-reveal
          src="/media/sea-view-film.mp4"
          poster="/media/sea-view-film-poster.jpg"
          aria-label="Main video of the Sea View tandem jump"
          className="block aspect-video w-full bg-forest object-cover"
        />
        <div className="flex flex-wrap justify-between gap-3 text-[13px] text-sage">
          <span className="italic">Watch the main video of the jump. Film: greedyadventures.com</span>
          <span className="tracking-[0.14em]">13,000 FT · ~60 S FREEFALL · 5–7 MIN CANOPY</span>
        </div>
      </div>
    </section>
  );
}

type Frame = { n: string; title: string; note: string; img: StaticImageData; alt: string; grow: string; tall?: boolean; position?: string };

const FRAMES: Frame[] = [
  { n: "01", title: "Check-in", note: "Sign in, bring photo ID.", img: checkIn, alt: "Guests completing check-in at the dropzone reception", grow: "flex-[3_1_620px]", tall: true, position: "object-[center_40%]" },
  { n: "02", title: "Briefing & gear", note: "Harness fitting.", img: gear, alt: "An instructor fitting a customer's tandem harness", grow: "flex-[2_1_480px]", tall: true },
  { n: "03", title: "The climb", note: "Up to 13,000 ft.", img: plane, alt: "The jump aircraft on the runway at the dropzone", grow: "flex-[2_1_380px]" },
  { n: "04", title: "Exit & freefall", note: "~60 seconds.", img: exit, alt: "A tandem pair just after leaving the aircraft", grow: "flex-[1.5_1_300px]" },
  { n: "05", title: "Canopy & landing", note: "5–7 minutes.", img: canopy, alt: "A tandem pair landing under a black and yellow canopy", grow: "flex-[2_1_380px]" },
];

export function PhotoEssay() {
  return (
    <section id="essay" aria-labelledby="essay-title" className="gutter flex scroll-mt-6 flex-col gap-10 pt-[clamp(96px,12vw,140px)]">
      <SectionHead id="essay-title" eyebrow="Photo essay · About 3 hours">
        The day, <br />
        <em>in five frames.</em>
      </SectionHead>
      <ol className="m-0 flex list-none flex-wrap gap-4 p-0">
        {FRAMES.map((f) => (
          <li key={f.n} data-reveal className={`${f.grow} flex flex-col gap-2.5`}>
            <figure className="m-0 flex flex-col gap-2.5">
              <div className={`relative overflow-hidden ${f.tall ? "h-[clamp(360px,42vw,560px)]" : "h-[clamp(300px,32vw,420px)]"}`}>
                <Image
                  src={f.img}
                  alt={f.alt}
                  fill
                  placeholder="blur"
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className={`object-cover transition-transform duration-[1.6s] ease-[var(--ease-editorial)] hover:scale-[1.03] ${f.position ?? ""}`}
                />
              </div>
              <figcaption className="flex items-baseline gap-3.5">
                <span className="text-[12px] text-muted">{f.n}</span>
                <span className="font-serif text-[24px]">{f.title}</span>
                <span className="text-[14px] text-muted">{f.note}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ol>
    </section>
  );
}
