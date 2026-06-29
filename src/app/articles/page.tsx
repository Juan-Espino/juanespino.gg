import ListArticles from "~/components/list-articles";
import NoContent from "~/components/no-content";
import { getPublishedArticleLinks } from "~/server/articles";

export default async function Articles() {
  const articles = await getPublishedArticleLinks();

  if (!articles.length) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center">
        <NoContent />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-10 sm:px-6 sm:py-14">
      <ListArticles articles={articles} />
    </main>
  );
}
