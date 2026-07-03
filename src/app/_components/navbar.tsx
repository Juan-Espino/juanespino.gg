import Link from "next/link";
import SignInButton from "~/components/sign-in-button";
import SignOutButton from "~/components/sign-out-button";
import { blogginRoutes } from "~/lib/routes";
import { getIsAdmin } from "~/server/better-auth/admin";
import { getSession } from "~/server/better-auth/server";

type NavBarProps = {
  className?: string;
};
export default async function NavBar({ className }: NavBarProps) {
  const [session, isAdmin] = await Promise.all([getSession(), getIsAdmin()]);
  const isSignedIn = !!session?.user;

  return (
    <nav
      className={`${className ?? ""} flex min-h-14 items-center justify-between gap-6 px-4 py-3 text-sm font-semibold sm:px-0`}
    >
      <div className="flex items-center gap-5">
        <Link
          href={blogginRoutes.home}
          className="text-bloggin-foreground hover:text-bloggin-accent focus-visible:text-bloggin-accent transition-colors focus-visible:outline-none"
        >
          bloggin
        </Link>
        <Link
          href={blogginRoutes.articles}
          className="text-bloggin-muted hover:text-bloggin-foreground focus-visible:text-bloggin-foreground transition-colors focus-visible:outline-none"
        >
          all articles
        </Link>
      </div>

      <div className="border-bloggin-border/40 flex items-center gap-4 border-l pl-5">
        {isSignedIn ? (
          <SignOutButton className="text-bloggin-muted hover:text-bloggin-foreground focus-visible:text-bloggin-foreground transition-colors focus-visible:outline-none" />
        ) : (
          <SignInButton className="text-bloggin-muted hover:text-bloggin-foreground focus-visible:text-bloggin-foreground transition-colors focus-visible:outline-none" />
        )}

        {isAdmin && (
          <>
            <Link
              href={blogginRoutes.drafts}
              className="text-bloggin-muted hover:text-bloggin-foreground focus-visible:text-bloggin-foreground transition-colors focus-visible:outline-none"
            >
              drafts
            </Link>
            <Link
              href={blogginRoutes.new}
              className="text-bloggin-accent hover:text-bloggin-foreground focus-visible:text-bloggin-foreground transition-colors focus-visible:outline-none"
            >
              new+
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
