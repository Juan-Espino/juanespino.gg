"use client";
import { useEffect, useRef } from "react";

type AshParticle = {
  x: number;
  y: number;
  size: number;
  opacity: number;
  vx: number;
  vy: number;
  depth: number;
  depthSpeed: number;
  pushX: number;
  pushY: number;
  shape: "dust" | "flake";
  rotation: number;
  rotationSpeed: number;
  length: number;
};

export default function AshFieldCanvas() {
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

    function resizeCanvas() {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      startAnimation();
    }

    function getAshShape() {
      return Math.random() < 0.02 ? "flake" : "dust";
    }

    function getAshSize() {
      return 0.4 + Math.random() * 0.1;
    }

    function createParticles(width: number, height: number): AshParticle[] {
      const particleCount = Math.round((width * height) / 7000);

      return Array.from({ length: particleCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: getAshSize(),
        opacity: 0.08 + Math.random() * 0.22,

        vx: -0.08 + Math.random() * 0.22,

        vy: -0.03 + Math.random() * 0.12,

        depth: Math.random(),
        depthSpeed: 0.0008 + Math.random() * 0.002,
        pushX: Math.cos(Math.random() * Math.PI * 2) * 0.08,
        pushY: Math.sin(Math.random() * Math.PI * 2) * 0.08,
        shape: getAshShape(),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: -0.003 + Math.random() * 0.006,
        length: 8 + Math.random() * 18,
      }));
    }

    function drawParticles(
      context: CanvasRenderingContext2D,
      particles: AshParticle[],
    ) {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const particle of particles) {
        const visualDepth = Math.min(particle.depth, 1);
        const depthScale = 0.4 + visualDepth * 1.8;
        const size = particle.size * depthScale;
        const opacity = particle.opacity * (0.35 + visualDepth * 0.9);

        if (particle.shape === "flake") {
          context.save();
          context.translate(particle.x, particle.y);
          context.rotate(particle.rotation);

          context.beginPath();
          context.fillStyle = `rgba(225, 225, 214, ${opacity * 0.75})`;
          context.roundRect(
            -size * 0.35,
            -length / 2,
            size * 0.7,
            -particle.length / 2,
            size,
          );
          context.fill();

          context.restore();
        } else {
          context.beginPath();
          context.fillStyle = `rgba(235, 235, 225, ${opacity})`;
          context.arc(particle.x, particle.y, size, 0, Math.PI * 2);
          context.fill();
        }
      }
    }

    function updateParticles(
      particles: AshParticle[],
      width: number,
      height: number,
    ) {
      const centerX = width / 2;
      const centerY = height / 2;

      for (const particle of particles) {
        particle.depth += particle.depthSpeed;
        particle.rotation += particle.rotationSpeed;

        const visualDepth = Math.min(particle.depth, 1);
        const depthVelocity = 0.2 + visualDepth * 0.8;
        const fromCenterX = particle.x - centerX;
        const fromCenterY = particle.y - centerY;

        particle.x +=
          particle.vx +
          particle.pushX * depthVelocity +
          fromCenterX * 0.0006 * depthVelocity;

        particle.y +=
          particle.vy +
          particle.pushY * depthVelocity +
          fromCenterY * 0.0006 * depthVelocity;

        const margin = 120;

        if (
          particle.x > width + margin ||
          particle.x < -margin ||
          particle.y > height + margin ||
          particle.y < -margin
        ) {
          particle.x = Math.random() * width;
          particle.y = Math.random() * height;
          particle.depth = 0;
          particle.size = getAshSize();
          particle.opacity = 0.06 + Math.random() * 0.18;
          particle.vx = -0.08 + Math.random() * 0.22;
          particle.vy = -0.03 + Math.random() * 0.12;
          particle.depthSpeed = 0.0008 + Math.random() * 0.002;
          particle.pushX = Math.cos(Math.random() * Math.PI * 2) * 0.08;
          particle.pushY = Math.sin(Math.random() * Math.PI * 2) * 0.08;
          particle.shape = getAshShape();
          particle.rotation = Math.random() * Math.PI * 2;
          particle.rotationSpeed = -0.003 + Math.random() * 0.006;
          particle.length = 8 + Math.random() * 18;
        }
      }
    }

    let width = window.innerWidth;
    let height = window.innerHeight;
    const particles = createParticles(width, height);
    let animationFrameId: number | null = null;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function startAnimation() {
      stopAnimation();

      if (mediaQuery.matches) {
        drawParticles(context, particles);
        return;
      }

      function animate() {
        updateParticles(particles, width, height);
        drawParticles(context, particles);
        animationFrameId = window.requestAnimationFrame(animate);
      }

      animate();
    }

    function handleMotionPreferenceChange() {
      startAnimation();
    }

    function stopAnimation() {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }

    resizeCanvas();

    mediaQuery.addEventListener("change", handleMotionPreferenceChange);
    window.addEventListener("resize", resizeCanvas);
    return () => {
      stopAnimation();
      window.removeEventListener("resize", resizeCanvas);
      mediaQuery.removeEventListener("change", handleMotionPreferenceChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 h-screen w-screen"
    />
  );
}
