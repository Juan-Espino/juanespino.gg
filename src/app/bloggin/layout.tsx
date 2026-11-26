import { type Metadata } from "next";
import Footer from "../_components/footer";
import NavBar from "../_components/navbar";

export const metadata: Metadata = {
  title: {
    default: "bloggin",
    template: "%s | bloggin",
  },
  description: "Created for the sole purpose of human expression.",
};

export default function BlogginLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative isolate min-h-screen overflow-clip">
      {/* 1rem gutter from tablets up (content still maxes at 64rem); phones
          keep full-bleed heroes and the edge-to-edge latest strip. */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[66rem] flex-col md:px-4">
        <NavBar className="" />
        <div className="flex w-full flex-1 flex-col">{children}</div>
        <Footer className="" />
      </div>
    </div>
  );
}
