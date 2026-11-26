"use client";

import { type ElementType, useEffect, useRef, useState } from "react";
import { ENTRANCE, useCurtain } from "~/lib/curtain";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const LOWER = "abcdefghijklmnopqrstuvwxyz0123456789";
const GLYPH_SWAP_MS = 45;

function randomGlyph(original: string) {
  const set = original === original.toLowerCase() ? LOWER : UPPER;
  return set[Math.floor(Math.random() * set.length)] ?? original;
}

type ScrambleTextProps = {
  text: string;
  as?: ElementType;
  className?: string;
  /** Extra delay in ms after the curtain starts lifting. */
  delay?: number;
  /**
   * Replay every time the curtain lifts (for UI that stays mounted across
   * navigations, like the header). Otherwise it plays once.
   */
  replay?: boolean;
};

type Phase = "waiting" | "running" | "done";

type Glyph = { el: HTMLSpanElement; char: string; resolveAt: number };

/**
 * Position one absolutely placed glyph over each visible character of the
 * real text, measured from the live layout. The real text is never touched,
 * so nothing re-flows when the decode starts or ends.
 */
function buildGlyphs(textEl: HTMLElement, overlay: HTMLElement): Glyph[] {
  const node = textEl.firstChild;
  overlay.replaceChildren();
  if (!(node instanceof Text)) return [];
  const text = node.textContent ?? "";
  const origin = overlay.getBoundingClientRect();
  const range = document.createRange();
  const segments = Array.from(
    new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text),
  );
  const glyphs: Glyph[] = [];
  segments.forEach(({ segment, index }, i) => {
    if (!segment.trim()) return;
    range.setStart(node, index);
    range.setEnd(node, index + segment.length);
    const rect = range.getClientRects()[0];
    if (!rect?.width) return;
    const el = document.createElement("span");
    el.textContent = randomGlyph(segment);
    // Centered on the real character so a wider glyph overhangs evenly.
    el.style.cssText = `position:absolute;left:${rect.left - origin.left + rect.width / 2}px;top:${rect.top - origin.top}px;height:${rect.height}px;line-height:${rect.height}px;transform:translateX(-50%);white-space:pre;`;
    overlay.appendChild(el);
    // Resolve left to right over the back 70% of the run.
    glyphs.push({
      el,
      char: segment,
      resolveAt: 0.3 + (i / Math.max(segments.length, 1)) * 0.7,
    });
  });
  return glyphs;
}

/**
 * Text that decodes from random characters, left to right, as the curtain
 * lifts. The real text keeps its exact place in the layout the whole time
 * (only hidden while decoding); the random glyphs live on an absolutely
 * positioned layer above it, so the page never shifts when the animation
 * starts or completes. Screen readers only get the real text.
 */
export default function ScrambleText({
  text,
  as,
  className,
  delay = 0,
  replay = false,
}: ScrambleTextProps) {
  const Tag: ElementType = as ?? "span";
  const { lifted, generation } = useCurtain();
  const [phase, setPhase] = useState<Phase>("waiting");
  const textRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLSpanElement>(null);
  const playedGeneration = useRef<number | null>(null);
  const mountGeneration = useRef(generation);
  const mountedLifted = useRef(lifted);

  useEffect(() => {
    if (!lifted) return;
    if (playedGeneration.current === generation) return;
    // Mounted after a lift with nothing new to reveal (e.g. client-side UI
    // appearing later): show the final text, don't scramble out of nowhere.
    const showFinalOnly =
      (mountedLifted.current &&
        generation === mountGeneration.current &&
        playedGeneration.current === null) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!showFinalOnly && !replay && playedGeneration.current !== null) return;
    playedGeneration.current = generation;

    let frame = 0;
    let lastSwap = 0;
    let glyphs: Glyph[] = [];
    const start = performance.now() + delay;
    const overlay = overlayRef.current;

    function finish() {
      overlay?.replaceChildren();
      setPhase("done");
    }

    function tick(now: number) {
      const elapsed = now - start;
      if (elapsed >= ENTRANCE.scrambleMs) {
        finish();
        return;
      }
      if (elapsed >= 0 && now - lastSwap >= GLYPH_SWAP_MS) {
        lastSwap = now;
        const progress = elapsed / ENTRANCE.scrambleMs;
        for (const glyph of glyphs) {
          glyph.el.textContent =
            progress >= glyph.resolveAt ? glyph.char : randomGlyph(glyph.char);
        }
      }
      frame = window.requestAnimationFrame(tick);
    }

    // State changes happen in frame callbacks, never synchronously here.
    frame = window.requestAnimationFrame(() => {
      const textEl = textRef.current;
      if (showFinalOnly || !textEl || !overlay) {
        finish();
        return;
      }
      glyphs = buildGlyphs(textEl, overlay);
      setPhase("running");
      frame = window.requestAnimationFrame(tick);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      // Interrupted mid-decode (e.g. back button): never strand random glyphs.
      overlay?.replaceChildren();
      setPhase((current) => (current === "running" ? "done" : current));
    };
  }, [lifted, generation, replay, delay, text]);

  return (
    <Tag className={className ? `relative ${className}` : "relative"}>
      <span className="sr-only">{text}</span>
      {/* The real text: same DOM in every phase, so its layout never changes.
          Hidden until decoded (a <noscript> rule in the root layout shows it
          if JS never runs). */}
      <span
        ref={textRef}
        aria-hidden="true"
        data-scramble={phase}
        className={phase === "done" ? undefined : "invisible"}
      >
        {text}
      </span>
      <span
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      />
    </Tag>
  );
}
