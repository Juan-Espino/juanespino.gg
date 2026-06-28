import { getLatestPublishedArticles } from "~/server/articles";
import { getIsAdmin } from "~/server/better-auth/admin";

import ArticleDisplay from "../components/article-display";
import LatestArticles from "../components/latest-articles";
import NoContent from "../components/no-content";

export default async function Home() {
  const articles = await getLatestPublishedArticles(10);
  const isAdmin = await getIsAdmin();
  const [article, ...latestArticles] = articles;

  if (!article)
    return (
      <main className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center">
          <NoContent />
        </div>
      </main>
    );

  return (
    <main className="flex w-full flex-col items-center justify-center">
      <div>
        <ArticleDisplay article={article} isAdmin={isAdmin} />
        <LatestArticles latestArticles={latestArticles} />
      </div>
    </main>
  );
}
