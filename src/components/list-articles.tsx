import Link from "next/link";
import type { ArticleLinks } from "~/server/articles";

type ListArticlesProps = {
  articles: ArticleLinks[];
};

function formatListDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  }).format(date);
}

export default function ListArticles({ articles }: ListArticlesProps) {
  return (
    <div className="w-full font-mono">
      {articles.map((article) => (
        <Link
          key={article.slug}
          href={`/article/${article.slug}`}
          className="group hover:border-bloggin-accent focus-visible:border-bloggin-accent grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-6 border-b border-transparent py-4 transition-colors duration-200 focus-visible:outline-none"
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
      ))}
    </div>
  );
}
