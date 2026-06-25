import { notFound } from "next/navigation";
import {
  deleteArticle,
  getLatestPublishedArticles,
  getPublishedArticleBySlug,
} from "~/server/articles";
export const dynamic = "force-dynamic";
export default async function Articles() {
  const articles = await getLatestPublishedArticles();
  return (
    <div>
      {articles.length > 0 ? (
        articles.map((article) => (
          <div
            key={article?.id}
            className="flex min-h-screen flex-col items-center justify-center gap-4 bg-linear-to-b from-[#2e026d] to-[#15162c] text-white"
          >
            <h1 className="text-4xl">{article?.title ?? ""}</h1>
            <p>{article?.createdAt.toString()}</p>
            {article?.imageUrl ? <img src={article?.imageUrl ?? ""} /> : <></>}
            <p>{article?.slug ?? ""}</p>
            <p>{article?.content ?? ""}</p>
            <form
              action={async () => {
                "use server";
                await deleteArticle(article.slug);
              }}
            >
              <button type="submit">DELETE</button>
            </form>
          </div>
        ))
      ) : (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-linear-to-b from-[#2e026d] to-[#15162c] text-white">
          ?
        </div>
      )}
    </div>
  );
}
