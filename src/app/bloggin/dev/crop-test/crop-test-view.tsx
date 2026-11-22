"use client";
import { useState } from "react";
import { useImageCropper } from "~/components/image-cropper";
import ImageDropZone from "~/components/image-drop-zone";
import { loadImage, markdownStylesHeader } from "./helpers";

type Result = {
  name: string;
  type: string;
  size: number;
  width: number;
  height: number;
  // Average color of the left and right quarters, to check what was kept.
  left: [number, number, number];
  right: [number, number, number];
};

async function describe(file: File): Promise<Result> {
  const url = URL.createObjectURL(file);
  const img = await loadImage(url);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const avg = (x: number): [number, number, number] => {
    const w = Math.max(1, Math.floor(canvas.width / 4));
    const d = ctx.getImageData(x, 0, w, canvas.height).data;
    const sum = [0, 0, 0];
    for (let i = 0; i < d.length; i += 4) {
      sum[0]! += d[i]!;
      sum[1]! += d[i + 1]!;
      sum[2]! += d[i + 2]!;
    }
    const n = d.length / 4;
    return [sum[0]! / n, sum[1]! / n, sum[2]! / n].map(Math.round) as [number, number, number];
  };
  URL.revokeObjectURL(url);
  return {
    name: file.name,
    type: file.type,
    size: file.size,
    width: img.naturalWidth,
    height: img.naturalHeight,
    left: avg(0),
    right: avg(Math.floor((canvas.width * 3) / 4)),
  };
}

export default function CropTestView() {
  const { prepare, cropper } = useImageCropper();
  const [result, setResult] = useState<Result | "cancelled" | null>(null);

  return (
    <div className="flex flex-col gap-6 py-8">
      {cropper}
      <div className={markdownStylesHeader}>
        <ImageDropZone
          onFile={async (file) => {
            setResult(null);
            const ready = await prepare(file);
            setResult(ready ? await describe(ready) : "cancelled");
          }}
        />
      </div>
      <pre data-testid="result">{result ? JSON.stringify(result) : ""}</pre>
    </div>
  );
}
