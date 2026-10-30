import Link from "next/link";
import { AskButton } from "./client";
import { FAQS, SITE } from "./content";

export function Questions() {
  return (
    <section id="questions" aria-labelledby="faq-title" className="gutter flex scroll-mt-6 flex-wrap gap-x-18 gap-y-12 pt-[clamp(96px,12vw,140px)] pb-14 md:pb-[clamp(96px,12vw,140px)]">
      <div data-reveal className="flex flex-[0_1_360px] flex-col gap-[22px]">
        <p className="eyebrow m-0 text-muted">05 · Questions</p>
        <h2 id="faq-title" className="display m-0 text-[clamp(44px,4.6vw,72px)] leading-[0.95] tracking-[-0.02em]">
          Before you
          <br />
          <em>step out.</em>
        </h2>
        <p className="m-0 text-[15px] leading-relaxed text-muted">
          Anything else? The dropzone assistant answers from this page and can send you the brochure or the film.
        </p>
        <AskButton className="inline-flex min-h-[52px] items-center gap-3 self-start rounded-full border border-ink py-0 pr-[22px] pl-2 text-[15px] font-medium transition-colors hover:bg-ink hover:text-foam">
          <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full bg-ink font-serif text-[19px] text-gold italic">
            G
          </span>
          Ask the dropzone
        </AskButton>
      </div>
      <div data-reveal className="flex-[1_1_560px] border-t border-ink">
        {FAQS.map((f, i) => (
          <details key={f.q} open={i === 0} className="faq group border-b border-line py-[26px]">
            <summary className="flex cursor-pointer items-baseline justify-between gap-6 font-serif text-[clamp(24px,2.6vw,30px)] leading-tight">
              {f.q}
              <span aria-hidden="true" className="shrink-0 font-sans text-[20px] text-muted transition-transform duration-500 ease-editorial group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="m-0 max-w-[620px] pt-3.5 text-[16px] leading-[1.65] text-ink-soft">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="gutter flex flex-col gap-14 bg-ink pt-24 pb-[max(32px,env(safe-area-inset-bottom))] text-foam">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-8">
        <div className="flex flex-col gap-2.5">
          <span className="eyebrow text-gold">This issue</span>
          <span className="font-serif text-[24px]">Sea View Skydiving</span>
          <span className="text-[14px] text-sage">Operated by Dropzone Thailand</span>
        </div>
        <div className="flex flex-col gap-2.5">
          <span className="eyebrow text-gold">Visit</span>
          <address className="text-[14px] leading-relaxed text-mist not-italic">
            Pattaya Sea View, Pattaya, Thailand
            <br />
            95 M.4, Chakphong, Klaeng District, Rayong 21190, Thailand
          </address>
        </div>
        <div className="flex flex-col gap-2.5">
          <span className="eyebrow text-gold">Follow</span>
          <a href="https://instagram.com/greedy_adventures" target="_blank" rel="noopener noreferrer" className="link-underline self-start text-[14px]">
            Instagram · @greedy_adventures
          </a>
          <a href={`${SITE}/contact`} target="_blank" rel="noopener noreferrer" className="link-underline self-start text-[14px]">
            Contact us
          </a>
        </div>
        <div className="flex flex-col gap-2.5">
          <span className="eyebrow text-gold">For reviewers</span>
          <Link href="/knowledge" className="link-underline self-start text-[14px]">
            Knowledge view →
          </Link>
          <span className="text-[14px] text-sage">Demo material is labelled</span>
        </div>
      </div>
      <p aria-hidden="true" className="display m-0 text-center text-[clamp(84px,19vw,290px)] leading-[0.8] tracking-[-0.055em] text-forest-line select-none">
        Sea View
      </p>
      <div className="flex flex-wrap justify-between gap-3 border-t border-forest-line pt-5 text-[12px] text-sage">
        <span>Prototype redesign · Photos and film: greedyadventures.com</span>
        <span className="flex gap-5">
          <a href={`${SITE}/privacy`} className="hover:text-foam">Privacy</a>
          <a href={`${SITE}/terms`} className="hover:text-foam">Terms</a>
          <a href={`${SITE}/cancellations`} className="hover:text-foam">Cancellations</a>
        </span>
      </div>
    </footer>
  );
}
