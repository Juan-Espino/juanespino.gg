"use client";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "./ui/button";

// Every label the button can show; the widest sets its width so it never
// resizes mid-animation.
const LABELS = ["save draft", "publish", "update", "unpublish"] as const;
export type SubmitLabel = (typeof LABELS)[number];

// Same feel as the auto-save status: fade with a small vertical move,
// plus a slight turnstile flip.
const turn = {
  initial: { opacity: 0, y: 6, rotateX: -70 },
  animate: { opacity: 1, y: 0, rotateX: 0 },
  exit: { opacity: 0, y: -6, rotateX: 70 },
  transition: { duration: 0.18, ease: "easeOut" },
} as const;

type SubmitButtonProps = {
  /** What clicking does. */
  label: SubmitLabel;
};

export default function SubmitButton({ label }: SubmitButtonProps) {
  return (
    <Button type="submit" aria-label={label} className="overflow-hidden">
      <span className="grid perspective-[400px]">
        {LABELS.map((l) => (
          <span
            key={l}
            aria-hidden
            className="invisible col-start-1 row-start-1"
          >
            {l}
          </span>
        ))}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={label}
            aria-hidden
            className="col-start-1 row-start-1 text-center"
            {...turn}
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </span>
    </Button>
  );
}
