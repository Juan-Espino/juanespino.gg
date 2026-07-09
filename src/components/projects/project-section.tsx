"use client";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { type Project } from "~/data/projects";
import ProjectCarousel from "./project-carousel";
import { motion, useReducedMotion } from "motion/react";

type ProjectSectionProps = {
  project: Project;
  projectNumber: number;
  totalProjects: number;
};

export default function ProjectSection({
  project,
  projectNumber,
  totalProjects,
}: ProjectSectionProps) {
  const projectPosition = `${String(projectNumber).padStart(2, "0")} / ${String(totalProjects).padStart(2, "0")}`;
  const isExternalLiveUrl = project.liveUrl?.startsWith("http");

  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative flex min-h-[calc(100vh-3.5rem)] snap-start flex-col items-center justify-center px-4 py-8 sm:px-6">
      <motion.div
        initial={
          shouldReduceMotion
            ? false
            : {
                opacity: 0,
                y: 50,
                clipPath: "inset(100% 0 0 0)",
              }
        }
        animate={
          shouldReduceMotion
            ? undefined
            : {
                opacity: 1,
                y: 0,
                clipPath: "inset(0% 0 0 0)",
              }
        }
        transition={{
          duration: 0.75,
          ease: "easeInOut",
        }}
        className="flex w-full max-w-6xl flex-1 flex-col items-center justify-center"
      >
        <div className="w-full">
          <ProjectCarousel
            projectTitle={project.title}
            slides={project.slides}
          />
        </div>

        <div className="mt-10 flex w-full max-w-xl flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-3 text-[0.65rem] font-medium tracking-[0.28em] text-zinc-500 uppercase">
            <span>{projectPosition}</span>
            <span className="h-px w-8 bg-zinc-700" />
            <span>{project.year}</span>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[0.7rem] font-medium tracking-[0.18em] text-zinc-500 uppercase">
            <span>{project.role}</span>
            {project.tech.map((item) => (
              <span
                key={item}
                className="before:mr-3 before:text-zinc-700 before:content-['/']"
              >
                {item}
              </span>
            ))}
          </div>

          {project.liveUrl && (
            <div className="mt-7">
              {isExternalLiveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.22em] text-zinc-300 uppercase transition-colors duration-500 hover:text-white focus-visible:text-white focus-visible:outline-none"
                >
                  Visit
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                </a>
              ) : (
                <Link
                  href={project.liveUrl}
                  className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.22em] text-zinc-300 uppercase transition-colors duration-300 hover:text-white focus-visible:text-white focus-visible:outline-none"
                >
                  Visit
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                </Link>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
