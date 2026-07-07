import PortfolioHero from "~/components/portfolio/portfolio-hero";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-4">
        <PortfolioHero />
      </div>
    </main>
  );
}
