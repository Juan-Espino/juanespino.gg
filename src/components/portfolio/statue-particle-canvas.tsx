"use client";
import { useEffect, useRef } from "react";
export default function StatueParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const currentCanvas = canvasRef.current;

    if (!currentCanvas) {
      return;
    }

    const currentContext = currentCanvas.getContext("2d");

    if (!currentContext) {
      return;
    }

    const canvas: HTMLCanvasElement = currentCanvas;
    const context: CanvasRenderingContext2D = currentContext;

    const image = new Image();
    image.src = "/portfolio/statue-source.jpg";

    function drawDottedStatue() {
      const parentElement = canvas.parentElement;

      if (!parentElement || !image.complete) {
        return;
      }

      const bounds = parentElement.getBoundingClientRect();
      const width = bounds.width;
      const height = bounds.height;

      const offscreenCanvas = document.createElement("canvas");
      const offscreenContext = offscreenCanvas.getContext("2d");

      if (!offscreenContext) {
        return;
      }

      const sampleWidth = Math.floor(width);
      const sampleHeight = Math.floor(height);
      offscreenCanvas.width = Math.floor(width);
      offscreenCanvas.height = Math.floor(height);

      const imageAspect = image.width / image.height;
      const canvasAspect = width / height;

      let drawWidth = width;
      let drawHeight = height;
      let offsetX = 0;
      let offsetY = 0;

      if (imageAspect > canvasAspect) {
        drawHeight = height;
        drawWidth = height * imageAspect;
        offsetX = (width - drawWidth) / 2;
      } else {
        drawWidth = width;
        drawHeight = width / imageAspect;
        offsetY = (height - drawHeight) / 2;
      }

      offscreenContext.drawImage(
        image,
        offsetX,
        offsetY,
        drawWidth,
        drawHeight,
      );

      const imageData = offscreenContext.getImageData(
        0,
        0,
        sampleWidth,
        sampleHeight,
      );
      const pixels = imageData.data;

      context.clearRect(0, 0, width, height);

      const spacing = 5;
      const threshold = 35;
      for (let y = 0; y < height; y += spacing) {
        for (let x = 0; x < width; x += spacing) {
          const pixelIndex =
            (Math.floor(y) * Math.floor(width) + Math.floor(x)) * 4;

          const red = pixels[pixelIndex] ?? 0;
          const green = pixels[pixelIndex + 1] ?? 0;
          const blue = pixels[pixelIndex + 2] ?? 0;

          const brightness = (red + green + blue) / 3;

          if (brightness < threshold) {
            continue;
          }

          const alpha = brightness / 255;
          const radius = 0.45 + alpha * 1.4;

          context.beginPath();
          context.fillStyle = `rgba(238, 238, 232, ${0.25 + alpha * 0.75})`;
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fill();
        }
      }
    }

    function resizeCanvas() {
      const parentElement = canvas.parentElement;

      if (!parentElement) {
        return;
      }

      const bounds = parentElement.getBoundingClientRect();
      const width = bounds.width;
      const height = bounds.height;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);

      drawDottedStatue();
    }

    image.onload = () => {
      resizeCanvas();
    };
    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas.parentElement ?? canvas);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      aria-label="Dotted statue visual"
      className="h-full w-full"
    />
  );
}
