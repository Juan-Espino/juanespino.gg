import ListArticles from "~/components/list-articles";
import NoContent from "~/components/no-content";
import { getDraftArticleLinksForAdmin } from "~/server/articles";
import { getIsAdmin } from "~/server/better-auth/admin";
import { notFound } from "next/navigation";

export default async function Drafts() {
  const isAdmin = await getIsAdmin();

  if (!isAdmin) {
    notFound();
  }

  const drafts = await getDraftArticleLinksForAdmin();

  if (!drafts.length) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center">
        <NoContent />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-10 sm:px-6 sm:py-14">
      <ListArticles articles={drafts} draft={true} />
    </main>
  );
}
