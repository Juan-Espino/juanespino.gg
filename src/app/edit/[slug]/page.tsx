import { notFound, redirect } from "next/navigation";
import ArticleEditor from "~/components/article-editor";
import { getArticleBySlugForAdmin, updateArticle } from "~/server/articles";
import { getIsAdmin } from "~/server/better-auth/admin";

type EditArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};
export default async function EditArticlePage({
  params,
}: EditArticlePageProps) {
  const isAdmin = await getIsAdmin();

  if (!isAdmin) {
    redirect("/");
  }

  const { slug } = await params;
  const article = await getArticleBySlugForAdmin(slug);

  if (!article) {
    notFound();
  }

  return (
    <ArticleEditor
      mode="edit"
      action={updateArticle.bind(null, slug)}
      initialValues={article}
    />
  );
}
