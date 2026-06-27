"use client";
import type { Article } from "~/server/db/app-schema";
import MobileArticleDisplay from "./mobile-article-display";
import ShareButton from "./share-button";
import Link from "next/link";
import DeleteButton from "./delete-buton";
import Image from "next/image";
import { formattedDate } from "~/util/helpers";
import ReadMoreButton from "./read-more-button";

type ArticleDisplayProps = {
  article?: Article;
  editing?: boolean;
  isAdmin: boolean;
};

export default function ArticleDisplay({
  article,
  isAdmin,
  editing,
}: ArticleDisplayProps) {
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
      <>
        <MobileArticleDisplay
          className={"lg:hidden"}
          article={article}
          isAdmin={isAdmin}
          editing={editing}
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
              <div className="float-right mb-2 ml-8 w-[48%] max-w-xl overflow-hidden rounded-xl">
                <Image
                  className="h-auto w-full object-cover pt-2"
                  src={article.imageUrl}
                  alt={article.title}
                  width={800}
                  height={533}
                />
              </div>
            )}
            <div className="">
              <p className="text-lg leading-8 font-semibold wrap-break-word whitespace-pre-wrap">
                {article.content}
              </p>
              {/* TODO:Finish this */}
              <ReadMoreButton />
            </div>

            <div className="clear-both" />
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
          </article>
        </div>
      </>
    </section>
  );
}
