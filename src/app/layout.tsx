import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import { cn } from "~/lib/utils";
import { Toaster } from "~/components/ui/sonner";
import DottedGridBackground from "~/components/portfolio/dotted-grid-background";
import PageTransition from "~/components/page-transition";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "Juan Espino",
    template: "%s | Juan Espino",
  },
  description: "Personal portfolio and writing by Juan Espino.",
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
    <html
      lang="en"
      className={
        cn(geist.variable, "font-sans", inter.variable) + " scrollbar-none!"
      }
    >
      <body className="min-h-screen">
        {/* Shared by the portfolio and the blog; mounted once so it keeps
            animating across route changes instead of re-seeding. */}
        <DottedGridBackground />
        {children}
        <Toaster position="top-right" />
        <PageTransition />
        {/* Entrances wait for JS to say the curtain lifted; without JS,
            show everything as-is. */}
        <noscript>
          <style>{`.reveal[data-reveal]{opacity:1!important;animation:none!important}[data-scramble]{visibility:visible!important}`}</style>
        </noscript>
      </body>
    </html>
  );
}
