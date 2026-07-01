import Image from "next/image";
import Link from "next/link";
import type { Article } from "~/server/db/app-schema";

type LatestArticlesProps = {
  latestArticles: Article[];
};

function LatestArticleCard({
  article,
  duplicate = false,
}: {
  article: Article;
  duplicate?: boolean;
}) {
  return (
    <Link
      href={`/article/${article.slug}`}
      tabIndex={duplicate ? -1 : undefined}
      className="group w-48 shrink-0 sm:w-56"
    >
      <div className="bg-bloggin-background relative aspect-3/2 overflow-hidden rounded-xl">
        {article.imageUrl ? (
          <Image
            fill
            src={article.imageUrl}
            alt={article.title}
            sizes="(max-width: 640px) 12rem, 14rem"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>

      <h3 className="text-bloggin-foreground group-hover:text-bloggin-accent mt-2 line-clamp-2 text-center text-sm font-bold italic transition-colors sm:text-base">
        {article.title}
      </h3>
    </Link>
  );
}

export default function LatestArticles({
  latestArticles,
}: LatestArticlesProps) {
  if (!latestArticles.length) return null;

  const hasMobileMarquee = latestArticles.length > 2;
  const hasDesktopMarquee = latestArticles.length > 4;

  return (
    <section
      data-mobile-marquee={hasMobileMarquee}
      data-desktop-marquee={hasDesktopMarquee}
      className="bg-bloggin-border/10 mt-6 w-full rounded-xl p-4 sm:p-5"
    >
      <h2 className="text-bloggin-muted! text-xl">latest articles ...</h2>

      <div className="mt-6 overflow-hidden">
        <div className="bloggin-marquee flex w-max gap-4">
          <div className="flex gap-4">
            {latestArticles.map((article) => (
              <LatestArticleCard key={article.slug} article={article} />
            ))}
          </div>

          <div className="bloggin-marquee-duplicate flex gap-4" aria-hidden>
            {latestArticles.map((article) => (
              <LatestArticleCard
                key={`${article.slug}-duplicate`}
                article={article}
                duplicate
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
