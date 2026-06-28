import { redirect } from "next/navigation";
import ArticleEditor from "~/components/article-editor";
import { createArticle } from "~/server/articles";
import { getIsAdmin } from "~/server/better-auth/admin";

export default async function NewArticlePage() {
  const isAdmin = await getIsAdmin();

  if (!isAdmin) {
    redirect("/");
  }
  return <ArticleEditor mode="create" action={createArticle} />;
}
