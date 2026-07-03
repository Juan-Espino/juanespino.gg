import Link from "next/link";
import { blogginRoutes } from "~/lib/routes";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <div className="w-full max-w-xl">
        <p className="text-bloggin-muted text-sm font-semibold tracking-[0.2em] uppercase">
          Portfolio
        </p>
        <h1 className="mt-4 text-4xl font-bold sm:text-6xl">Juan Espino</h1>
        <p className="text-bloggin-muted mt-5 text-base leading-7 sm:text-lg">
          Portfolio coming soon.
        </p>
        <Link
          href={blogginRoutes.home}
          className="border-bloggin-border/60 text-bloggin-foreground hover:border-bloggin-accent hover:text-bloggin-accent focus-visible:border-bloggin-accent focus-visible:text-bloggin-accent mt-8 inline-flex rounded-lg border px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-none"
        >
          Read Bloggin
        </Link>
      </div>
    </main>
  );
}
