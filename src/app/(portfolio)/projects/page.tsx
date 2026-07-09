import { type Metadata } from "next";
import ProjectsShowcase from "~/components/projects/projects-showcase";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected projects by Juan Espino.",
};

export default function ProjectsPage() {
  return <ProjectsShowcase />;
}
