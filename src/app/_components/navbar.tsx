import Link from "next/link";
import SignInButton from "~/components/sign-in-button";
import SignOutButton from "~/components/sign-out-button";
import { getSession } from "~/server/better-auth/server";

type NavBarProps = {
  className?: string;
};
export default async function NavBar({ className }: NavBarProps) {
  const session = await getSession();
  return (
    <nav className={`${className ?? ""} flex gap-4`}>
      {/* TODO:add link to home from bloggin */}
      <p>bloggin</p>
      <Link href={"/articles"}>all articles</Link>
      <p></p>

      {/* TODO:sign in dialog */}
      {session?.user ? <SignOutButton /> : <SignInButton />}

      {/* //TODO:make sure user is admin 
        if so new +
        if so drafts
      */}
      <Link href={"/drafts"}>drafts</Link>

      <Link href={"/new"} className="text-bloggin-accent!">
        new+
      </Link>
    </nav>
  );
}
