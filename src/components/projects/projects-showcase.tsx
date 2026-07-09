import { projects } from "~/data/projects";
import ProjectSection from "./project-section";

export default function ProjectsShowcase() {
  return (
    <div className="h-[calc(100vh-3.5rem)] snap-y snap-mandatory overflow-y-auto overscroll-contain scroll-smooth">
      {projects.map((project, index) => (
        <ProjectSection
          key={project.slug}
          project={project}
          projectNumber={index + 1}
          totalProjects={projects.length}
        />
      ))}
    </div>
  );
}
