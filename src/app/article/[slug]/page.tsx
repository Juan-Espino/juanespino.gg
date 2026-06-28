import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import ArticleDisplay from "~/components/article-display";
import LatestArticles from "~/components/latest-articles";
import {
  getArticleBySlugForAdmin,
  getLatestPublishedArticlesExcludingSlug,
  getPublishedArticleBySlug,
} from "~/server/articles";
import { getIsAdmin } from "~/server/better-auth/admin";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const getArticle = cache(async (slug: string) => {
  return getPublishedArticleBySlug(slug);
});

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: "Article not found",
    };
  }

  const description = article.content.slice(0, 160);

  return {
    title: article.title,
    description,
    openGraph: {
      title: article.title,
      description,
      type: "article",
      images: article.imageUrl ? [article.imageUrl] : [],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const isAdmin = await getIsAdmin();

  const [article, latestArticles] = await Promise.all([
    isAdmin ? getArticleBySlugForAdmin(slug) : getArticle(slug),
    getLatestPublishedArticlesExcludingSlug(slug, 9),
  ]);

  if (!article) {
    notFound();
  }

  return (
    <main className="flex w-full flex-col items-center justify-center">
      <div>
        <ArticleDisplay article={article} isAdmin={isAdmin} />
        <LatestArticles latestArticles={latestArticles} />
      </div>
    </main>
  );
}
