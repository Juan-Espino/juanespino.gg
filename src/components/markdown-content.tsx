"use client";

import Image from "next/image";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLayoutEffect, useRef } from "react";
import { revealLines } from "~/lib/line-reveal";
import {
  imageClearClass,
  imageSide,
  type ImageSide,
  isOptimizableImageSrc,
  markdownStyles as md,
} from "~/lib/markdown-styles";

type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

/**
 * Rehype plugin: tags each image with its side. Pass `fixed` to give every
 * image the same side (the editor renders one image at a time).
 */
export function rehypeImageSides(fixed?: ImageSide) {
  return () => (tree: HastNode) => {
    let index = 0;
    const walk = (node: HastNode, parent?: HastNode) => {
      if (node.type === "element" && node.tagName === "img") {
        node.properties = {
          ...node.properties,
          dataSide: fixed ?? imageSide(index),
        };
        // The paragraph holding it clears the previous image.
        if (!fixed && parent && parent.properties?.dataClear === undefined) {
          parent.properties = {
            ...parent.properties,
            dataClear: imageClearClass(index),
          };
        }
        index++;
      }
      node.children?.forEach((child) => walk(child, node));
    };
    walk(tree);
  };
}

function imageClass(node: unknown) {
  const side = (node as HastNode | undefined)?.properties?.dataSide;
  return `${md.img.base} ${side === "right" ? md.img.right : md.img.left}`;
}

// Stable component identities preserve mounted blocks during article expansion.
// Shared with the live-preview editor so its rendered blocks match exactly.
export const markdownComponents: Components = {
  p: ({ children, node }) => (
    <p
      className={`${md.p.text} ${md.p.margin} ${
        ((node as HastNode | undefined)?.properties?.dataClear as string) ?? ""
      }`}
    >
      {children}
    </p>
  ),

  h1: ({ children }) => (
    <h1 className={`${md.h1.text} ${md.h1.margin}`}>
      {children}
    </h1>
  ),

  h2: ({ children }) => (
    <h2 className={`${md.h2.text} ${md.h2.margin}`}>
      {children}
    </h2>
  ),

  h3: ({ children }) => (
    <h3 className={`${md.h3.text} ${md.h3.margin}`}>
      {children}
    </h3>
  ),

  strong: ({ children }) => (
    <strong className={md.strong}>{children}</strong>
  ),

  a: ({ children, href }) => (
    <a
      href={href}
      className={md.a}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  ),
  li: ({ children }) => (
    <li className={`${md.li.text} ${md.li.margin}`}>{children}</li>
  ),

  img: ({ src, alt, node }) => {
    if (typeof src !== "string") return null;
    return isOptimizableImageSrc(src) ? (
      <Image
        src={src}
        alt={alt ?? ""}
        width={800}
        height={533}
        sizes="(max-width: 767px) 100vw, 340px"
        className={imageClass(node)}
      />
    ) : (
      // External Markdown hosts keep their original URL without expanding the optimizer allowlist.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? ""}
        loading="lazy"
        decoding="async"
        className={imageClass(node)}
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
        rehypePlugins={[rehypeImageSides()]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
