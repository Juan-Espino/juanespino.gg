"use client";

import { useSyncExternalStore } from "react";

/**
 * The page-transition curtain (the black overlay) as a tiny shared store, so
 * entrance animations can wait for the black to start lifting instead of
 * playing unseen behind it.
 *
 * - `covered`: the screen is black (first paint, or mid route transition).
 * - `lifted`: the black has started fading out; entrances may play.
 *
 * `generation` bumps on every lift, so persistent UI (the header, which stays
 * mounted across same-layout navigations) can replay its entrance each time.
 */
type CurtainState = { lifted: boolean; generation: number };

// Starts covered: the first-load intro paints black before any JS runs.
let state: CurtainState = { lifted: false, generation: 0 };
const listeners = new Set<() => void>();
const SERVER_STATE: CurtainState = { lifted: false, generation: 0 };

function emit() {
  for (const listener of listeners) listener();
}

export function coverCurtain() {
  if (!state.lifted) return;
  state = { ...state, lifted: false };
  emit();
}

export function liftCurtain() {
  if (state.lifted) return;
  state = { lifted: true, generation: state.generation + 1 };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCurtain() {
  return state;
}

export function subscribeCurtain(listener: () => void) {
  return subscribe(listener);
}

export function useCurtain() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_STATE,
  );
}

/** Shared entrance timing, so every reveal in the app moves the same way. */
export const ENTRANCE = {
  /** Soft ease-in-out shared with the curtain itself. */
  ease: "cubic-bezier(0.37, 0, 0.63, 1)",
  fadeMs: 900,
  /** Gap between items in a staggered group (list rows, hero lines). */
  staggerMs: 90,
  /** Most stagger steps any group uses, so long lists don't crawl in. */
  maxStaggerSteps: 8,
  scrambleMs: 550,
} as const;
