import Image from "next/image";
import Link from "next/link";
import type { Article } from "~/server/db/app-schema";

type LatestArticlesProps = {
  latestArticles: Article[];
};
export default function LatestArticles({
  latestArticles,
}: LatestArticlesProps) {
  if (!latestArticles.length) return null;

  return (
    <section className="bg-bloggin-border/10 mt-6 w-full rounded-xl p-4 sm:p-5">
      <h2 className="text-bloggin-muted! text-xl">latest articles ...</h2>

      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
        {latestArticles.map((article) => (
          <Link
            key={article.slug}
            href={`/article/${article.slug}`}
            className="group min-w-0"
          >
            <div className="bg-bloggin-background relative aspect-3/2 overflow-hidden rounded-xl">
              {article.imageUrl ? (
                <Image
                  fill
                  src={article.imageUrl}
                  alt={article.title}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                />
              ) : null}
            </div>

            <h3 className="text-bloggin-foreground group-hover:text-bloggin-accent mt-2 line-clamp-2 text-center text-sm font-bold italic transition-colors sm:text-base">
              {article.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
