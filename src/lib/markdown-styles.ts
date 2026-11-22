/**
 * One source of truth for how article Markdown looks. The published
 * renderer (MarkdownContent) and the live-preview editor both read these,
 * so the two can't drift apart.
 *
 * `text` is typography; `margin`/`padding` are the gap below the block. The
 * published page uses margin, the editor padding (CodeMirror measures line
 * boxes and ignores margins; `!` beats its base line padding), so the
 * visual gap is identical.
 */
export const markdownStyles = {
  p: {
    text: "text-bloggin-muted text-lg leading-8 font-semibold",
    margin: "mb-5",
    padding: "pb-5!",
  },
  h1: {
    text: "text-bloggin-foreground/85! text-4xl font-bold",
    margin: "mb-4",
    padding: "pb-4!",
  },
  h2: {
    text: "text-bloggin-foreground/85! text-2xl font-bold",
    margin: "mb-3",
    padding: "pb-3!",
  },
  h3: {
    text: "text-bloggin-foreground/85! text-xl font-bold",
    margin: "mb-3",
    padding: "pb-3!",
  },
  li: {
    text: "text-bloggin-muted text-lg underline",
    margin: "mb-5",
    padding: "pb-5!",
  },
  strong: "text-bloggin-accent font-bold",
  // White text with a mint underline: stands apart from the mint bold text
  // without adding a new color.
  a: "text-bloggin-foreground underline decoration-bloggin-accent decoration-2 underline-offset-4",
  // Mobile: full width on its own line, like the hero image. Desktop: a
  // third of the width, floated so the paragraph wraps around it; images
  // alternate left, right, left… down the article (see imageSide).
  img: {
    base: "mb-4 aspect-3/2 h-auto w-full rounded-xl object-cover md:w-auto md:max-w-1/3",
    left: "md:float-left md:mr-4",
    right: "md:float-right md:ml-4",
  },
  /**
   * A paragraph holding an image starts below the previous embedded image
   * (which sits on the other side), so short paragraphs never squeeze text
   * between two floats.
   */
  clearAfter: {
    left: "md:clear-left",
    right: "md:clear-right",
  },
  /** The article's header image, floated so the text wraps around it. */
  headerImage:
    "float-right mb-4 ml-4 aspect-3/2 w-[48%] max-w-xl overflow-hidden rounded-xl",
} as const;

export type ImageSide = "left" | "right";

/** Embedded images alternate sides in document order, starting left. */
export function imageSide(index: number): ImageSide {
  return index % 2 === 0 ? "left" : "right";
}

/** Class for the block holding image `index`: clears the previous image. */
export function imageClearClass(index: number) {
  if (index === 0) return ""; // first image may sit beside the header image
  return markdownStyles.clearAfter[imageSide(index - 1)];
}

/** Images on these hosts go through next/image; others use a plain <img>. */
export function isOptimizableImageSrc(src: string) {
  return (
    (src.startsWith("/") && !src.startsWith("//")) ||
    /^https:\/\/[^/]+\.ufs\.sh\//.test(src)
  );
}
