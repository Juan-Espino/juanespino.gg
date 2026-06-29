"use client";
import type { Article } from "~/server/db/app-schema";
import { formattedDate } from "~/util/helpers";
import ShareButton from "./share-button";
import Link from "next/link";
import DeleteButton from "./delete-buton";
import Image from "next/image";
import { useState, useEffect } from "react";
import MarkdownContent from "./markdown-content";

type MobileArticleDisplayProps = {
  className: string;
  article: Article;
  isAdmin: boolean;
};
export default function MobileArticleDisplay({
  article,
  isAdmin,
  className,
}: MobileArticleDisplayProps) {
  const [scroll, setScroll] = useState(false);
  useEffect(() => {
    function handleScroll() {
      setScroll(window.scrollY > 50);
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div className={`${className ?? ""}`}>
      <div className="sticky -top-1 aspect-3/2 overflow-hidden">
        {article.imageUrl ? (
          <Image
            className="h-full w-full object-cover"
            src={article.imageUrl}
            alt={article.title}
            width={800}
            height={533}
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
            <span className="text-bloggin-background! relative text-sm whitespace-nowrap sm:text-base">
              {formattedDate(article.createdAt)}
            </span>
          </span>
        </div>
      </div>
      <div className="w-full min-w-0 p-4 text-center">
        <MarkdownContent content={article.content} />

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
    </div>
  );
}
