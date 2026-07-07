import DottedGridBackground from "~/components/portfolio/dotted-grid-background";
import PortfolioNavBar from "~/components/portfolio/navbar";

export default function PortfolioLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative isolate min-h-screen overflow-x-hidden">
      <DottedGridBackground />

      <div className="relative z-10 flex min-h-screen flex-col">
        <PortfolioNavBar />

        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
