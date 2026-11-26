import Link from "next/link";
import { blogginRoutes } from "~/lib/routes";
import type { ArticleLinks } from "~/server/articles";
import Reveal from "./motion/reveal";

type ListArticlesProps = {
  articles: ArticleLinks[];
  draft?: boolean;
};

function formatListDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  }).format(date);
}

export default function ListArticles({ articles, draft }: ListArticlesProps) {
  return (
    <div className="flex w-full flex-col gap-2 font-mono">
      {articles.map((article, index) => (
        <Reveal key={article.slug} index={index}>
          {/* Each row sits on its own frosted panel so it reads cleanly over
              the dotted background; the ring lights up on hover/focus. */}
          <Link
            href={
              draft
                ? blogginRoutes.edit(article.slug)
                : blogginRoutes.article(article.slug)
            }
            className="group bg-bloggin-background/40 hover:ring-bloggin-accent focus-visible:ring-bloggin-accent grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-6 rounded-xl px-4 py-4 ring-1 ring-white/8 backdrop-blur-sm transition-shadow duration-200 ring-inset focus-visible:outline-none"
          >
            <span className="text-bloggin-muted group-hover:text-bloggin-foreground truncate text-sm font-bold transition-colors duration-200 sm:text-base">
              {article.title}
            </span>
            <time
              dateTime={article.createdAt.toISOString()}
              className="text-bloggin-muted/70 group-hover:text-bloggin-muted text-xs font-semibold whitespace-nowrap transition-colors duration-200 sm:text-sm"
            >
              {formatListDate(article.createdAt)}
            </time>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
