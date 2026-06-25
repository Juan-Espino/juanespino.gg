import { getLatestPublishedArticles } from "~/server/articles";
import NoContent from "./_components/no-content";
export default async function Home() {
  const articles = await getLatestPublishedArticles(10);
  return (
    <main className="flex flex-1 flex-col">
      {!articles.length ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <NoContent />
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center">
          <h2>dkjfaskj</h2>
        </div>
      )}
    </main>
  );
}
