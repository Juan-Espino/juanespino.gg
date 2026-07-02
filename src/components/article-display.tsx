"use client";
import type { Article } from "~/server/db/app-schema";
import MobileArticleDisplay from "./mobile-article-display";
import ShareButton from "./share-button";
import Image from "next/image";
import { formattedDate } from "~/utils/helpers";
import ReadMoreButton from "./read-more-button";
import MarkdownContent from "./markdown-content";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type Transition } from "motion/react";
import { Button } from "./ui/button";
import EditButton from "./edit-button";

type ArticleDisplayProps = {
  article?: Article;
  isAdmin: boolean;
};

export default function ArticleDisplay({
  article,
  isAdmin,
}: ArticleDisplayProps) {
  const articleSlug = article?.slug ?? null;
  const [expandedArticleSlug, setExpandedArticleSlug] = useState<string | null>(
    null,
  );
  const [animatedArticleSlug, setAnimatedArticleSlug] = useState<string | null>(
    null,
  );
  const collapsedHeight = 360;
  const contentRef = useRef<HTMLDivElement>(null);
  const [canExpand, setCanExpand] = useState(false);
  const [hasMeasuredContent, setHasMeasuredContent] = useState(false);
  const isExpanded =
    articleSlug !== null && expandedArticleSlug === articleSlug;
  const hasMarkdownAnimated =
    articleSlug !== null && animatedArticleSlug === articleSlug;

  useEffect(() => {
    if (!articleSlug || hasMarkdownAnimated) return;

    const timeoutId = window.setTimeout(() => {
      setAnimatedArticleSlug(articleSlug);
    }, 1400);

    return () => window.clearTimeout(timeoutId);
  }, [articleSlug, hasMarkdownAnimated]);
  useEffect(() => {
    const contentElement = contentRef.current;

    if (!contentElement) return;

    const measuredContentElement = contentElement;

    function updateCanExpand() {
      setCanExpand(measuredContentElement.scrollHeight > collapsedHeight);
      setHasMeasuredContent(true);
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
                height:
                  isExpanded || (hasMeasuredContent && !canExpand)
                    ? "auto"
                    : collapsedHeight,
              }}
              transition={{
                duration: 0.8,
                ease: "easeInOut",
              }}
              className="relative overflow-hidden"
            >
              <div ref={contentRef}>
                <MarkdownContent
                  key={article.slug}
                  content={article.content}
                  animated={!hasMarkdownAnimated}
                />
              </div>
              <AnimatePresence>
                {canExpand && !isExpanded ? (
                  <motion.div
                    key="article-fade"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="from-bloggin-background pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t to-transparent"
                  />
                ) : null}
              </AnimatePresence>
            </motion.div>
            {isAdmin ? (
              <div className="mt-4 flex items-center gap-4 px-2">
                {canExpand ? (
                  <ReadMoreButton
                    expanded={isExpanded}
                    onClick={() =>
                      setExpandedArticleSlug((currentSlug) =>
                        currentSlug === article.slug ? null : article.slug,
                      )
                    }
                  />
                ) : null}

                <ShareButton slug={article.slug} />

                <EditButton slug={article.slug} />
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-4 px-2">
                {canExpand ? (
                  <ReadMoreButton
                    expanded={isExpanded}
                    onClick={() =>
                      setExpandedArticleSlug((currentSlug) =>
                        currentSlug === article.slug ? null : article.slug,
                      )
                    }
                  />
                ) : null}

                <ShareButton slug={article.slug} />
              </div>
            )}

            <div className="clear-both" />
          </article>
        </div>
      </>
    </section>
  );
}
