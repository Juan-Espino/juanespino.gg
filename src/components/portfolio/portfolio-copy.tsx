import { Button } from "../ui/button";
import EmailButton from "./email-button";

export default function PortfolioCopy() {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-center text-2xl font-bold tracking-wide sm:text-5xl lg:text-start">
        {"Juan Espino"}
      </h1>
      <p className="text-lg leading-loose">
        {
          "Software engineer in Los Angeles building web experiences, visual systems, and focused tools."
        }
      </p>
      <p className="text-lg leading-loose">
        {
          "I like turning abstract ideas into polished tools that feel clear, useful, and carefully crafted. "
        }
      </p>
      <p>{"Find me on"}</p>
      <div className="flex justify-center gap-4 lg:justify-start">
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
            {"GitHub"}
          </a>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="relative inline-flex min-w-16 items-center justify-center overflow-hidden transition-colors duration-500"
        >
          <a
            rel="noreferrer noopener"
            className=""
            href="https://x.com/juandotgg_"
            target="_blank"
          >
            {"X"}
          </a>
        </Button>
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
            {"LinkedIn"}
          </a>
        </Button>
        <EmailButton className="relative inline-flex min-w-16 items-center justify-center overflow-hidden transition-colors duration-500" />
      </div>
    </section>
  );
}
