import { redirect } from "next/navigation";
import ArticleEditor from "~/components/article-editor";
import { blogginRoutes } from "~/lib/routes";
import { createArticle } from "~/server/articles";
import { getIsAdmin } from "~/server/better-auth/admin";

export default async function NewArticlePage() {
  const isAdmin = await getIsAdmin();

  if (!isAdmin) {
    redirect(blogginRoutes.home);
  }
  return <ArticleEditor mode="create" action={createArticle} />;
}
