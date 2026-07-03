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
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col">
      <NavBar className="" />
      <div className="flex w-full flex-1 flex-col">{children}</div>
      <Footer className="" />
    </div>
  );
}
