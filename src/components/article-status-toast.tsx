// src/components/article-status-toast.tsx
"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

type ArticleStatusToastProps = {
  created?: boolean;
  updated?: boolean;
  deleted?: boolean;
};

export default function ArticleStatusToast({
  created,
  updated,
  deleted,
}: ArticleStatusToastProps) {
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (hasShownToast.current) return;

    if (created) {
      toast.success("article created", { position: "top-center" });
      hasShownToast.current = true;
      return;
    }

    if (updated) {
      toast.success("article updated", { position: "top-center" });
      hasShownToast.current = true;
      return;
    }

    if (deleted) {
      toast.success("article deleted", { position: "top-center" });
      hasShownToast.current = true;
      return;
    }
  }, [created, updated, deleted]);

  return null;
}
