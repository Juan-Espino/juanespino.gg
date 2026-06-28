import Link from "next/link";

type NavBarProps = {
  className?: string;
};
export default function NavBar({ className }: NavBarProps) {
  return (
    <nav className={`${className ?? ""} flex gap-4`}>
      {/* TODO:add link to home from bloggin */}
      <p>bloggin</p>
      <p>all articles</p>
      <p></p>
      <p>sign in</p>
      {/* //TODO:make sure user is admin 
        if so logout button
        if so new +
        if so drafts
      */}
      <Link href={"/new"} className="text-bloggin-accent!">
        new+
      </Link>
    </nav>
  );
}
