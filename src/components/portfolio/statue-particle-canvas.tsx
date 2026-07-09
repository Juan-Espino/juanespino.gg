"use client";
import { useEffect, useRef } from "react";

type StatueParticle = {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  radius: number;
  opacity: number;
  phase: number;
  shimmer: number;
  breakX: number;
  breakY: number;
  startX: number;
  startY: number;
  vx: number;
  vy: number;
};

export default function StatueParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<StatueParticle[]>([]);
  const isBreakingRef = useRef(false);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const breakProgressRef = useRef(0);
  const reduceMotionRef = useRef(false);

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

    let canvasWidth = 0;
    let canvasHeight = 0;
    let animationFrameId: number | null = null;

    const image = new Image();
    image.src = "/portfolio/statue-source.jpg";

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceMotionRef.current = mediaQuery.matches;

    let introStartTime = performance.now();
    const introDuration = 1800;

    function stopAnimation() {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }

    function startAnimation() {
      stopAnimation();

      if (mediaQuery.matches) {
        drawStatueParticles(particlesRef.current, canvasWidth, canvasHeight);
        return;
      }

      animateStatue();
    }

    function handleMotionPreferenceChange() {
      reduceMotionRef.current = mediaQuery.matches;

      startAnimation();
    }

    function animateStatue() {
      const particles = particlesRef.current;

      const pointer = pointerRef.current;

      const elapsed = performance.now() - introStartTime;
      const rawIntroProgress = Math.min(elapsed / introDuration, 1);
      const introProgress = 1 - Math.pow(1 - rawIntroProgress, 3);

      const targetBreakProgress = isBreakingRef.current ? 1 : 0;

      breakProgressRef.current +=
        (targetBreakProgress - breakProgressRef.current) * 0.08;

      const breakProgress = breakProgressRef.current;

      for (const particle of particles) {
        const idleStrength = introProgress;
        const wave = Math.sin(performance.now() * 0.0015 + particle.phase);
        const idleX = wave * particle.shimmer * idleStrength;
        const idleY = wave * particle.shimmer * 0.35 * idleStrength;

        const isIntroActive = rawIntroProgress < 1;

        const formedX = particle.homeX;
        const formedY = particle.homeY;

        let pointerOffsetX = 0;
        let pointerOffsetY = 0;

        if (isBreakingRef.current && pointer) {
          const dx = particle.homeX - pointer.x;
          const dy = particle.homeY - pointer.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const influenceRadius = 45;
          const force = Math.max(0, 1 - distance / influenceRadius);

          pointerOffsetX = (dx / distance) * force * 70;
          pointerOffsetY = (dy / distance) * force * 70;
        }

        const targetX =
          formedX +
          idleX +
          (particle.breakX * 0.035 + pointerOffsetX) * breakProgress;

        const targetY =
          formedY +
          idleY +
          (particle.breakY * 0.035 + pointerOffsetY) * breakProgress;

        const stiffness = isIntroActive ? 0.025 : 0.045;
        const damping = isIntroActive ? 0.92 : 0.82;

        const forceX = (targetX - particle.x) * stiffness;
        const forceY = (targetY - particle.y) * stiffness;

        particle.vx = (particle.vx + forceX) * damping;
        particle.vy = (particle.vy + forceY) * damping;

        particle.x += particle.vx;
        particle.y += particle.vy;
      }

      drawStatueParticles(particles, canvasWidth, canvasHeight);

      animationFrameId = window.requestAnimationFrame(animateStatue);
    }

    function drawDottedStatue() {
      const parentElement = canvas.parentElement;

      if (!parentElement || !image.complete || image.naturalWidth === 0) {
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
      if (sampleWidth <= 0 || sampleHeight <= 0) {
        return;
      }

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

      const particles: StatueParticle[] = [];

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
          const opacity = 0.25 + alpha * 0.75;
          const breakAngle = Math.random() * Math.PI * 2;
          const breakDistance = 12 + Math.random() * 42;

          const side = Math.floor(Math.random() * 4);

          let startX = x;
          let startY = y;

          if (side === 0) startY = -80;
          if (side === 1) startX = sampleWidth + 80;
          if (side === 2) startY = sampleHeight + 80;
          if (side === 3) startX = -80;

          particles.push({
            homeX: x,
            homeY: y,
            x: reduceMotionRef.current ? x : startX,
            y: reduceMotionRef.current ? y : startY,
            startX,
            startY,
            radius,
            opacity,
            phase: Math.random() * Math.PI * 2,
            shimmer: Math.random() * 0.8,
            breakX: Math.cos(breakAngle) * breakDistance,
            breakY: Math.sin(breakAngle) * breakDistance,
            vx: 0,
            vy: 0,
          });
        }
      }
      particlesRef.current = particles;
      introStartTime = performance.now();

      drawStatueParticles(particlesRef.current, sampleWidth, sampleHeight);
      startAnimation();
    }

    function drawStatueParticles(
      particles: StatueParticle[],
      width: number,
      height: number,
    ) {
      context.clearRect(0, 0, width, height);

      for (const particle of particles) {
        context.beginPath();
        context.fillStyle = `rgba(238, 238, 232, ${particle.opacity})`;
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
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
      if (width <= 0 || height <= 0) {
        return;
      }
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      canvasWidth = width;
      canvasHeight = height;

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

    mediaQuery.addEventListener("change", handleMotionPreferenceChange);

    return () => {
      stopAnimation();
      resizeObserver.disconnect();
      mediaQuery.removeEventListener("change", handleMotionPreferenceChange);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      aria-label="Dotted statue visual"
      className="h-full w-full cursor-crosshair touch-none"
      onPointerEnter={() => {
        if (reduceMotionRef.current) return;
        isBreakingRef.current = true;
      }}
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();

        pointerRef.current = {
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        };
      }}
      onPointerLeave={() => {
        isBreakingRef.current = false;
        pointerRef.current = null;
      }}
      onPointerDown={(event) => {
        if (reduceMotionRef.current) return;

        const bounds = event.currentTarget.getBoundingClientRect();

        pointerRef.current = {
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        };

        isBreakingRef.current = true;
      }}
      onPointerUp={() => {
        isBreakingRef.current = false;
        pointerRef.current = null;
      }}
      onPointerCancel={() => {
        isBreakingRef.current = false;
        pointerRef.current = null;
      }}
    />
  );
}
