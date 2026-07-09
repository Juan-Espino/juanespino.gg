"use client";

import EmblaCarousel, { type EmblaCarouselType } from "embla-carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { type ProjectSlide } from "~/data/projects";

type ProjectCarouselProps = {
  projectTitle: string;
  slides: ProjectSlide[];
};

export default function ProjectCarousel({
  projectTitle,
  slides,
}: ProjectCarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const emblaRef = useRef<EmblaCarouselType | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const updateSelectedSlide = useCallback((embla: EmblaCarouselType) => {
    setSelectedIndex(embla.selectedScrollSnap());
  }, []);

  const scrollPrev = useCallback(() => {
    emblaRef.current?.scrollPrev();
  }, []);

  const scrollNext = useCallback(() => {
    emblaRef.current?.scrollNext();
  }, []);

  const scrollTo = useCallback((index: number) => {
    emblaRef.current?.scrollTo(index);
  }, []);

  useEffect(() => {
    if (!viewportRef.current) {
      return;
    }

    const embla = EmblaCarousel(viewportRef.current, {
      align: "center",
      containScroll: "trimSnaps",
      loop: true,
    });

    emblaRef.current = embla;
    setScrollSnaps(embla.scrollSnapList());
    updateSelectedSlide(embla);

    embla.on("select", updateSelectedSlide);
    embla.on("reInit", updateSelectedSlide);

    return () => {
      embla.destroy();
      emblaRef.current = null;
    };
  }, [updateSelectedSlide]);

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div className="relative flex min-h-[42vh] items-center justify-center sm:min-h-[48vh] lg:min-h-[52vh]">
        <button
          type="button"
          aria-label={`Previous ${projectTitle} slide`}
          className="absolute left-0 z-10 inline-flex size-10 items-center justify-center text-zinc-300 transition-colors duration-300 hover:text-white focus-visible:text-white focus-visible:outline-none sm:left-8"
          onClick={scrollPrev}
        >
          <ChevronLeft
            aria-hidden="true"
            className="size-6"
            strokeWidth={1.8}
          />
        </button>
        <div className="w-full px-10 sm:px-20">
          <div className="overflow-hidden" ref={viewportRef}>
            <div className="flex touch-pan-y">
              {slides.map((slide) => (
                <article
                  key={`${projectTitle}-${slide.eyebrow}`}
                  className="flex min-w-0 flex-[0_0_100%] items-center justify-center px-2"
                >
                  <ProjectSlideVisual
                    projectTitle={projectTitle}
                    slide={slide}
                  />
                </article>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          aria-label={`Next ${projectTitle} slide`}
          className="absolute right-0 z-10 inline-flex size-10 items-center justify-center text-zinc-300 transition-colors duration-300 hover:text-white focus-visible:text-white focus-visible:outline-none sm:right-8"
          onClick={scrollNext}
        >
          <ChevronRight
            aria-hidden="true"
            className="size-6"
            strokeWidth={1.8}
          />
        </button>
      </div>

      <div className="mt-2 flex items-center justify-center gap-2">
        {scrollSnaps.map((_, index) => (
          <button
            key={`${projectTitle}-dot-${index}`}
            type="button"
            aria-label={`Go to ${projectTitle} slide ${index + 1}`}
            aria-current={selectedIndex === index ? "true" : undefined}
            className={`size-1.5 rounded-full transition-colors duration-500 ${
              selectedIndex === index ? "bg-zinc-100" : "bg-zinc-700"
            }`}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
}

type ProjectSlideVisualProps = {
  projectTitle: string;
  slide: ProjectSlide;
};

function ProjectSlideVisual({ projectTitle, slide }: ProjectSlideVisualProps) {
  return (
    <div className="flex aspect-4/3 w-full max-w-xl flex-col items-center justify-center text-center sm:aspect-16/10">
      <p className="text-[0.65rem] font-medium tracking-[0.3em] text-zinc-600 uppercase">
        {slide.eyebrow}
      </p>

      <div className="my-10 flex w-full max-w-md items-center justify-center">
        <div className="relative h-40 w-40 sm:h-56 sm:w-56">
          <div className="absolute inset-0 rounded-full border border-zinc-800/80" />
          <div className="absolute inset-6 rounded-full border border-zinc-700/70" />
          <div className="absolute top-1/2 left-1/2 h-px w-48 -translate-x-1/2 bg-zinc-800 sm:w-64" />
          <div className="absolute top-1/2 left-1/2 h-48 w-px -translate-y-1/2 bg-zinc-800 sm:h-64" />
          <div className="absolute inset-x-4 top-1/2 h-12 -translate-y-1/2 border-y border-zinc-700/70" />
          <div className="absolute inset-y-4 left-1/2 w-12 -translate-x-1/2 border-x border-zinc-700/70" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="max-w-32 text-lg font-semibold tracking-wide text-balance text-zinc-200 uppercase sm:max-w-40 sm:text-2xl">
              {projectTitle}
            </span>
          </div>
        </div>
      </div>

      <h2 className="max-w-lg text-xl font-semibold tracking-wide text-zinc-100 sm:text-3xl">
        {slide.title}
      </h2>

      <p className="mt-4 max-w-md text-sm leading-6 text-zinc-500 sm:text-base">
        {slide.description}
      </p>
    </div>
  );
}
