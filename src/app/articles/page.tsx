import { notFound } from "next/navigation";
import {
  getLatestPublishedArticles,
  getPublishedArticleBySlug,
} from "~/server/articles";
export const dynamic = "force-dynamic";
export default async function Articles() {
  const article = await getPublishedArticleBySlug("my-pookie-grimes");
  return (
    <div>
      {!article ? (
        notFound()
      ) : (
        <div
          key={article?.id}
          className="flex min-h-screen flex-col items-center justify-center gap-4 bg-linear-to-b from-[#2e026d] to-[#15162c] text-white"
        >
          <h1 className="text-4xl">{article?.title ?? ""}</h1>
          <p>{article?.createdAt.toString()}</p>
          {article?.imageUrl ? <img src={article?.imageUrl ?? ""} /> : <></>}
          <p>{article?.slug ?? ""}</p>
          <p>{article?.content ?? ""}</p>
        </div>
      )}
    </div>
  );
}
