"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef } from "react";
import { coverCurtain, ENTRANCE, liftCurtain } from "~/lib/curtain";

// Slow fade-through-black between routes. Only the page content fades: the
// dotted grid (mounted outside this stage) stays put, so the old page sinks
// into the dark background and dots, the next route loads while hidden, then
// rises back out.
const FADE_OUT_MS = 900;
const HOLD_MS = 200;
const FADE_IN_MS = 900;
// If the route never commits (error, same-path redirect), lift the curtain.
const STUCK_MS = 6000;
// One soft ease-in-out for both halves: the black thins slowly, moves
// through the middle, and settles, instead of snapping at either end.
const EASE = ENTRANCE.ease;
// The first-load intro is a CSS animation (.page-transition-stage in
// globals.css) so it runs on first paint, before hydration. Keep its numbers
// in step with HOLD_MS / FADE_IN_MS / EASE.

type Phase = "idle" | "out" | "waiting" | "in";

export default function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const stageRef = useRef<HTMLDivElement>(null);
  const phase = useRef<Phase>("idle");
  const animation = useRef<Animation | null>(null);
  const stuckTimer = useRef<number | null>(null);
  const isPopNavigation = useRef(false);
  const lastPathname = useRef(pathname);
  const liftTimer = useRef<number | null>(null);

  // Tell entrance animations the black is starting to lift.
  function scheduleLift(delayMs: number) {
    if (liftTimer.current !== null) window.clearTimeout(liftTimer.current);
    liftTimer.current = window.setTimeout(() => {
      liftTimer.current = null;
      liftCurtain();
    }, delayMs);
  }

  // `from` / `to` are how covered the page is (0 = fully visible, 1 = fully
  // hidden), so the stage's opacity is the inverse.
  function fade(
    from: number,
    to: number,
    duration: number,
    easing: string,
    delay = 0,
  ) {
    const stage = stageRef.current;
    if (!stage) return null;
    animation.current?.cancel();
    const next = stage.animate([{ opacity: 1 - from }, { opacity: 1 - to }], {
      duration,
      delay,
      easing,
      // "both" so the start opacity holds during `delay` too; with "forwards"
      // the stage jumps to its base opacity 1 during the hold and the new
      // page flashes before the fade-in begins.
      fill: "both",
    });
    animation.current = next;
    return next;
  }

  function reveal(fromOpacity: number) {
    const stage = stageRef.current;
    if (!stage) return;
    if (stuckTimer.current !== null) {
      window.clearTimeout(stuckTimer.current);
      stuckTimer.current = null;
    }
    phase.current = "in";
    const next = fade(fromOpacity, 0, FADE_IN_MS, EASE, HOLD_MS);
    scheduleLift(HOLD_MS);
    if (!next) return;
    next.onfinish = () => {
      phase.current = "idle";
      stage.style.pointerEvents = "";
      // Drop the finished animation: its end value (1) is the natural one,
      // and a lingering filled opacity animation keeps the whole page in its
      // own compositing layer for nothing.
      next.cancel();
    };
  }

  // Intercept internal link clicks before Next's <Link> handles them.
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function onClick(event: MouseEvent) {
      if (
        reduceMotion.matches ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor?.href) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Hash jumps and query-only changes stay on the same page: no curtain.
      if (url.pathname === window.location.pathname) return;

      event.preventDefault();
      if (phase.current !== "idle") return;

      const stage = stageRef.current;
      if (!stage) return;

      const href = url.pathname + url.search + url.hash;
      router.prefetch(href);
      phase.current = "out";
      // No clicks on a page that's fading away.
      stage.style.pointerEvents = "none";

      const out = fade(0, 1, FADE_OUT_MS, EASE);
      if (!out) return;
      out.onfinish = () => {
        phase.current = "waiting";
        // Fully hidden: the next page mounts "covered" and holds its entrance.
        coverCurtain();
        router.push(href);
        stuckTimer.current = window.setTimeout(() => reveal(1), STUCK_MS);
      };
    }

    function onPopState() {
      isPopNavigation.current = true;
      if (!reduceMotion.matches && phase.current === "idle") coverCurtain();
    }

    // First load: the CSS intro lifts the black HOLD_MS after first paint.
    // performance.now() is measured from navigation start, so a slow hydrate
    // lifts straight away instead of waiting a further HOLD_MS.
    scheduleLift(
      reduceMotion.matches ? 0 : Math.max(0, HOLD_MS - performance.now()),
    );

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // The new route has committed: rise back out of black.
  useEffect(() => {
    if (pathname === lastPathname.current) return;
    lastPathname.current = pathname;

    if (phase.current === "waiting") {
      reveal(1);
      return;
    }

    // Back/forward can't be delayed, so start from black and fade in.
    if (isPopNavigation.current && phase.current === "idle") {
      isPopNavigation.current = false;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) liftCurtain();
      else reveal(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(
    () => () => {
      animation.current?.cancel();
      if (stuckTimer.current !== null) window.clearTimeout(stuckTimer.current);
      if (liftTimer.current !== null) window.clearTimeout(liftTimer.current);
    },
    [],
  );

  return (
    <div ref={stageRef} className="page-transition-stage">
      {children}
    </div>
  );
}
