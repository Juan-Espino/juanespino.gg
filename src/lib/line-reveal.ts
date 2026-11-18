const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const BASE_REVEAL_DURATION = 250;
const ADDITIONAL_LINE_DURATION = 60;

type Line = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  characterStops: number[];
};

function getLines(block: HTMLElement): Line[] {
  const bounds = block.getBoundingClientRect();
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  const fragments: DOMRect[] = [];
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const text = node.textContent ?? "";
    if (!text.trim()) continue;
    // Measure whole graphemes so emoji and combining accents appear together.
    for (const { segment, index } of segmenter.segment(text)) {
      range.setStart(node, index);
      range.setEnd(node, index + segment.length);
      fragments.push(...range.getClientRects());
    }
  }

  // Keep inline Markdown images visible inside the same clipping region.
  fragments.push(
    ...Array.from(block.querySelectorAll("img"), (image) =>
      image.getBoundingClientRect(),
    ),
  );
  fragments.sort((a, b) => a.top - b.top || a.left - b.left);
  const lines: Line[] = [];

  for (const fragment of fragments) {
    if (!fragment.width || !fragment.height) continue;
    const next = {
      left: fragment.left - bounds.left,
      top: fragment.top - bounds.top,
      right: fragment.right - bounds.left,
      bottom: fragment.bottom - bounds.top,
      characterStops: [fragment.right - bounds.left],
    };
    const previous = lines.at(-1);
    // Bold text and links may have different bounds but share a visual line.
    if (previous && next.top < previous.bottom - 2) {
      previous.left = Math.min(previous.left, next.left);
      previous.top = Math.min(previous.top, next.top);
      previous.right = Math.max(previous.right, next.right);
      previous.bottom = Math.max(previous.bottom, next.bottom);
      previous.characterStops.push(...next.characterStops);
    } else {
      lines.push(next);
    }
  }

  for (const line of lines) {
    line.characterStops = [...new Set(line.characterStops)].sort(
      (a, b) => a - b,
    );
  }

  return lines;
}

