import { type Metadata } from "next";
import Footer from "../_components/footer";
import NavBar from "../_components/navbar";
import AshFieldCanvas from "~/components/portfolio/ash-field-canvas";

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
    <div className="relative isolate min-h-screen overflow-hidden">
      <AshFieldCanvas />

      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col">
        <NavBar className="" />
        <div className="flex w-full flex-1 flex-col">{children}</div>
        <Footer className="" />
      </div>
    </div>
  );
}
