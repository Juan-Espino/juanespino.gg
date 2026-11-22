"use client";
import { ImageUp } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "~/lib/utils";

type ImageDropZoneProps = {
  onFile: (file: File) => void;
  disabled?: boolean;
  /** "panel": the visible dashed box. "overlay": an invisible tap target. */
  variant?: "panel" | "overlay";
  className?: string;
};

function firstImage(files: FileList | File[] | null | undefined) {
  return [...(files ?? [])].find((file) => file.type.startsWith("image/"));
}

/**
 * Pick, drop or paste an image. The file goes to `onFile` (which crops and
 * uploads it); nothing is uploaded from here directly.
 */
export default function ImageDropZone({
  onFile,
  disabled,
  variant = "panel",
  className,
}: ImageDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function take(files: FileList | File[] | null | undefined) {
    const file = firstImage(files);
    if (file && !disabled) onFile(file);
  }

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label="add an image"
      onClick={() => inputRef.current?.click()}
      onPaste={(event) => {
        const file = firstImage(event.clipboardData.files);
        if (!file) return;
        event.preventDefault();
        take([file]);
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        take(event.dataTransfer.files);
      }}
      className={cn(
        "group/drop cursor-pointer outline-none disabled:cursor-not-allowed",
        variant === "panel" &&
          "border-bloggin-border/40 bg-bloggin-background/60 hover:border-bloggin-accent/70 focus-visible:border-bloggin-accent/70 flex h-full w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 text-center transition-colors",
        variant === "panel" && dragging && "border-bloggin-accent bg-bloggin-accent/5",
        variant === "overlay" && "absolute inset-0",
        className,
      )}
    >
      {variant === "panel" ? (
        <>
          <ImageUp
            className="text-bloggin-muted group-hover/drop:text-bloggin-accent size-9 transition-colors"
            aria-hidden
          />
          <span className="text-bloggin-foreground text-sm font-semibold">
            drop, paste or click here!
          </span>
          <span className="text-bloggin-muted/70 text-xs">
            any image — you&apos;ll crop it to fit
          </span>
        </>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          take(event.target.files);
          event.target.value = "";
        }}
      />
    </button>
  );
}