/** Type along the browser's wrapped lines without rebuilding the text DOM. */
export function revealLines(container: HTMLElement, onComplete?: () => void) {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (preference.matches) return () => undefined;

  const svg = document.createElementNS(SVG_NAMESPACE, "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.style.position = "absolute";
  svg.style.pointerEvents = "none";
  const defs = document.createElementNS(SVG_NAMESPACE, "defs");
  svg.append(defs);

  const animations: Animation[] = [];
  const clippedBlocks = new Map<HTMLElement, string>();
  let started = false;
  let finished = false;
  let initialWidth = 0;
  let initialHeight = 0;
  let elapsedTime = 0;
  let totalDuration = 0;
  let previewDuration = Infinity;
  let frameId = 0;
  let previousFrame: number | undefined;

  function tick(now: number) {
    const expanded = !container.hasAttribute("data-reveal-height");
    const limit = expanded ? totalDuration : previewDuration;
    if (previousFrame !== undefined)
      elapsedTime = Math.max(
        elapsedTime,
        Math.min(limit, elapsedTime + now - previousFrame),
      );
    previousFrame = now;
    for (const animation of animations) animation.currentTime = elapsedTime;
    if (elapsedTime >= totalDuration) {
      finish();
      return;
    }
    if (elapsedTime < limit) frameId = requestAnimationFrame(tick);
    else previousFrame = undefined;
  }

  function resume() {
    if (!started || finished) return;
    cancelAnimationFrame(frameId);
    previousFrame = undefined;
    frameId = requestAnimationFrame(tick);
  }
  const expansionObserver = new MutationObserver(resume);
  expansionObserver.observe(container, {
    attributes: true,
    attributeFilter: ["data-reveal-height"],
  });

  function clear() {
    for (const [block, previousClip] of clippedBlocks) {
      block.style.clipPath = previousClip;
    }
    cancelAnimationFrame(frameId);
    for (const animation of animations) animation.cancel();
    animations.length = 0;
    clippedBlocks.clear();
    defs.replaceChildren();
    svg.remove();
  }

  function finish() {
    if (finished) return;
    finished = true;
    clear();
    observer.disconnect();
    expansionObserver.disconnect();
    onComplete?.();
  }

  function start() {
    // The desktop article is CSS-hidden on mobile; wait until it has a layout.
    if (started || finished || !container.clientWidth) return;
    started = true;
    initialWidth = container.clientWidth;
    initialHeight = container.clientHeight;
    container.append(svg);
    const blocks = Array.from(
      container.querySelectorAll<HTMLElement>("p, h1, h2, h3, h4, h5, h6, li"),
    )
      // Nested lists/paragraphs own their clips, avoiding double animation.
      .filter((block) => !block.querySelector("p, li"))
      .map((block) => ({ block, lines: getLines(block) }));
    const lines = blocks.flatMap(({ lines }) => lines);
    const characterCount = lines.reduce(
      (count, line) => count + line.characterStops.length,
      0,
    );
    // Preserve the previous overall pace, distributing it across characters
    // rather than overlapping whole lines. Long articles don't type slowly.
    const characterDuration = characterCount
      ? (BASE_REVEAL_DURATION +
          Math.max(0, lines.length - 1) * ADDITIONAL_LINE_DURATION) /
        characterCount
      : 0;
    let elapsed = 0;
    previewDuration = Infinity;
    const containerTop = container.getBoundingClientRect().top;
    const collapseHeight = Number(container.dataset.collapseHeight ?? Infinity);
    const cutoff =
      Math.max(
        container.scrollHeight,
        container.parentElement?.scrollHeight ?? 0,
      ) > collapseHeight
        ? Number(container.dataset.revealHeight ?? collapseHeight)
        : Infinity;

    for (const { block, lines } of blocks) {
      if (!lines.length) continue;
      const clip = document.createElementNS(SVG_NAMESPACE, "clipPath");
      clip.id = `article-line-${crypto.randomUUID()}`;
      clip.setAttribute("clipPathUnits", "userSpaceOnUse");
      defs.append(clip);
      clippedBlocks.set(block, block.style.clipPath);
      block.style.clipPath = `url(#${clip.id})`;

      for (const line of lines) {
        const rect = document.createElementNS(SVG_NAMESPACE, "rect");
        rect.setAttribute("width", String(line.right - line.left + 2));
        rect.setAttribute("height", String(line.bottom - line.top + 2));
        clip.append(rect);
        const position = `translate(${line.left - 1}px, ${line.top - 1}px)`;
        const duration = line.characterStops.length * characterDuration;
        if (
          block.getBoundingClientRect().top - containerTop + line.top >=
          cutoff
        ) {
          previewDuration = Math.min(previewDuration, elapsed);
        }
        const keyframes: Keyframe[] = [
          { transform: `${position} scaleX(0)`, offset: 0 },
          ...line.characterStops.map((right, index) => ({
            transform: `${position} scaleX(${(right - line.left + 2) / (line.right - line.left + 2)})`,
            offset: (index + 1) / line.characterStops.length,
          })),
        ];
        animations.push(
          rect.animate(
            keyframes.map((frame) => ({ ...frame, easing: "steps(1, end)" })),
            {
              duration,
              delay: elapsed,
              fill: "both",
            },
          ),
        );
        animations.at(-1)!.pause();
        animations.at(-1)!.currentTime = elapsedTime;
        elapsed += duration;
      }
    }

    totalDuration = elapsed;
    resume();
  }

  const observer = new ResizeObserver(() => {
    if (!started) {
      start();
    } else if (
      container.clientWidth !== initialWidth ||
      container.clientHeight !== initialHeight
    ) {
      // Re-measure wrapping without revealing the still-collapsed section.
      clear();
      started = false;
      start();
    }
  });
  observer.observe(container);
  preference.addEventListener("change", finish);
  start();

  return () => {
    finished = true;
    observer.disconnect();
    expansionObserver.disconnect();
    preference.removeEventListener("change", finish);
    clear();
  };
}
