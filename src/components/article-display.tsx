"use client";
import type { Article } from "~/server/db/app-schema";
import MobileArticleDisplay from "./mobile-article-display";
import ShareButton from "./share-button";
import Link from "next/link";
import Image from "next/image";
import { formattedDate } from "~/utils/helpers";
import ReadMoreButton from "./read-more-button";
import MarkdownContent from "./markdown-content";

type ArticleDisplayProps = {
  article?: Article;
  isAdmin: boolean;
};

export default function ArticleDisplay({
  article,
  isAdmin,
}: ArticleDisplayProps) {
  //for creating a new article
  if (!article) return null;
  return (
    <section className="">
      <>
        <MobileArticleDisplay
          className={"lg:hidden"}
          article={article}
          isAdmin={isAdmin}
        />
        <div className="hidden w-full lg:block">
          <article>
            <header className="border-bloggin-border/40 mb-4 border-b pb-4">
              <h2 className="mb-2 max-w-xl text-4xl font-bold text-balance italic">
                {article.title}
              </h2>
              <p className="text-bloggin-muted/70! text-sm whitespace-nowrap">
                {formattedDate(article.createdAt)}
              </p>
            </header>

            {article.imageUrl && (
              // TODO:Make sure image here and on mobile are predefined after uploadthing!
              <div className="float-right mb-8 ml-8 aspect-3/2 w-[48%] max-w-xl overflow-hidden rounded-xl">
                <Image
                  className="h-auto w-full object-cover"
                  src={article.imageUrl}
                  alt={article.title}
                  width={800}
                  height={533}
                />
              </div>
            )}
            <div className="">
              <MarkdownContent content={article.content} />
              {/* TODO:Finish this */}
              <ReadMoreButton />
            </div>

            <div className="clear-both" />

            {/* TODO:deterimine if delete button should stay here */}
            {isAdmin ? (
              <div className="flex justify-center gap-4">
                <ShareButton slug={article.slug} />

                <Link href={`/edit/${article.slug}`}>edit</Link>
              </div>
            ) : (
              <div className="flex justify-center gap-4">
                <ShareButton slug={article.slug} />
              </div>
            )}
          </article>
        </div>
      </>
    </section>
  );
}
