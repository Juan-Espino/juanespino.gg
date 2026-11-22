import { notFound } from "next/navigation";
import ArticleDisplay from "~/components/article-display";
import ArticleEditor from "~/components/article-editor";
import { fixtureHeaderImage, markdownFixtures } from "~/lib/markdown-fixtures";
import { type Article } from "~/server/db/app-schema";
import { devSaveArticle } from "./actions";

// Dev-only page: the real published article view or the real editor for
// the same sample article, so tests can compare the two layouts.
export default async function EditorTestPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const { view = "editor" } = await searchParams;

  const article: Article = {
    id: 1,
    authorId: "dev",
    title: "I'll Never Stop Defending This Sequel",
    slug: "dev-sample",
    imageUrl: fixtureHeaderImage,
    imageKey: "dev-image-key",
    content: markdownFixtures.wrap,
    // Published so auto-save stays off on this page.
    published: true,
    createdAt: new Date("2026-07-04T12:00:00Z"),
    updatedAt: null,
  };

  return view === "published" ? (
    <ArticleDisplay article={article} isAdmin={false} />
  ) : (
    <ArticleEditor mode="edit" action={devSaveArticle} initialValues={article} />
  );
}
