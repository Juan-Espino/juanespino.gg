"use client";

import { type ElementType, useEffect, useMemo, useRef } from "react";
import { getCurtain, subscribeCurtain } from "~/lib/curtain";

/**
 * Left-to-right glitch decode, modelled on a reference recording:
 * - Letters swap to random characters (same case: A–Z/0–9 or a–z/0–9) every
 *   ~50ms; spaces and punctuation never change.
 * - A front sweeps left to right: each letter starts scrambling a beat after
 *   the one before it and snaps back to itself in order, so the word
 *   "resolves" from the left.
 * - Stepped, no easing, no fade or movement.
 * - About 0.4s for a short word, a little longer for longer text (capped).
 *
 * Each letter is its own span holding the real character, so the layout is
 * fixed by the real text. While scrambling, the real glyph is painted
 * transparent and the random one is drawn over it by CSS (::after, centered,
 * see `.glitch-ch` in globals.css). Ending just removes an attribute, so the
 * last frame is the real text: no shift, no flash.
 */

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const LOWER = "abcdefghijklmnopqrstuvwxyz0123456789";
const SWAP_MS = 50;
// A letter starts scrambling this long after the one before it...
const START_STAGGER_MS = 20;
// ...and the first one holds random for at least this long.
const FIRST_RESOLVE_MS = 120;

function randomGlyph(original: string) {
  const set = original === original.toLowerCase() ? LOWER : UPPER;
  return set[Math.floor(Math.random() * set.length)] ?? original;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Run one decode pass over the letters in `root`; returns a cancel. */
function decode(root: HTMLElement, maxMs: number) {
  const letters = Array.from(
    root.querySelectorAll<HTMLElement>("[data-glitch-ch]"),
  );
  const count = letters.length;
  if (!count) return () => undefined;
  const total = Math.min(250 + 35 * count, maxMs);
  const plan = letters.map((el, i) => ({
    el,
    char: el.textContent ?? "",
    startAt: i * START_STAGGER_MS,
    resolveAt:
      FIRST_RESOLVE_MS + ((total - FIRST_RESOLVE_MS) * (i + 1)) / count,
  }));

  let frame = 0;
  let lastSwap = -Infinity;
  const start = performance.now();
  const clear = () => {
    for (const { el } of plan) el.removeAttribute("data-glyph");
  };

  function tick(now: number) {
    const t = now - start;
    if (t >= total) {
      clear();
      return;
    }
    if (now - lastSwap >= SWAP_MS) {
      lastSwap = now;
      for (const letter of plan) {
        if (t >= letter.resolveAt || t < letter.startAt) {
          letter.el.removeAttribute("data-glyph");
        } else {
          letter.el.setAttribute("data-glyph", randomGlyph(letter.char));
        }
      }
    } else {
      // Between swaps, still release letters exactly on their beat.
      for (const letter of plan) {
        if (t >= letter.resolveAt) letter.el.removeAttribute("data-glyph");
      }
    }
    frame = window.requestAnimationFrame(tick);
  }

  frame = window.requestAnimationFrame(tick);
  return () => {
    window.cancelAnimationFrame(frame);
    clear();
  };
}

type GlitchTextProps = {
  text: string;
  /**
   * "hover": plays each time the pointer enters the nearest link/button (or
   * it's keyboard-focused). "entrance": plays once as the page fades up.
   */
  trigger?: "hover" | "entrance";
  as?: ElementType;
  className?: string;
  /** Entrance only: extra delay in ms after the curtain lifts. */
  delay?: number;
  /** Longest a pass may take, for long titles. */
  maxMs?: number;
};

export default function GlitchText({
  text,
  trigger = "hover",
  as,
  className,
  delay = 0,
  maxMs = 900,
}: GlitchTextProps) {
  const Tag: ElementType = as ?? "span";
  const ref = useRef<HTMLElement>(null);
  const segments = useMemo(
    () =>
      Array.from(
        new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(
          text,
        ),
        ({ segment }) => segment,
      ),
    [text],
  );

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let cancel: (() => void) | null = null;
    let running = false;

    function play() {
      if (running || !root || prefersReducedMotion()) return;
      running = true;
      const stop = decode(root, maxMs);
      // Let a new pass start once this one has had time to finish.
      const done = window.setTimeout(
        () => {
          running = false;
        },
        Math.min(250 + 35 * segments.length, maxMs),
      );
      cancel = () => {
        stop();
        window.clearTimeout(done);
        running = false;
      };
    }

    if (trigger === "hover") {
      const host = root.closest<HTMLElement>("a, button") ?? root;
      const onFocus = () => {
        if (host.matches(":focus-visible")) play();
      };
      host.addEventListener("pointerenter", play);
      host.addEventListener("focus", onFocus);
      return () => {
        host.removeEventListener("pointerenter", play);
        host.removeEventListener("focus", onFocus);
        cancel?.();
      };
    }

    // Entrance: once, when on screen and the page has started fading up
    // (same conditions as <Reveal>), so it decodes as it appears.
    let visible = false;
    let timer: number | null = null;
    const tryPlay = () => {
      if (timer !== null || !visible || !getCurtain().lifted) return;
      timer = window.setTimeout(play, delay);
      observer.disconnect();
      unsubscribe();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      tryPlay();
    });
    observer.observe(root);
    const unsubscribe = subscribeCurtain(tryPlay);
    return () => {
      observer.disconnect();
      unsubscribe();
      if (timer !== null) window.clearTimeout(timer);
      cancel?.();
    };
  }, [trigger, delay, maxMs, segments.length]);

  return (
    <Tag ref={ref} className={className}>
      {/* Screen readers get the whole string, not a span per letter. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {segments.map((segment, i) =>
          segment.trim() && /[\p{L}\p{N}]/u.test(segment) ? (
            <span key={i} data-glitch-ch="" className="glitch-ch">
              {segment}
            </span>
          ) : (
            segment
          ),
        )}
      </span>
    </Tag>
  );
}
