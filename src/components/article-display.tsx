"use client";
import type { Article } from "~/server/db/app-schema";
import MobileArticleDisplay from "./mobile-article-display";
import ShareButton from "./share-button";
import Image from "next/image";
import { formattedDate } from "~/utils/helpers";
import ReadMoreButton from "./read-more-button";
import { markdownStyles } from "~/lib/markdown-styles";
import MarkdownContent from "./markdown-content";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import EditButton from "./edit-button";
import Reveal from "./motion/reveal";
import GlitchText from "~/components/motion/glitch-text";

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
  const collapsedHeight = 360;
  const contentRef = useRef<HTMLDivElement>(null);
  const [canExpand, setCanExpand] = useState(false);
  const [hasMeasuredContent, setHasMeasuredContent] = useState(false);
  const isExpanded =
    articleSlug !== null && expandedArticleSlug === articleSlug;
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
          className={"md:hidden"}
          article={article}
          isAdmin={isAdmin}
        />
        <div className="hidden w-full md:block">
          <article className="w-full">
            <header className="border-bloggin-border/40 mb-4 border-b pb-4">
              <Reveal
                as="h2"
                className="mb-2 py-2 text-4xl font-bold text-pretty"
              >
                <GlitchText text={article.title} trigger="entrance" />
              </Reveal>
              <Reveal
                as="p"
                index={1}
                className="text-bloggin-muted/70! text-sm whitespace-nowrap"
              >
                {formattedDate(article.createdAt)}
              </Reveal>
            </header>

            <Reveal index={2}>
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
                  {article.imageUrl && (
                    <div className={markdownStyles.headerImage}>
                      <Image
                        className="h-full w-full object-cover"
                        src={article.imageUrl}
                        alt={article.title}
                        width={800}
                        height={533}
                        priority
                        sizes="(max-width: 767px) 100vw, 492px"
                      />
                    </div>
                  )}
                  <MarkdownContent
                    key={article.slug}
                    content={article.content}
                    revealHeight={isExpanded ? undefined : collapsedHeight}
                    collapseHeight={collapsedHeight}
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
                      slug={article.slug}
                      expanded={isExpanded}
                      onClick={() => {
                        setExpandedArticleSlug((currentSlug) =>
                          currentSlug === article.slug ? null : article.slug,
                        );
                      }}
                    />
                  ) : null}

                  <ShareButton slug={article.slug} />

                  <EditButton slug={article.slug} />
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-4 px-2">
                  {canExpand ? (
                    <ReadMoreButton
                      slug={article.slug}
                      expanded={isExpanded}
                      onClick={() => {
                        setExpandedArticleSlug((currentSlug) =>
                          currentSlug === article.slug ? null : article.slug,
                        );
                      }}
                    />
                  ) : null}

                  <ShareButton slug={article.slug} />
                </div>
              )}
            </Reveal>

            <div className="clear-both" />
          </article>
        </div>
      </>
    </section>
  );
}
