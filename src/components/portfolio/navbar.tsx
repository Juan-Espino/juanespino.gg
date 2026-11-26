"use client";
import { usePathname } from "next/navigation";
import SiteNav, { NavLink } from "../site-nav";

export default function NavBar() {
  const pathname = usePathname();
  const isProjectsPage = pathname === "/projects";

  return (
    <SiteNav
      primary={
        <>
          {isProjectsPage ? (
            <NavLink href="/" label="Home" />
          ) : (
            <NavLink href="/projects" label="Projects" />
          )}
          <NavLink href="/bloggin" label="Blog" />
        </>
      }
    />
  );
}
