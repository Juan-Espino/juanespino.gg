import Link from "next/link";
import { type ReactNode } from "react";
import GlitchText from "~/components/motion/glitch-text";

/**
 * The one header used across the app: centered, portfolio typography, muted
 * links that brighten slowly on hover. Each section supplies its own items;
 * `secondary` (account actions) sits after a small separator.
 */
export const navLinkClass =
  "text-bloggin-muted hover:text-bloggin-foreground focus-visible:text-bloggin-foreground transition-colors duration-500 focus-visible:outline-none";

type NavLinkProps = {
  href: string;
  label: string;
  tone?: "muted" | "brand" | "accent";
};

const toneClass: Record<NonNullable<NavLinkProps["tone"]>, string> = {
  muted: navLinkClass,
  brand:
    "text-bloggin-foreground hover:text-bloggin-accent focus-visible:text-bloggin-accent transition-colors duration-500 focus-visible:outline-none",
  accent:
    "text-bloggin-accent hover:text-bloggin-foreground focus-visible:text-bloggin-foreground transition-colors duration-500 focus-visible:outline-none",
};

export function NavLink({ href, label, tone = "muted" }: NavLinkProps) {
  return (
    <Link href={href} className={toneClass[tone]}>
      <GlitchText text={label} />
    </Link>
  );
}

type SiteNavProps = {
  primary: ReactNode;
  secondary?: ReactNode;
  className?: string;
};

export default function SiteNav({
  primary,
  secondary,
  className,
}: SiteNavProps) {
  return (
    <nav
      className={`${className ?? ""} flex min-h-14 flex-wrap items-center justify-center gap-x-5 gap-y-1 px-4 py-3 text-base font-semibold sm:text-lg`}
    >
      <div className="flex items-center gap-5">{primary}</div>
      {secondary ? (
        <>
          {/* Vertical rule between navigation and account actions. */}
          <span aria-hidden="true" className="bg-bloggin-border/40 h-5 w-px" />
          <div className="flex items-center gap-5">{secondary}</div>
        </>
      ) : null}
    </nav>
  );
}
