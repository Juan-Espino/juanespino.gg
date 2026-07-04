import PortfolioCopy from "./portfolio-copy";
import PortfolioStatueStage from "./portfolio-statue-stage";

export default function PortfolioHero() {
  return (
    <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      <PortfolioCopy />
      <PortfolioStatueStage />
    </div>
  );
}
