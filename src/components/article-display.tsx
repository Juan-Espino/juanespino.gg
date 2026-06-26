"use client";
import { useEffect, useState } from "react";
import type { articles } from "~/server/db/app-schema";
import { formattedDate } from "~/util/helpers";

type ArticleDisplayProps = {
  article?: typeof articles.$inferSelect;
  editing?: boolean;
  isAdmin: boolean;
};

export default function ArticleDisplay({
  article,
  isAdmin,
  editing,
}: ArticleDisplayProps) {
  const [scroll, setScroll] = useState(false);
  useEffect(() => {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        setScroll(true);
      } else {
        setScroll(false);
      }
    });
  }, []);

  //for creating a new article
  if (!article)
    return (
      <section>
        <div>
          <h1>{editing}</h1>
          <img alt="" />
        </div>
        <div>
          <p></p>
        </div>
      </section>
    );

  return (
    <section className="">
      <div
        className={`overlay-transition sticky -top-1 overflow-hidden border-none outline-none after:absolute after:-inset-1 after:block after:content-[''] ${
          scroll
            ? ""
            : "after:bg-bloggin-background/70 after:backdrop-blur-[2px]"
        }`}
      >
        <div>
          {article.imageUrl ? (
            <img
              className="block w-full"
              src={article.imageUrl}
              alt={article.title}
            />
          ) : (
            <></>
          )}
        </div>
        <div
          className={`overlay-transition absolute -inset-px z-10 flex flex-col items-center justify-center gap-4 ${
            scroll ? "opacity-0" : ""
          }`}
        >
          <h2 className="text-4xl">{article.title}</h2>
          <span className="before:bg-bloggin-accent relative before:absolute before:-inset-1 before:-skew-y-3">
            <p className="relative">{formattedDate(article.createdAt)}</p>
          </span>
        </div>
      </div>
      <div>
        <p className="break-all">{article.content}</p>

        {isAdmin && (
          <form className="flex gap-4">
            <button>{"share"}</button>
            <button>{"edit"}</button>
            <button className="text-red-500">{"delete"}</button>
          </form>
        )}
      </div>
    </section>
  );
}
