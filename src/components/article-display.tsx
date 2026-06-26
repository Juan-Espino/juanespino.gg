"use client";
import { useEffect, useState } from "react";
import type { articles } from "~/server/db/app-schema";
import { formattedDate } from "~/util/helpers";
import ShareButton from "./share-button";
import Link from "next/link";
import DeleteButton from "./delete-buton";
import Image from "next/image";

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
    function handleScroll() {
      setScroll(window.scrollY > 50);
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
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
      <div className="sticky -top-1 overflow-hidden">
        {article.imageUrl ? (
          <Image
            className="h-auto w-full object-contain"
            src={article.imageUrl}
            alt={article.title}
            width={1200}
            height={800}
          />
        ) : null}

        <div
          className={`overlay-transition pointer-events-none absolute -inset-1 transform-gpu bg-black/70 backdrop-blur-[2px] will-change-[opacity,backdrop-filter] ${
            scroll ? "opacity-0" : "opacity-100"
          }`}
        />

        <div
          className={`overlay-transition absolute -inset-px z-10 flex flex-col items-center justify-center gap-4 ${
            scroll ? "opacity-0" : "opacity-100"
          }`}
        >
          <h2 className="max-w-[18rem] text-3xl leading-tight font-bold text-balance italic sm:text-4xl">
            {article.title}
          </h2>
          <span className="before:bg-bloggin-accent relative before:absolute before:-inset-1 before:-skew-y-3">
            <p className="text-bloggin-background! relative text-sm whitespace-nowrap sm:text-base">
              {formattedDate(article.createdAt)}
            </p>
          </span>
        </div>
      </div>
      <div className="w-full min-w-0 p-4 text-center">
        <p className="text-base leading-7 wrap-break-word whitespace-pre-wrap">
          {article.content}
        </p>

        {isAdmin ? (
          <div className="flex justify-center gap-4">
            <ShareButton slug={article.slug} />

            <Link href={`/edit/${article.slug}`}>edit</Link>

            <DeleteButton slug={article.slug} />
          </div>
        ) : (
          <div className="flex justify-center gap-4">
            <ShareButton slug={article.slug} />
          </div>
        )}
      </div>
    </section>
  );
}
