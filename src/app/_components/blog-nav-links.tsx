"use client";

import { usePathname } from "next/navigation";
import { NavLink } from "~/components/site-nav";
import { blogginRoutes } from "~/lib/routes";

type BlogNavLinksProps = {
  isAdmin: boolean;
};

/** The blog's navigation links; a page's own link is hidden while you're on it. */
export default function BlogNavLinks({ isAdmin }: BlogNavLinksProps) {
  const pathname = usePathname();

  return (
    <>
      <NavLink href={blogginRoutes.home} label="bloggin" tone="brand" />
      {pathname !== blogginRoutes.articles && (
        <NavLink href={blogginRoutes.articles} label="articles" />
      )}
      {!isAdmin && <NavLink href="/" label="portfolio" />}
    </>
  );
}
