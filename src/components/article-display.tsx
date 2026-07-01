"use client";
import type { Article } from "~/server/db/app-schema";
import MobileArticleDisplay from "./mobile-article-display";
import ShareButton from "./share-button";
import Link from "next/link";
import Image from "next/image";
import { formattedDate } from "~/utils/helpers";
import ReadMoreButton from "./read-more-button";
import MarkdownContent from "./markdown-content";
import { useEffect, useRef, useState } from "react";
import { motion, type Transition } from "motion/react";

const articleLayoutTransition: Transition = {
  layout: {
    duration: 0.7,
    ease: "easeInOut",
  },
};

type ArticleDisplayProps = {
  article?: Article;
  isAdmin: boolean;
};

export default function ArticleDisplay({
  article,
  isAdmin,
}: ArticleDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const collapsedHeight = 360;
  const contentRef = useRef<HTMLDivElement>(null);
  const [canExpand, setCanExpand] = useState(false);

  useEffect(() => {
    const contentElement = contentRef.current;

    if (!contentElement) return;

    function updateCanExpand() {
      setCanExpand(contentElement!.scrollHeight > collapsedHeight);
    }

    updateCanExpand();

    const resizeObserver = new ResizeObserver(updateCanExpand);
    resizeObserver.observe(contentElement);

    return () => resizeObserver.disconnect();
  }, [article?.content]);

  if (!article) return null;
  return (
    <section className="w-full">
      <>
        <MobileArticleDisplay
          className={"lg:hidden"}
          article={article}
          isAdmin={isAdmin}
        />
        <div className="hidden w-full lg:block">
          <article className="w-full">
            <header className="border-bloggin-border/40 mb-4 border-b pb-4">
              <h2 className="mb-2 max-w-xl text-4xl font-bold text-balance italic">
                {article.title}
              </h2>
              <p className="text-bloggin-muted/70! text-sm whitespace-nowrap">
                {formattedDate(article.createdAt)}
              </p>
            </header>

            {article.imageUrl && (
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
            <motion.div
              initial={false}
              animate={{
                height: isExpanded || !canExpand ? "auto" : collapsedHeight,
              }}
              transition={{
                duration: 0.7,
                ease: "easeInOut",
              }}
              className="relative overflow-hidden"
            >
              <div ref={contentRef}>
                <MarkdownContent content={article.content} animated />
              </div>
              {canExpand && !isExpanded ? (
                <div className="from-bloggin-background pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t to-transparent" />
              ) : null}
            </motion.div>
            {isAdmin ? (
              <motion.div
                layout
                transition={articleLayoutTransition}
                className="mt-4 flex items-center gap-4 px-2"
              >
                {canExpand ? (
                  <ReadMoreButton
                    expanded={isExpanded}
                    onClick={() => setIsExpanded((value) => !value)}
                  />
                ) : null}
                {/* TODO:Finish this */}

                <ShareButton slug={article.slug} />

                <Link href={`/edit/${article.slug}`}>edit</Link>
              </motion.div>
            ) : (
              <motion.div
                layout
                transition={articleLayoutTransition}
                className="mt-4 flex items-center gap-4 px-2"
              >
                {canExpand ? (
                  <ReadMoreButton
                    expanded={isExpanded}
                    onClick={() => setIsExpanded((value) => !value)}
                  />
                ) : null}

                <ShareButton slug={article.slug} />
              </motion.div>
            )}

            <div className="clear-both" />
          </article>
        </div>
      </>
    </section>
  );
}
