/**
 * Image prep for article header uploads: every header image is stored at
 * the container's 3:2 shape, so the article layout never has to crop.
 */

export const HEADER_ASPECT = 3 / 2;
// Large enough for sharp retina display at the widest header (~492px).
const MAX_OUTPUT_WIDTH = 2400;
// UploadThing's articleImage route limit.
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export type PixelArea = { x: number; y: number; width: number; height: number };

export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Couldn't read that image"));
    img.src = src;
  });
}

/** Already 3:2 (within half a percent) and small enough to send as-is. */
export function fitsAsIs(img: HTMLImageElement, file: File) {
  const ratio = img.naturalWidth / img.naturalHeight;
  return (
    Math.abs(ratio - HEADER_ASPECT) / HEADER_ASPECT < 0.005 &&
    file.size <= MAX_UPLOAD_BYTES
  );
}

/** Draws `area` of the image into a new 3:2 file, scaled down if huge. */
export async function cropToFile(
  img: HTMLImageElement,
  area: PixelArea,
  original: File,
): Promise<File> {
  const width = Math.min(Math.round(area.width), MAX_OUTPUT_WIDTH);
  const height = Math.round(width / HEADER_ASPECT);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't crop that image");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    img,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    width,
    height,
  );

  // Keep PNGs (transparency); everything else becomes a compact JPEG.
  const type = original.type === "image/png" ? "image/png" : "image/jpeg";
  let blob = await toBlob(canvas, type, 0.9);
  if (blob.size > MAX_UPLOAD_BYTES) {
    blob = await toBlob(canvas, "image/jpeg", 0.85);
  }

  const base = original.name.replace(/\.[^.]+$/, "") || "image";
  const ext = blob.type === "image/png" ? "png" : "jpg";
  return new File([blob], `${base}.${ext}`, { type: blob.type });
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Couldn't crop that image")),
      type,
      quality,
    ),
  );
}
