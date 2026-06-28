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
    <div className="flex gap-4">
      {latestArticles.map((article) => (
        <Link
          key={article.slug}
          href={`/article/${article.slug}`}
          className="flex cursor-pointer flex-col border"
        >
          <h2 className="p-4">{article.title}</h2>
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt={article.title}
              width={100}
              height={100}
            />
          ) : null}
        </Link>
      ))}
    </div>
  );
}
