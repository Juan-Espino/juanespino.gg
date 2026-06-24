import { db } from "~/server/db";

export default async function Articles() {
  const articles = await db.query.articles.findMany();
  return (
    <>
      {articles.map((article, key) => (
        <div
          key={key}
          className="flex min-h-screen flex-col items-center justify-center gap-2 bg-linear-to-b from-[#2e026d] to-[#15162c] text-white"
        >
          <h1 className="text-4xl">{article?.title ?? ""}</h1>
          <p>{article?.createdAt.toString()}</p>
          {article?.imageUrl ? <img src={article?.imageUrl ?? ""} /> : <></>}
          <p>{article?.slug ?? ""}</p>
          <p>{article?.content ?? ""}</p>
        </div>
      ))}
    </>
  );
}
