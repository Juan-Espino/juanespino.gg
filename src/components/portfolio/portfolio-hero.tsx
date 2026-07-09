import PortfolioCopy from "./portfolio-copy";
import PortfolioStatueStage from "./portfolio-statue-stage";

export default function PortfolioHero() {
  return (
    <div className="grid w-full grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-center lg:gap-10">
      <div className="order-1 lg:order-2">
        <PortfolioStatueStage />
      </div>
      <div className="order-2 lg:order-1">
        <PortfolioCopy />
      </div>
    </div>
  );
}
