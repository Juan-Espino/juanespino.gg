export type ProjectSlide = {
  title: string;
  eyebrow: string;
  description: string;
  image?: string;
};

export type Project = {
  title: string;
  slug: string;
  tech: string[];
  liveUrl?: string;
  repoUrl?: string;
  role: string;
  year: string;
  slides: ProjectSlide[];
};

export const projects: Project[] = [
  {
    title: "StepOvers",
    slug: "stepovers",
    tech: ["Next.js", "PostgreSQL", "TypeScript", "Tailwind CSS"],
    liveUrl: "https://stepovers.juanespino.gg",
    role: "Full-stack product build",
    year: "2026",
    slides: [
      {
        eyebrow: "Overview",
        title: "Match predictions shaped around the viewer",
        description:
          "A Premier League prediction app built around personalized match interests and watch-worthiness.",
      },
      {
        eyebrow: "Problem",
        title: "Prediction tools usually flatten the experience",
        description:
          "A 90 minute match is a commitment. The product idea is to score games through preferences instead of generic hype, is this game worth your time?",
      },
      {
        eyebrow: "System",
        title: "A typed product flow from data to interface",
        description:
          "Next.js, PostgreSQL, TypeScript, and Tailwind power the app shell, prediction surfaces, and reusable UI.",
      },
    ],
  },
  {
    title: "Bloggin",
    slug: "bloggin",
    tech: ["Next.js", "Better Auth", "Drizzle", "UploadThing"],
    liveUrl: "/bloggin",
    role: "Product design and engineering",
    year: "2026",
    slides: [
      {
        eyebrow: "Writing",
        title: "A minimal publishing surface",
        description:
          "A personal writing app with authentication, drafts, markdown articles, and a portfolio-first route structure.",
      },
      {
        eyebrow: "Workflow",
        title: "Draft, edit, publish, and share",
        description:
          "Admin-only creation flows, markdown editing, article status, and share URLs sit under the /bloggin section.",
      },
      {
        eyebrow: "Restructure",
        title: "Portfolio shell with a dedicated blog section",
        description:
          "The app now separates the personal site from the Bloggin workflow while keeping one consistent stack.",
      },
    ],
  },
];
