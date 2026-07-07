import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="min-h-14 px-4 py-3 text-lg font-semibold">
      <div className="flex items-center justify-center gap-5">
        <Link
          href={"/projects"}
          className="text-bloggin-muted hover:text-bloggin-foreground focus-visible:text-bloggin-foreground transition-colors duration-500 focus-visible:outline-none"
        >
          Projects
        </Link>
        <Link
          href={"/bloggin"}
          className="text-bloggin-muted hover:text-bloggin-foreground focus-visible:text-bloggin-foreground transition-colors duration-500 focus-visible:outline-none"
        >
          Blog
        </Link>
      </div>
    </nav>
  );
}
