import { Button } from "../ui/button";
import EmailButton from "./email-button";
import Reveal from "../motion/reveal";
import GlitchText from "~/components/motion/glitch-text";

export default function PortfolioCopy() {
  return (
    <section className="flex flex-col gap-4">
      <Reveal
        as="h1"
        className="text-center text-2xl font-bold tracking-wide sm:text-5xl lg:text-start"
      >
        <GlitchText text="Juan Espino" trigger="entrance" />
      </Reveal>
      <Reveal as="p" index={1} className="text-lg leading-loose">
        {
          "Software engineer in Los Angeles building web experiences, visual systems, and focused tools."
        }
      </Reveal>
      <Reveal as="p" index={2} className="text-lg leading-loose">
        {
          "I like turning abstract ideas into polished tools that feel clear, useful, and carefully crafted. "
        }
      </Reveal>
      {/* Social links, centered, separated by the same vertical rule as the
          header. */}
      <Reveal index={3} className="flex items-center justify-center gap-2">
        <Button
          asChild
          variant="ghost"
          className="relative inline-flex min-w-16 items-center justify-center overflow-hidden transition-colors duration-500"
        >
          <a
            rel="noreferrer noopener"
            className=""
            href="https://github.com/Juan-Espino"
            target="_blank"
          >
            <GlitchText text="GitHub" />
          </a>
        </Button>
        <span aria-hidden="true" className="bg-bloggin-border/40 h-5 w-px" />
        <Button
          asChild
          variant="ghost"
          className="relative inline-flex min-w-16 items-center justify-center overflow-hidden transition-colors duration-500"
        >
          <a
            rel="noreferrer noopener"
            className=""
            href="https://x.com/greyppk"
            target="_blank"
          >
            <GlitchText text="X" />
          </a>
        </Button>
        <span aria-hidden="true" className="bg-bloggin-border/40 h-5 w-px" />
        <Button
          asChild
          variant="ghost"
          className="relative inline-flex min-w-16 items-center justify-center overflow-hidden transition-colors duration-500"
        >
          <a
            rel="noreferrer noopener"
            className=""
            href="https://www.linkedin.com/in/juan-espino-03591241b/"
            target="_blank"
          >
            <GlitchText text="LinkedIn" />
          </a>
        </Button>
        <span aria-hidden="true" className="bg-bloggin-border/40 h-5 w-px" />
        <EmailButton className="relative inline-flex min-w-16 items-center justify-center overflow-hidden transition-colors duration-500" />
      </Reveal>
    </section>
  );
}
