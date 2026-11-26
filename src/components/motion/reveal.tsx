"use client";

import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  useEffect,
  useRef,
  useState,
} from "react";
import { ENTRANCE, getCurtain, subscribeCurtain } from "~/lib/curtain";

type RevealProps<T extends ElementType> = {
  as?: T;
  /** Position in a staggered group; each step waits ENTRANCE.staggerMs. */
  index?: number;
  /** Extra delay in ms on top of the stagger. */
  delay?: number;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/**
 * The app's one entrance: content sits in place and fades up once the
 * page-transition curtain starts lifting and the element is on screen.
 * No sliding. Styles live in globals.css (`.reveal`).
 */
export default function Reveal<T extends ElementType = "div">({
  as,
  index = 0,
  delay = 0,
  className,
  style,
  ...rest
}: RevealProps<T>) {
  const Tag: ElementType = as ?? "div";
  const ref = useRef<HTMLElement>(null);
  // Once shown, stay shown, even if the curtain covers again on the way out.
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || shown) return;
    let visible = false;
    const tryShow = () => {
      if (visible && getCurtain().lifted) setShown(true);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = !!entry?.isIntersecting;
        tryShow();
      },
      // No negative margin: content that ends at the bottom of a page that
      // cannot scroll further would otherwise never count as visible.
      { threshold: 0 },
    );
    observer.observe(element);
    const unsubscribe = subscribeCurtain(tryShow);
    return () => {
      observer.disconnect();
      unsubscribe();
    };
  }, [shown]);

  const steps = Math.min(index, ENTRANCE.maxStaggerSteps);
  const revealStyle = {
    ...(style as CSSProperties | undefined),
    "--reveal-delay": `${delay + steps * ENTRANCE.staggerMs}ms`,
  } as CSSProperties;

  return (
    <Tag
      ref={ref}
      data-reveal={shown ? "shown" : "hidden"}
      className={className ? `reveal ${className as string}` : "reveal"}
      style={revealStyle}
      {...rest}
    />
  );
}
