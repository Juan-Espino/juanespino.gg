"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { env } from "~/env";
import { toast } from "sonner";

type EmailButtonProps = {
  className: string;
};

export default function EmailButton({ className }: EmailButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timeoutId = window.setTimeout(() => {
      setCopied(false);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  return (
    <Button
      variant="ghost"
      className={`${className ?? ""} cursor-pointer`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(
            `${env.NEXT_PUBLIC_SHAREABLE_EMAIL}`,
          );
          setCopied(true);
        } catch {
          toast.error("Unable to copy Email");
        }
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key={"copied"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {"Copied"}
          </motion.span>
        ) : (
          <motion.span
            key={"email"}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {"Email"}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
