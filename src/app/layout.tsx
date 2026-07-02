import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import NavBar from "./_components/navbar";
import Footer from "./_components/footer";
import { cn } from "~/lib/utils";
import { Toaster } from "~/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// TODO:change title and public favicon
export const metadata: Metadata = {
  title: "bloggin",
  description: "created for the sole purpose of human expression",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn(geist.variable, "font-sans", inter.variable)}>
      <body className="mx-auto flex min-h-screen w-full max-w-5xl flex-col">
        <NavBar className="" />
        <div className="flex w-full flex-1 flex-col">{children}</div>
        <Footer className="" />
        <Toaster />
      </body>
    </html>
  );
}
