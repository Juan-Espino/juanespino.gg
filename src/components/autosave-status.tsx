"use client";
import { Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type AutosaveStatus } from "~/hooks/use-autosave";
import { cn } from "~/lib/utils";
import { Spinner } from "./ui/spinner";

const fade = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.18, ease: "easeOut" },
} as const;

function TypingDots() {
  return (
    <span className="flex items-center gap-0.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1 rounded-full bg-current"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}

// Icon-only while things go well; text only when something is wrong.
const display: Record<
  Exclude<AutosaveStatus, "off" | "idle">,
  { label?: string; icon?: "dots" | "spinner" | "check"; srLabel: string }
> = {
  typing: { icon: "dots", srLabel: "unsaved changes" },
  saving: { icon: "spinner", srLabel: "saving" },
  saved: { icon: "check", srLabel: "saved" },
  error: { label: "save failed – retrying", srLabel: "save failed" },
  "signed-out": { label: "sign in again", srLabel: "signed out" },
};

export default function AutosaveStatusLabel({
  status,
}: {
  status: AutosaveStatus;
}) {
  if (status === "off") return null;

  const current = status === "idle" ? null : display[status];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex h-5 min-w-4 items-center text-sm",
        current?.label ? "text-red-500!" : "text-bloggin-muted",
      )}
    >
      {/* One slot: dots -> spinner -> check -> blank, each fading into the next. */}
      <AnimatePresence mode="wait" initial={false}>
        {current ? (
          <motion.span key={status} className="flex items-center" {...fade}>
            <span className="sr-only">{current.srLabel}</span>
            {current.label}
            {current.icon === "dots" && <TypingDots />}
            {current.icon === "spinner" && (
              <Spinner className="size-3.5" aria-hidden />
            )}
            {current.icon === "check" && (
              <Check className="size-3.5" aria-hidden />
            )}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
