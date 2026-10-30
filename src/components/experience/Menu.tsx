import { AmbientVideo, AskButton } from "./client";
import { PACKAGES, PAGE_URL } from "./content";

/** The redesigned packages section, set like a fine-dining menu. */
export function Menu() {
  return (
    <section id="menu" aria-labelledby="menu-title" className="mt-[clamp(96px,12vw,140px)] scroll-mt-0 bg-ink text-foam">
      <div className="gutter flex flex-wrap items-start gap-16 py-[clamp(96px,12vw,140px)]">
        <figure data-reveal className="m-0 flex min-w-[240px] flex-[0_1_420px] flex-col gap-3.5 max-md:order-last max-md:mx-auto max-md:max-w-[340px]">
          <AmbientVideo
            src="/media/customer-clip.mp4"
            poster="/media/customer-clip-poster.jpg"
            aria-label="A real customer's tandem skydive, filmed on the day"
            className="block aspect-[9/16] w-full border border-gold bg-forest object-cover"
          />
          <figcaption className="text-[13px] text-sage italic">
            A real customer clip from the page. This is what you take home with Deluxe or VIP.
          </figcaption>
        </figure>

        <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-14">
          <div data-reveal className="flex flex-col gap-3.5">
            <p className="m-0 text-[12px] tracking-[0.3em] text-gold">— THE MENU —</p>
            <h2 id="menu-title" className="display m-0 text-[clamp(48px,6vw,88px)] leading-[0.95]">
              Three ways
              <br />
              <em>to fall.</em>
            </h2>
            <p className="m-0 max-w-[460px] text-[15px] leading-relaxed text-mist">
              The same jump in every package. Choose no cameras, instructor video and photos, or a personal
              cameraman. Prices are per person.
            </p>
          </div>

          <ul className="m-0 flex list-none flex-col gap-10 p-0">
            {PACKAGES.map((p) => (
              <li
                key={p.id}
                data-reveal
                className={
                  p.featured
                    ? "flex flex-col gap-2.5 border border-gold px-[clamp(20px,3vw,32px)] py-9"
                    : "flex flex-col gap-2.5 border-b border-forest-line pb-10"
                }
              >
                <article aria-labelledby={`pkg-${p.id}`} className="flex flex-col gap-2.5">
                  {p.featured && <p className="m-0 text-[11px] tracking-[0.3em] text-gold">FULL COVERAGE</p>}
                  <div className="flex items-baseline gap-4">
                    <h3
                      id={`pkg-${p.id}`}
                      className={`m-0 font-serif text-[clamp(40px,5vw,52px)] leading-none font-normal ${p.featured ? "text-gold italic" : ""}`}
                    >
                      {p.name}
                    </h3>
                    <span aria-hidden="true" className="leader text-sage" />
                    <span className="font-serif text-[clamp(30px,4vw,38px)] leading-none">
                      {p.price}
                      <span className="sr-only"> per person</span>
                    </span>
                  </div>
                  <p className="m-0 font-serif text-[22px] text-mist italic">{p.tagline}</p>
                  <p className="m-0 text-[14px] tracking-[0.04em] text-sage">{p.detail}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                    <a
                      href={`${PAGE_URL}#options`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        p.featured
                          ? "inline-flex min-h-[52px] items-center rounded-full bg-gold px-7 text-[13px] tracking-[0.14em] text-ink transition-colors hover:bg-[#e6c675]"
                          : "inline-flex min-h-11 items-center text-[13px] tracking-[0.14em] underline underline-offset-[6px] hover:text-gold"
                      }
                    >
                      CHECK AVAILABILITY ↗<span className="sr-only"> for {p.name} on greedyadventures.com (opens in a new tab)</span>
                    </a>
                    <AskButton
                      question={`Tell me about the ${p.name} package.`}
                      className="inline-flex min-h-11 items-center text-[13px] text-sage underline-offset-[6px] hover:text-foam hover:underline"
                    >
                      Ask about {p.name}
                    </AskButton>
                  </div>
                </article>
              </li>
            ))}
          </ul>

          <p className="m-0 text-[13px] text-sage italic">Bangkok pickup is available as a fixed-price add-on.</p>
        </div>
      </div>
    </section>
  );
}
