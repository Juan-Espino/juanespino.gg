"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { projects } from "~/data/projects";
import styles from "./projects-showcase.module.css";

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
        {gallery.map((project) => {
          const expanded = active === project.slug;
          return (
            <article
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
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-xs tracking-widest text-zinc-400">
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
                    className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.22em] text-zinc-300 uppercase transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    aria-label={`Visit ${project.title}`}
                  >
                    Visit{" "}
                    <ExternalLink aria-hidden="true" className="size-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
