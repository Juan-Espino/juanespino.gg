import PortfolioHero from "~/components/portfolio/portfolio-hero";

export default function Home() {
  return (
    <main className="h-[calc(100dvh-3.5rem)] overflow-hidden">
      <div className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center px-4 lg:min-h-screen">
        <PortfolioHero />
      </div>
    </main>
  );
}
