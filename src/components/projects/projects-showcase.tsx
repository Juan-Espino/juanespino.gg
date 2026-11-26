"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { projects } from "~/data/projects";
import styles from "./projects-showcase.module.css";
import Reveal from "../motion/reveal";

const gallery = [
  {
    title: "Tikr",
    slug: "tikr",
    description: "Historical portfolio lab",
    liveUrl: "https://tikr-lovat.vercel.app",
  },
  ...projects.map((project) => ({
    ...project,
    description:
      project.slug === "stepovers"
        ? "Personalized match predictions"
        : "Personal publishing platform",
  })),
];

export default function ProjectsShowcase() {
  const [active, setActive] = useState<string | null>(null);
  return (
    <section aria-label="Selected projects" className={styles.section}>
      <div className={styles.gallery} onMouseLeave={() => setActive(null)}>
        {gallery.map((project, index) => {
          const expanded = active === project.slug;
          return (
            <Reveal
              as="article"
              index={index}
              key={project.slug}
              className={styles.project}
              data-active={expanded}
              data-project={project.slug}
              onMouseEnter={() => setActive(project.slug)}
              onFocus={() => setActive(project.slug)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget))
                  setActive(null);
              }}
            >
              <div
                className={
                  project.slug === "stepovers"
                    ? styles.fluidMedia
                    : styles.fixedMedia
                }
              >
                <Image
                  src={`/projects/${project.slug}.png`}
                  alt={project.title}
                  fill
                  sizes="(max-width: 767px) 100vw, 75vw"
                  className={styles.image}
                  priority
                />
              </div>
              <button
                type="button"
                className={styles.expand}
                aria-label={`Show ${project.title}`}
                aria-expanded={expanded}
                onClick={() => setActive(project.slug)}
              />
              <div className={styles.details} inert={!expanded}>
                <h2 className="text-sm font-medium tracking-[0.3em] text-white uppercase">
                  {project.title}
                </h2>
                <p className="mt-1 text-xs leading-relaxed font-medium tracking-[0.18em] text-zinc-300 uppercase">
                  {project.description}
                </p>
                <div className="mt-4 flex items-stretch justify-between border-t border-white/10">
                  <span className="self-center pt-3 text-xs tracking-widest text-zinc-400">
                    2026
                  </span>
                  <Link
                    href={project.liveUrl ?? "#"}
                    target={
                      project.liveUrl?.startsWith("http") ? "_blank" : undefined
                    }
                    rel={
                      project.liveUrl?.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    // Fills the bottom-right corner of the card: half the row,
                    // stretched through the card's padding to its edges, with
                    // the label centered in it. Hover glows like the latest
                    // articles cards.
                    className={`${styles.visit} -mr-6 -mb-6 inline-flex w-1/2 items-center justify-center gap-2 rounded-br-2xl py-[18px] text-xs font-medium tracking-[0.22em] text-zinc-300 uppercase hover:text-white focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white max-md:-mr-5 max-md:-mb-5 max-md:py-4`}
                    aria-label={`Visit ${project.title}`}
                  >
                    Visit{" "}
                    <ExternalLink aria-hidden="true" className="size-3.5" />
                  </Link>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
