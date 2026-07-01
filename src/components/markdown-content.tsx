"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, useReducedMotion, type Variants } from "motion/react";

const markdownContainerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const markdownBlockVariants: Variants = {
  hidden: {
    opacity: 0,
    clipPath: "inset(0 100% 0 0)",
  },
  show: {
    opacity: 1,
    clipPath: "inset(0 0% 0 0)",
    transition: {
      duration: 0.9,
      type: "decay",
    },
  },
};

type MarkdownContentProps = {
  content: string;
  className?: string;
  animated?: boolean;
  onAnimationComplete?: () => void;
};
export default function MarkdownContent({
  content,
  className,
  animated,
  onAnimationComplete,
}: MarkdownContentProps) {
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = animated && !shouldReduceMotion;

  return (
    <motion.div
      className={className ?? "px-4"}
      variants={markdownContainerVariants}
      initial={shouldAnimate ? "hidden" : false}
      animate={shouldAnimate ? "show" : false}
      onAnimationComplete={onAnimationComplete}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <motion.p
              variants={markdownBlockVariants}
              className="text-bloggin-muted mb-5 text-lg leading-8 font-semibold"
            >
              {children}
            </motion.p>
          ),

          h1: ({ children }) => (
            <motion.h1
              variants={markdownBlockVariants}
              className="text-bloggin-foreground/85! mb-4 text-4xl font-bold"
            >
              {children}
            </motion.h1>
          ),

          h2: ({ children }) => (
            <motion.h2
              variants={markdownBlockVariants}
              className="text-bloggin-foreground/85! mb-3 text-2xl font-bold"
            >
              {children}
            </motion.h2>
          ),

          h3: ({ children }) => (
            <motion.h3
              variants={markdownBlockVariants}
              className="text-bloggin-foreground/85! mb-3 text-xl font-bold"
            >
              {children}
            </motion.h3>
          ),

          strong: ({ children }) => (
            <strong className="text-bloggin-accent font-bold">
              {children}
            </strong>
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
            <motion.li
              variants={markdownBlockVariants}
              className="text-bloggin-muted mb-3 font-bold underline"
            >
              {children}
            </motion.li>
          ),

          img: ({ src }) => (
            <motion.img
              variants={markdownBlockVariants}
              src={src}
              className="aspect-3/2 h-auto max-w-1/3 rounded-xl object-cover"
              alt="md-image"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </motion.div>
  );
}
