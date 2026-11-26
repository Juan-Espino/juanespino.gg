import SignInButton from "~/components/sign-in-button";
import SignOutButton from "~/components/sign-out-button";
import SiteNav, { NavLink, navLinkClass } from "~/components/site-nav";
import { blogginRoutes } from "~/lib/routes";
import { getIsAdmin } from "~/server/better-auth/admin";
import { getSession } from "~/server/better-auth/server";
import BlogNavLinks from "./blog-nav-links";

// Strip the ghost button's chrome so account actions read as plain nav links.
const accountButtonClass = `${navLinkClass} h-auto p-0 text-[length:inherit] font-[inherit] hover:bg-transparent dark:hover:bg-transparent`;

type NavBarProps = {
  className?: string;
};
export default async function NavBar({ className }: NavBarProps) {
  const [session, isAdmin] = await Promise.all([getSession(), getIsAdmin()]);
  const isSignedIn = !!session?.user;

  return (
    <SiteNav
      className={className}
      primary={<BlogNavLinks isAdmin={isAdmin} />}
      secondary={
        <>
          {isSignedIn ? (
            <SignOutButton className={accountButtonClass} />
          ) : (
            <SignInButton className={accountButtonClass} />
          )}
          {isAdmin && (
            <>
              <NavLink href={blogginRoutes.drafts} label="drafts" />
              <NavLink href={blogginRoutes.new} label="new+" tone="accent" />
            </>
          )}
        </>
      }
    />
  );
}
