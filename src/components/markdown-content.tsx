"use client";

import Image from "next/image";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLayoutEffect, useRef } from "react";
import { revealLines } from "~/lib/line-reveal";

// Stable component identities preserve mounted blocks during article expansion.
const markdownComponents: Components = {
  p: ({ children }) => (
    <p className="text-bloggin-muted mb-5 text-lg leading-8 font-semibold">
      {children}
    </p>
  ),

  h1: ({ children }) => (
    <h1 className="text-bloggin-foreground/85! mb-4 text-4xl font-bold">
      {children}
    </h1>
  ),

  h2: ({ children }) => (
    <h2 className="text-bloggin-foreground/85! mb-3 text-2xl font-bold">
      {children}
    </h2>
  ),

  h3: ({ children }) => (
    <h3 className="text-bloggin-foreground/85! mb-3 text-xl font-bold">
      {children}
    </h3>
  ),

  strong: ({ children }) => (
    <strong className="text-bloggin-accent font-bold">{children}</strong>
  ),

  a: ({ children, href }) => (
    <a
      href={href}
      className="text-bloggin-neon underline underline-offset-4"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  ),
  li: ({ children }) => (
    <li className="text-bloggin-muted mb-5 text-lg underline">{children}</li>
  ),

  img: ({ src, alt }) => {
    if (typeof src !== "string") return null;
    const supported =
      (src.startsWith("/") && !src.startsWith("//")) ||
      /^https:\/\/[^/]+\.ufs\.sh\//.test(src);
    return supported ? (
      <Image
        src={src}
        alt={alt ?? ""}
        width={800}
        height={533}
        sizes="(max-width: 1023px) 33vw, 340px"
        className="aspect-3/2 h-auto max-w-1/3 rounded-xl object-cover"
      />
    ) : (
      // External Markdown hosts keep their original URL without expanding the optimizer allowlist.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? ""}
        loading="lazy"
        decoding="async"
        className="aspect-3/2 h-auto max-w-1/3 rounded-xl object-cover"
      />
    );
  },
};

type MarkdownContentProps = {
  content: string;
  className?: string;
  animated?: boolean;
  revealHeight?: number;
  collapseHeight?: number;
  onAnimationComplete?: () => void;
};
export default function MarkdownContent({
  content,
  className,
  animated,
  revealHeight,
  collapseHeight,
  onAnimationComplete,
}: MarkdownContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!animated || !containerRef.current) return;
    return revealLines(containerRef.current, onAnimationComplete);
  }, [animated, content, onAnimationComplete]);

  return (
    <div
      ref={containerRef}
      className={className}
      data-reveal-height={revealHeight}
      data-collapse-height={collapseHeight}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
