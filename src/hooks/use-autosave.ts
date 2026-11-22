"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { autosaveDraft } from "~/server/articles";

export type AutosaveValues = {
  title: string;
  content: string;
  imageUrl: string;
  imageKey: string;
};

export type AutosaveStatus =
  | "off" // published article, or auto-save stopped
  | "idle" // nothing to show: no title yet, or "saved" has faded out
  | "typing"
  | "saving"
  | "saved"
  | "error" // transient failure, retrying
  | "signed-out";

const DEBOUNCE_MS = 1500;
const SAVED_VISIBLE_MS = 1500;
const MAX_RETRY_MS = 30_000;

function snapshotOf(values: AutosaveValues) {
  return JSON.stringify([
    values.title.trim(),
    values.content,
    values.imageUrl,
    values.imageKey,
  ]);
}

type UseAutosaveOptions = {
  enabled: boolean;
  initialId?: number;
  initialSlug?: string;
  values: AutosaveValues;
  /** Called after each successful save with the values that were saved. */
  onSaved?: (saved: AutosaveValues) => void;
};

export function useAutosave({
  enabled,
  initialId,
  initialSlug,
  values,
  onSaved,
}: UseAutosaveOptions) {
  const snapshot = snapshotOf(values);

  const [id, setId] = useState(initialId);
  // Drafts' slugs follow the title, so track the latest one (for delete).
  const [slug, setSlug] = useState(initialSlug);
  const [status, setStatus] = useState<AutosaveStatus>(() => {
    return enabled ? "idle" : "off";
  });

  // "saved" fades out after a moment of no activity.
  useEffect(() => {
    if (status !== "saved") return;
    const timer = setTimeout(() => setStatus("idle"), SAVED_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [status]);

  // Refs so timers and the in-flight loop always see the latest state.
  const idRef = useRef(initialId);
  const valuesRef = useRef(values);
  const lastSavedRef = useRef(snapshot);
  const activeRef = useRef(enabled);
  const pausedRef = useRef(false);
  const inFlightRef = useRef<Promise<void> | null>(null);
  const pendingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryDelayRef = useRef(2000);
  const onSavedRef = useRef(onSaved);

  useEffect(() => {
    valuesRef.current = values;
    onSavedRef.current = onSaved;
  });

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const settledStatus = (): AutosaveStatus => {
    if (!valuesRef.current.title.trim()) return "idle";
    return snapshotOf(valuesRef.current) === lastSavedRef.current
      ? "saved"
      : "typing";
  };

  // Named so the retry and the queued follow-up can call it.
  const saveDraft = useCallback(function save(): Promise<void> {
    if (inFlightRef.current) {
      // Save again once the current request finishes.
      pendingRef.current = true;
      return inFlightRef.current;
    }

    const run = async () => {
      const current = valuesRef.current;
      const currentSnapshot = snapshotOf(current);

      if (!activeRef.current || pausedRef.current) return;
      if (!current.title.trim()) {
        setStatus("idle");
        return;
      }
      if (currentSnapshot === lastSavedRef.current) {
        setStatus("saved");
        return;
      }

      setStatus("saving");

      const result = await autosaveDraft({
        id: idRef.current,
        title: current.title,
        content: current.content,
        imageUrl: current.imageUrl || undefined,
        imageKey: current.imageKey || undefined,
      }).catch(() => ({ ok: false, reason: "error" }) as const);

      if (result.ok) {
        idRef.current = result.id;
        setId(result.id);
        setSlug(result.slug);
        lastSavedRef.current = currentSnapshot;
        retryDelayRef.current = 2000;
        onSavedRef.current?.(current);
        if (!pausedRef.current) setStatus(settledStatus());
        return;
      }

      switch (result.reason) {
        case "unauthorized":
          activeRef.current = false;
          setStatus("signed-out");
          return;
        case "error": {
          setStatus("error");
          const delay = retryDelayRef.current;
          retryDelayRef.current = Math.min(delay * 2, MAX_RETRY_MS);
          clearTimer();
          timerRef.current = setTimeout(() => void save(), delay);
          return;
        }
        default:
          // published / not_found / invalid: retrying won't help.
          activeRef.current = false;
          setStatus("off");
      }
    };

    const promise = run().finally(() => {
      inFlightRef.current = null;
      if (pendingRef.current) {
        pendingRef.current = false;
        void save();
      }
    });
    inFlightRef.current = promise;
    return promise;
  }, []);

  // Debounce: every change restarts the 1.5s timer.
  useEffect(() => {
    if (!activeRef.current || pausedRef.current) return;

    if (!valuesRef.current.title.trim()) {
      clearTimer();
      setStatus("idle");
      return;
    }

    // Edited back to what's already saved: nothing to do.
    if (snapshot === lastSavedRef.current) {
      clearTimer();
      setStatus((prev) => (prev === "typing" ? "idle" : prev));
      return;
    }

    setStatus("typing");
    clearTimer();
    timerRef.current = setTimeout(() => void saveDraft(), DEBOUNCE_MS);
  }, [snapshot, saveDraft]);

  useEffect(() => clearTimer, []);

  // Warn before leaving with changes that aren't saved yet.
  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (pausedRef.current) return;
      const dirty =
        snapshotOf(valuesRef.current) !== lastSavedRef.current ||
        inFlightRef.current !== null;
      if (!dirty) return;
      event.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  /**
   * For the manual save: stop auto-saving, wait for any request in flight
   * (so a new draft has its id), and return the id to submit with.
   */
  const pause = useCallback(async () => {
    pausedRef.current = true;
    pendingRef.current = false;
    clearTimer();
    if (inFlightRef.current) await inFlightRef.current;
    return idRef.current;
  }, []);

  /** The manual save failed validation: pick auto-saving back up. */
  const resume = useCallback(() => {
    pausedRef.current = false;
    if (!activeRef.current) return;
    setStatus(settledStatus());
    if (settledStatus() === "typing") {
      clearTimer();
      timerRef.current = setTimeout(() => void saveDraft(), DEBOUNCE_MS);
    }
  }, [saveDraft]);

  return { id, slug, status, pause, resume };
}
