"use client";
import { Minus, Move, Plus } from "lucide-react";
import { Dialog } from "radix-ui";
import { useCallback, useRef, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import {
  cropToFile,
  fitsAsIs,
  HEADER_ASPECT,
  loadImage,
} from "~/lib/crop-image";
import { Button } from "./ui/button";

type Pending = {
  url: string;
  img: HTMLImageElement;
  file: File;
  resolve: (file: File | null) => void;
};

const MAX_ZOOM = 3;

/**
 * `prepare(file)` resolves to the file to upload: the original when it's
 * already 3:2, otherwise the user's crop from the dialog, or null if they
 * cancel. Render `cropper` once somewhere in the tree.
 */
export function useImageCropper() {
  const [pending, setPending] = useState<Pending | null>(null);
  const [open, setOpen] = useState(false);

  const prepare = useCallback(async (file: File): Promise<File | null> => {
    if (!file.type.startsWith("image/")) {
      throw new Error("That file isn't an image");
    }
    const url = URL.createObjectURL(file);
    const img = await loadImage(url).catch((error: unknown) => {
      URL.revokeObjectURL(url);
      throw error;
    });
    if (fitsAsIs(img, file)) {
      URL.revokeObjectURL(url);
      return file;
    }
    return new Promise<File | null>((resolve) => {
      setPending({ url, img, file, resolve });
      setOpen(true);
    });
  }, []);

  const finish = useCallback(
    (result: File | null) => {
      if (!pending || !open) return;
      pending.resolve(result);
      setOpen(false);
      // Keep the image until the close animation has finished.
      const { url } = pending;
      setTimeout(() => {
        setPending((current) => (current?.url === url ? null : current));
        URL.revokeObjectURL(url);
      }, 300);
    },
    [pending, open],
  );

  const cropper = (
    <ImageCropperDialog
      key={pending?.url}
      pending={pending}
      open={open}
      onDone={finish}
    />
  );

  return { prepare, cropper };
}

function ImageCropperDialog({
  pending,
  open,
  onDone,
}: {
  pending: Pending | null;
  open: boolean;
  onDone: (file: File | null) => void;
}) {
  // Starts centered with the image filling the 3:2 frame: a ready crop
  // the user can accept straight away or drag into place.
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const areaRef = useRef<Area | null>(null);

  async function confirm() {
    if (!pending || !areaRef.current || busy) return;
    setBusy(true);
    setError(null);
    try {
      onDone(await cropToFile(pending.img, areaRef.current, pending.file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't crop that image");
      setBusy(false);
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(open) => {
        if (!open && !busy) onDone(null);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 bg-bloggin-background border-bloggin-border/40 fixed top-1/2 left-1/2 z-50 flex w-[min(92vw,44rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-2xl border p-4 shadow-2xl outline-none sm:p-5"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void confirm();
            }
          }}
        >
          <div className="flex items-baseline justify-between gap-4">
            <Dialog.Title className="text-bloggin-foreground text-base font-semibold">
              crop image
            </Dialog.Title>
            <Dialog.Description className="text-bloggin-muted flex items-center gap-1.5 text-xs">
              <Move className="size-3.5" aria-hidden />
              drag to position · scroll or pinch to zoom
            </Dialog.Description>
          </div>

          {/* Same 3:2 shape as the article's image container. */}
          <div className="relative aspect-3/2 w-full overflow-hidden rounded-xl bg-black">
            {pending ? (
              <Cropper
                image={pending.url}
                crop={crop}
                zoom={zoom}
                maxZoom={MAX_ZOOM}
                aspect={HEADER_ASPECT}
                objectFit="cover"
                showGrid
                zoomSpeed={0.15}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_area, pixels) => {
                  areaRef.current = pixels;
                }}
                classes={{
                  cropAreaClassName: "!border-bloggin-accent/80 !rounded-xl",
                }}
              />
            ) : null}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="text-bloggin-muted flex flex-1 items-center gap-3">
              <span className="sr-only">zoom</span>
              <Minus className="size-4 shrink-0" aria-hidden />
              <input
                type="range"
                min={1}
                max={MAX_ZOOM}
                step={0.01}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="accent-bloggin-accent h-1 w-full cursor-pointer"
                aria-label="zoom"
              />
              <Plus className="size-4 shrink-0" aria-hidden />
            </label>
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button type="button" variant="outline" disabled={busy}>
                  cancel
                </Button>
              </Dialog.Close>
              <Button
                type="button"
                onClick={() => void confirm()}
                disabled={busy}
                autoFocus
              >
                {busy ? "cropping..." : "use image"}
              </Button>
            </div>
          </div>
          {error ? <p className="text-sm text-red-500!">{error}</p> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
