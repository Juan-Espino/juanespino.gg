import Image from "next/image";
import type { Dispatch, SetStateAction } from "react";
import type { Article } from "~/server/db/app-schema";

type LatestArticlesProps = {
  latestArticles: Article[];
  setMainArticle: (article: Article) => void;
};
export default function LatestArticles({
  latestArticles,
  setMainArticle,
}: LatestArticlesProps) {
  if (!latestArticles.length) return null;

  return (
    // TODO:add button for onclick, shadecn this bitch
    <div className="flex gap-4">
      {latestArticles.map((article) => (
        <div
          key={article.slug}
          className="flex cursor-pointer flex-col border"
          onClick={() => setMainArticle(article)}
        >
          <h2 className="p-4">{article.title}</h2>
          <Image
            src={article.imageUrl ?? ""}
            alt={article.title}
            width={100}
            height={100}
          />
        </div>
      ))}
    </div>
  );
}
