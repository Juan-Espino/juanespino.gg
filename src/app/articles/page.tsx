import { db } from "~/server/db";

export default async function Articles() {
  const articles = await db.query.articles.findFirst();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <h1 className="text-4xl">{articles?.title ?? ""}</h1>
      <p>{articles?.createdAt.toString()}</p>
      {articles?.imageUrl ? <img src={articles?.imageUrl ?? ""} /> : <></>}
      <p>{articles?.slug ?? ""}</p>
      <p>{articles?.content ?? ""}</p>
    </div>
  );
}
