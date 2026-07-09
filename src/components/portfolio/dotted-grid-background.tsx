"use client";

import { useEffect, useRef } from "react";

type GridDot = {
  originX: number;
  originY: number;
  radius: number;
  opacity: number;
  phaseX: number;
  phaseY: number;
  speedX: number;
  speedY: number;
  driftRadius: number;
  pulsePhase: number;
  pulseSpeed: number;
};

export default function DottedGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const currentCanvas = canvasRef.current;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dots = createDots(width, height);
    let animationFrameId: number | null = null;
    const reduceMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (!currentCanvas) {
      return;
    }

    const currentContext = currentCanvas.getContext("2d");

    if (!currentContext) {
      return;
    }

    const canvas: HTMLCanvasElement = currentCanvas;
    const context: CanvasRenderingContext2D = currentContext;

    let lastDrawTime = 0;
    const frameInterval = 1000 / 50;

    function stopAnimation() {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }

    function animate(now: number) {
      if (now - lastDrawTime >= frameInterval) {
        drawDots(context, dots, width, height, now * 0.001);
        lastDrawTime = now;
      }
      animationFrameId = window.requestAnimationFrame(animate);
    }

    function startAnimation() {
      stopAnimation();

      lastDrawTime = 0;
      if (reduceMotionQuery.matches) {
        drawDots(context, dots, width, height, 0);
        return;
      }

      animationFrameId = window.requestAnimationFrame(animate);
    }

    function resizeCanvas() {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      dots = createDots(width, height);
      startAnimation();
    }

    function createDots(width: number, height: number): GridDot[] {
      const spacing = 40;
      const dots: GridDot[] = [];

      for (let y = spacing / 2; y < height; y += spacing) {
        for (let x = spacing / 2; x < width; x += spacing) {
          dots.push({
            originX: x,
            originY: y,
            radius: 0.55 + Math.random() * 0.55,
            opacity: 0.08 + Math.random() * 0.4,
            phaseX: Math.random() * Math.PI * 2,
            phaseY: Math.random() * Math.PI * 2,
            speedX: 0.12 + Math.random() * 3,
            speedY: 0.12 + Math.random() * 3,
            driftRadius: 1.2 + Math.random() * 1.6,
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.08 + Math.random() * 0.12,
          });
        }
      }

      return dots;
    }

    function drawDots(
      context: CanvasRenderingContext2D,
      dots: GridDot[],
      width: number,
      height: number,
      time: number,
    ) {
      context.clearRect(0, 0, width, height);

      for (const dot of dots) {
        const x =
          dot.originX +
          Math.sin(time * dot.speedX + dot.phaseX) * dot.driftRadius;

        const y =
          dot.originY +
          Math.cos(time * dot.speedY + dot.phaseY) * dot.driftRadius;

        const pulse =
          0.9 + Math.sin(time * dot.pulseSpeed + dot.pulsePhase) * 0.1;

        const edgeFadeX = Math.min(x / 140, (width - x) / 140, 1);
        const edgeFadeY = Math.min(y / 140, (height - y) / 140, 1);
        const edgeFade = Math.max(0, Math.min(edgeFadeX, edgeFadeY));

        const finalOpacity = dot.opacity * pulse * edgeFade;

        context.beginPath();
        context.fillStyle = `rgba(190, 190, 180, ${finalOpacity})`;
        context.arc(x, y, dot.radius, 0, Math.PI * 2);
        context.fill();
      }
    }

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);
    return () => {
      stopAnimation();
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);
  return (
    <canvas
      className="pointer-events-none fixed inset-0 h-screen w-screen"
      ref={canvasRef}
    />
  );
}
