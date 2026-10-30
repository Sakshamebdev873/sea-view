import Image from "next/image";
import cover from "@/assets/photos/eco.jpg";
import { AskButton } from "./client";
import { FACTS, SITE } from "./content";

export function Masthead() {
  return (
    <header className="gutter grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-line py-5 text-[11px] tracking-[0.16em] sm:text-[12px]">
      <span className="text-muted">
        N° 01 <span className="hidden sm:inline">— THAILAND</span>
      </span>
      <a href={SITE} className="justify-self-center font-serif text-[20px] tracking-normal whitespace-nowrap sm:text-[22px]">
        Greedy Adventures
      </a>
      <a href="#menu" className="link-underline justify-self-end whitespace-nowrap">
        <span className="hidden sm:inline">FROM </span>฿9,500
      </a>
    </header>
  );
}

/** The redesigned hero: a magazine cover with the title set over the photo. */
export function Cover() {
  return (
    <section aria-labelledby="cover-title" className="gutter pt-6">
      <h1
        id="cover-title"
        className="display rise relative z-10 m-0 text-center text-[clamp(84px,20vw,300px)] leading-[0.8] tracking-[-0.055em]"
      >
        Sea View
        <span className="sr-only"> Skydiving — tandem jump over Pattaya</span>
      </h1>
      <div className="relative -mt-[clamp(14px,2vw,28px)] h-[clamp(560px,82vh,840px)] overflow-hidden bg-forest text-white">
        <Image
          src={cover}
          alt="A tandem skydiver and instructor in freefall above the clouds, with the coastline far below"
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="cover-drift object-cover object-[center_35%]"
        />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-black/35 to-transparent" />
        <p className="absolute top-[clamp(28px,6vw,72px)] left-[clamp(20px,4vw,48px)] m-0 max-w-[min(330px,60%)] font-serif text-[clamp(28px,3.4vw,50px)] leading-[1.02] [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]">
          The sixty-second <em>freefall</em> over the Gulf of Thailand
        </p>
        <p className="absolute top-[clamp(28px,6vw,72px)] right-[clamp(20px,4vw,48px)] m-0 hidden max-w-[260px] text-right font-serif text-[clamp(24px,2.6vw,36px)] leading-[1.05] [text-shadow:0_2px_24px_rgba(0,0,0,0.35)] md:block">
          Inside: Eco, Deluxe &amp; VIP, side by side
        </p>
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 bg-ink/85 px-[clamp(20px,4vw,48px)] py-4 text-[11px] tracking-[0.16em] backdrop-blur-sm sm:text-[12px]">
          <ul className="m-0 flex list-none flex-wrap gap-x-7 gap-y-2 p-0 uppercase">
            {FACTS.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <span className="text-gold">FROM ฿9,500 PER PERSON</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
        <p className="m-0 text-[13px] text-muted italic">
          Cover: tandem freefall above the clouds. Photo: greedyadventures.com
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="#menu"
            className="inline-flex min-h-12 items-center rounded-full bg-ink px-6 text-[13px] tracking-[0.14em] text-foam transition-colors hover:bg-forest"
          >
            SEE THE PACKAGES
          </a>
          <AskButton className="inline-flex min-h-12 items-center rounded-full border border-ink px-6 text-[13px] tracking-[0.14em] transition-colors hover:bg-ink hover:text-foam">
            ASK A QUESTION
          </AskButton>
        </div>
      </div>
    </section>
  );
}
