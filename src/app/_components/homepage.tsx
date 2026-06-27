import ArticleDisplay from "~/components/article-display";
import LatestArticles from "~/components/lastest-articles";
import type { articles } from "~/server/db/app-schema";

type HomePageProps = {
  articles: (typeof articles.$inferSelect)[];
  isAdmin: boolean;
};

export default function HomePage({ articles, isAdmin }: HomePageProps) {
  //TODO:remove this
  const article = articles[0];
  return (
    <div>
      <ArticleDisplay article={article} isAdmin={isAdmin} />
      <LatestArticles />
    </div>
  );
}
