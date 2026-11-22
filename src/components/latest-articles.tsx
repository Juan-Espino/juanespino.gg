import Image from "next/image";
import ArticlePrefetchLink from "./article-prefetch-link";
import { blogginRoutes } from "~/lib/routes";
import type { ArticleCard } from "~/server/articles";
import styles from "./latest-articles.module.css";

type LatestArticlesProps = {
  latestArticles: ArticleCard[];
};

function LatestArticleCard({
  article,
  duplicate = false,
}: {
  article: ArticleCard;
  duplicate?: boolean;
}) {
  return (
    <ArticlePrefetchLink
      href={blogginRoutes.article(article.slug)}
      tabIndex={duplicate ? -1 : undefined}
      className={`${styles.card} group w-48 shrink-0 sm:w-56`}
    >
      <div
        className={`${styles.imageFrame} bg-bloggin-background relative aspect-3/2 rounded-xl`}
      >
        {article.imageUrl ? (
          <Image
            fill
            src={article.imageUrl}
            alt={article.title}
            sizes="(max-width: 640px) 12rem, 14rem"
            className="rounded-xl object-cover"
          />
        ) : null}
      </div>

      <h3 className="text-bloggin-foreground group-hover:text-bloggin-accent mt-2 line-clamp-2 text-center text-sm font-bold italic transition-colors sm:text-base">
        {article.title}
      </h3>
    </ArticlePrefetchLink>
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
      className="mt-6 w-full border-y border-white/8 bg-transparent p-4 backdrop-blur-[2px] sm:p-5 md:rounded-xl md:border-0 md:ring-1 md:ring-white/8 md:ring-inset"
    >
      <h2 className="text-bloggin-muted! text-xl">latest articles ...</h2>

      <div className="-mx-2 mt-4 -mb-2 overflow-hidden p-2">
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
