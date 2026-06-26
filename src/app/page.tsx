import { getLatestPublishedArticles } from "~/server/articles";
import { getIsAdmin } from "~/server/better-auth/admin";

import NoContent from "../components/no-content";
import HomePage from "./_components/homepage";
export default async function Home() {
  const articles = await getLatestPublishedArticles(10);
  const isAdmin = await getIsAdmin();

  if (!articles.length)
    return (
      <main className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center">
          <NoContent />
        </div>
      </main>
    );

  return (
    <main className="flex w-full flex-col items-center justify-center">
      <HomePage articles={articles} isAdmin={isAdmin} />
    </main>
  );
}
