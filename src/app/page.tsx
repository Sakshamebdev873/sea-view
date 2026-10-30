import { Concierge } from "@/components/chat/Concierge";
import { ConciergeProvider } from "@/components/chat/ConciergeProvider";
import { RevealOnScroll } from "@/components/experience/client";
import { Cover, Masthead } from "@/components/experience/Cover";
import { Contents, Feature, Film, PhotoEssay } from "@/components/experience/Editorial";
import { Menu } from "@/components/experience/Menu";
import { Footer, Questions } from "@/components/experience/Questions";
import { getAgentConfig } from "@/lib/agent/config";

export default function Home() {
  // Only the mode label crosses to the browser, never the key or the model config.
  const { mode } = getAgentConfig();

  return (
    <ConciergeProvider mode={mode}>
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-ink px-5 py-3 text-foam focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to content
      </a>
      <Masthead />
      <main id="main" tabIndex={-1} className="outline-none">
        <Cover />
        <Contents />
        <Feature />
        <Film />
        <PhotoEssay />
        <Menu />
        <Questions />
      </main>
      <Footer />
      <Concierge />
      <RevealOnScroll />
    </ConciergeProvider>
  );
}
