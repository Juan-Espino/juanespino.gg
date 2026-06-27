"use client";

import ArticleDisplay from "~/components/article-display";
import LatestArticles from "~/components/lastest-articles";
import type { Article } from "~/server/db/app-schema";
import { useState } from "react";

type HomePageProps = {
  articles: Article[];
  isAdmin: boolean;
};

export default function HomePage({ articles, isAdmin }: HomePageProps) {
  const [mainArticle, setMainArticle] = useState(() => articles[0]);
  const lastestArticles = articles.filter((article) => article !== mainArticle);
  return (
    <div>
      <ArticleDisplay article={mainArticle} isAdmin={isAdmin} />
      <LatestArticles
        latestArticles={lastestArticles}
        setMainArticle={setMainArticle}
      />
    </div>
  );
}
