import PortfolioHero from "~/components/portfolio/portfolio-hero";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100dvh-3.5rem)] flex-col lg:h-[calc(100dvh-3.5rem)] lg:overflow-hidden">
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-6 lg:min-h-screen lg:py-0">
        <PortfolioHero />
      </div>
    </main>
  );
}
