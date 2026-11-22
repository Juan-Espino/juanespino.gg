import { expect, type Page, test } from "@playwright/test";
import {
  markdownFixtures,
  type MarkdownFixtureName,
} from "../src/lib/markdown-fixtures";

/**
 * For each Markdown element the article supports, render the same input as
 * the published article and in the live-preview editor, then check that a
 * piece of text looks the same and sits in the same place in both. Hidden
 * syntax, wrong spacing or a mismatched style all show up as a difference.
 */

type Probe = {
  text: string;
  top: number;
  left: number;
  color: string;
  fontSize: string;
  fontWeight: string;
  fontStyle: string;
  fontFamily: string;
  lineHeight: string;
  decorations: string[];
};

async function openFixture(page: Page, fixture: MarkdownFixtureName, image = false) {
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.goto(
    `/bloggin/dev/markdown-test?fixture=${fixture}${image ? "&image=1" : ""}`,
  );
  await page.waitForSelector("[data-testid=editor] .cm-content");
  // Fonts and images settle layout.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
}

async function probe(
  page: Page,
  section: "published" | "editor",
  text: string,
): Promise<Probe | null> {
  return page.evaluate(
    ({ section, text }) => {
      const root = document.querySelector<HTMLElement>(
        `[data-testid=${section}]`,
      );
      if (!root) return null;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const index = node.textContent?.indexOf(text) ?? -1;
        if (index < 0) continue;

        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + 1);
        const rect = range.getBoundingClientRect();
        const base = root.getBoundingClientRect();
        const el = node.parentElement!;
        const style = getComputedStyle(el);

        // Text decoration is drawn by ancestors, so collect it up the tree.
        const decorations = new Set<string>();
        for (let a: HTMLElement | null = el; a && a !== root; a = a.parentElement) {
          const line = getComputedStyle(a).textDecorationLine;
          if (line && line !== "none") line.split(" ").forEach((d) => decorations.add(d));
        }

        return {
          text,
          top: Math.round(rect.top - base.top),
          left: Math.round(rect.left - base.left),
          color: style.color,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          fontStyle: style.fontStyle,
          fontFamily: style.fontFamily,
          lineHeight: style.lineHeight,
          decorations: [...decorations].sort(),
        };
      }
      return null;
    },
    { section, text },
  );
}

async function expectSame(page: Page, text: string) {
  const published = await probe(page, "published", text);
  const editor = await probe(page, "editor", text);
  expect(published, `"${text}" in published`).not.toBeNull();
  expect(editor, `"${text}" in editor`).not.toBeNull();

  const { top: pt, left: pl, ...pStyle } = published!;
  const { top: et, left: el, ...eStyle } = editor!;
  expect(eStyle, `style of "${text}"`).toEqual(pStyle);
  expect(Math.abs(et - pt), `top of "${text}" (published ${pt}, editor ${et})`).toBeLessThanOrEqual(1);
  expect(Math.abs(el - pl), `left of "${text}" (published ${pl}, editor ${el})`).toBeLessThanOrEqual(1);
}

async function moveCursorAway(page: Page) {
  // Focus the editor with the cursor at the very end.
  await page.locator("[data-testid=editor] .cm-content").click();
  await page.keyboard.press("Control+End");
}

async function blurEditor(page: Page) {
  // An unfocused editor renders everything, like the published page.
  await moveCursorAway(page);
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  await page.waitForTimeout(50);
}

const cases: Record<MarkdownFixtureName, string[]> = {
  paragraph: ["I saw a post", "Second paragraph"],
  h1: ["Heading one", "Text under"],
  h2: ["Heading two", "Text under"],
  h3: ["Heading three", "Text under"],
  h4: ["Heading four", "Text under"],
  h5: ["Heading five", "Text under"],
  h6: ["Heading six", "Text under"],
  bold: ["Some", "bold words", "in a sentence"],
  italic: ["Some", "italic words", "in a sentence"],
  strikethrough: ["Some", "struck words", "in a sentence"],
  inlineCode: ["Run", "pnpm dev", "to start"],
  link: ["Read", "the docs", "first."],
  autolink: ["Visit", "https://example.com", "today."],
  bulletList: ["first item", "second item", "third item"],
  orderedList: ["first item", "second item", "third item"],
  taskList: ["open task", "done task"],
  blockquote: ["A quoted paragraph"],
  codeBlock: ["const answer", "console.log"],
  horizontalRule: ["Above the rule", "Below the rule"],
  table: ["Name", "Score", "Ellie", "Abby"],
  imageLocal: ["Before", "after."],
  imageExternal: ["Before", "after."],
  imageWrap: [
    "you know what",
    "for several lines",
    "then continue",
    "does around",
    "The next paragraph",
  ],
  imageAlternate: ["Block 1 starts", "Block 2 starts", "Block 3 starts", "next block begins"],
  wrap: [
    "Paragraph 1.",
    "Paragraph 2.",
    "Paragraph 3.",
    "Paragraph 6.",
    // Words near line ends, to catch a line breaking one word early.
    "care about",
    "better story",
    "sentence keeps",
  ],
};

test.describe("published vs editor: every Markdown element", () => {
  for (const [fixture, texts] of Object.entries(cases)) {
    test(fixture, async ({ page }) => {
      await openFixture(page, fixture as MarkdownFixtureName);
      await blurEditor(page);
      for (const text of texts) await expectSame(page, text);
    });
  }
});

test.describe("images keep their size and place", () => {
  for (const fixture of ["imageLocal", "imageExternal"] as const) {
    test(fixture, async ({ page }) => {
      await openFixture(page, fixture);
      await blurEditor(page);
      const box = async (section: string) => {
        const img = page.locator(`[data-testid=${section}] img:not(.cm-widgetBuffer)`).first();
        await expect(img).toBeVisible();
        await expect
          .poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0))
          .toBe(true);
        const s = (await page.locator(`[data-testid=${section}]`).boundingBox())!;
        const b = (await img.boundingBox())!;
        return { x: b.x - s.x, y: b.y - s.y, width: b.width, height: b.height };
      };
      const published = await box("published");
      const editor = await box("editor");
      for (const key of ["x", "y", "width", "height"] as const) {
        expect(Math.abs(editor[key] - published[key]), key).toBeLessThanOrEqual(1);
      }
      // Same rendering path: next/image for local/UploadThing, <img> otherwise.
      const src = (section: string) =>
        page.locator(`[data-testid=${section}] img:not(.cm-widgetBuffer)`).first().getAttribute("src");
      expect(await src("editor")).toBe(await src("published"));
    });
  }
});

test.describe("text wraps around the header image like the article", () => {
  test("desktop", async ({ page }) => {
    await openFixture(page, "wrap", true);
    await blurEditor(page);

    const image = async (section: string) => {
      const s = (await page.locator(`[data-testid=${section}]`).boundingBox())!;
      const b = (await page
        .locator(`[data-testid=${section}] [data-testid=header-image]`)
        .boundingBox())!;
      return { x: b.x - s.x, y: b.y - s.y, width: b.width, height: b.height };
    };
    const published = await image("published");
    const editor = await image("editor");
    for (const key of ["x", "y", "width", "height"] as const) {
      expect(Math.abs(editor[key] - published[key]), key).toBeLessThanOrEqual(1);
    }

    // Every rendered text line in the editor either sits beside the image
    // (ending before it) or below it.
    const lines = await page.evaluate((imageLeft) => {
      const root = document.querySelector("[data-testid=editor]")!;
      const base = root.getBoundingClientRect();
      const out: { top: number; right: number }[] = [];
      for (const line of root.querySelectorAll(".cm-line")) {
        const range = document.createRange();
        range.selectNodeContents(line);
        for (const r of range.getClientRects()) {
          if (r.width > 0) out.push({ top: r.top - base.top, right: r.right - base.left });
        }
      }
      return { out, imageLeft };
    }, editor.x);
    const imageBottom = editor.y + editor.height;
    const beside = lines.out.filter((l) => l.top < imageBottom);
    const below = lines.out.filter((l) => l.top >= imageBottom);
    expect(beside.length).toBeGreaterThan(3);
    expect(below.length).toBeGreaterThan(3);
    for (const l of beside) expect(l.right).toBeLessThanOrEqual(lines.imageLeft);
    expect(Math.max(...below.map((l) => l.right))).toBeGreaterThan(lines.imageLeft);

    // And the words land on the same lines as the published page.
    for (const text of cases.wrap) await expectSame(page, text);
  });
});

test.describe("text wraps around embedded images on desktop", () => {
  test("imageWrap", async ({ page }) => {
    await openFixture(page, "imageWrap");
    await blurEditor(page);
    for (const section of ["published", "editor"]) {
      const img = page.locator(`[data-testid=${section}] img:not(.cm-widgetBuffer)`).first();
      await expect
        .poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0))
        .toBe(true);
      const box = (await img.boundingBox())!;
      // First words sit to the right of the image, on its first line.
      const first = await probe(page, section as "published" | "editor", "you know what");
      const base = (await page.locator(`[data-testid=${section}]`).boundingBox())!;
      expect(first!.left, `${section}: text beside image`).toBeGreaterThanOrEqual(
        Math.round(box.x + box.width - base.x),
      );
      expect(first!.top).toBeLessThan(box.y + box.height - base.y);
    }
    // And the editor wraps exactly like the published page.
    for (const text of cases.imageWrap) await expectSame(page, text);
  });

  test("mobile: full width, on its own line", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/bloggin/dev/markdown-test?fixture=imageWrap");
    await page.waitForSelector("[data-testid=editor] .cm-content");
    await page.evaluate(() => document.fonts.ready);
    await blurEditor(page);

    const measure = async (section: "published" | "editor") => {
      const img = page.locator(`[data-testid=${section}] img:not(.cm-widgetBuffer)`).first();
      await expect
        .poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0))
        .toBe(true);
      const base = (await page.locator(`[data-testid=${section}]`).boundingBox())!;
      const b = (await img.boundingBox())!;
      return {
        img: { x: b.x - base.x, y: b.y - base.y, width: b.width, height: b.height },
        sectionWidth: base.width,
        text: (await probe(page, section, "you know what"))!,
      };
    };

    const published = await measure("published");
    const editor = await measure("editor");
    for (const m of [published, editor]) {
      // Spans the column, keeps the 3:2 shape, and the text starts below it.
      expect(Math.abs(m.img.width - m.sectionWidth)).toBeLessThanOrEqual(1);
      expect(Math.abs(m.img.width / m.img.height - 1.5)).toBeLessThan(0.02);
      expect(m.text.top).toBeGreaterThanOrEqual(Math.round(m.img.y + m.img.height));
      expect(m.text.left).toBeLessThanOrEqual(1);
    }
    // Editor matches the published page.
    for (const key of ["x", "y", "width", "height"] as const) {
      expect(Math.abs(editor.img[key] - published.img[key]), key).toBeLessThanOrEqual(1);
    }
    for (const text of cases.imageWrap) await expectSame(page, text);
  });
});

test.describe("embedded images alternate sides", () => {
  test("desktop: left, right, left — same in the editor", async ({ page }) => {
    await openFixture(page, "imageAlternate");
    await blurEditor(page);
    for (const section of ["published", "editor"] as const) {
      const imgs = page.locator(`[data-testid=${section}] img:not(.cm-widgetBuffer)`);
      await expect(imgs).toHaveCount(3);
      const base = (await page.locator(`[data-testid=${section}]`).boundingBox())!;
      const sides: string[] = [];
      const boxes: { top: number; bottom: number }[] = [];
      for (let i = 0; i < 3; i++) {
        const img = imgs.nth(i);
        await expect
          .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0))
          .toBe(true);
        const b = (await img.boundingBox())!;
        const left = b.x - base.x;
        const right = base.x + base.width - (b.x + b.width);
        sides.push(left <= 1 ? "left" : right <= 1 ? "right" : "middle");
        boxes.push({ top: b.y, bottom: b.y + b.height });
      }
      expect(sides, section).toEqual(["left", "right", "left"]);
      // Each image starts below the previous one: no text squeezed
      // between two images.
      for (let i = 1; i < 3; i++) {
        expect(boxes[i]!.top, `${section} image ${i + 1} below image ${i}`).toBeGreaterThanOrEqual(
          boxes[i - 1]!.bottom,
        );
      }
      // And each block's text starts beside its own image.
      for (let i = 0; i < 3; i++) {
        const text = (await probe(page, section, `Block ${i + 1} starts`))!;
        const top = text.top + base.y;
        expect(top, `${section} block ${i + 1}`).toBeGreaterThanOrEqual(boxes[i]!.top - 1);
        expect(top).toBeLessThan(boxes[i]!.bottom);
      }
    }
    // Text wraps on the matching side, word for word.
    for (const text of cases.imageAlternate) await expectSame(page, text);
  });

  test("phones: every image full width", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/bloggin/dev/markdown-test?fixture=imageAlternate");
    await page.waitForSelector("[data-testid=editor] .cm-content");
    await blurEditor(page);
    for (const section of ["published", "editor"]) {
      const base = (await page.locator(`[data-testid=${section}]`).boundingBox())!;
      const imgs = page.locator(`[data-testid=${section}] img:not(.cm-widgetBuffer)`);
      for (let i = 0; i < 3; i++) {
        const b = (await imgs.nth(i).boundingBox())!;
        expect(Math.abs(b.width - base.width), `${section} image ${i + 1}`).toBeLessThanOrEqual(1);
      }
    }
  });
});

test.describe("live preview reveals syntax only where the cursor is", () => {
  const reveal: [MarkdownFixtureName, string, string][] = [
    ["bold", "bold words", "**bold words**"],
    ["italic", "italic words", "*italic words*"],
    ["strikethrough", "struck words", "~~struck words~~"],
    ["inlineCode", "pnpm dev", "`pnpm dev`"],
    ["link", "the docs", "[the docs](https://example.com)"],
    ["h2", "Heading two", "## Heading two"],
    ["bulletList", "second item", "- second item"],
    ["blockquote", "A quoted", "> A quoted paragraph."],
  ];

  for (const [fixture, clickText, raw] of reveal) {
    test(fixture, async ({ page }) => {
      await openFixture(page, fixture);
      const content = page.locator("[data-testid=editor] .cm-content");
      await moveCursorAway(page);
      // Text far from the element shouldn't show its syntax.
      if (fixture !== "bulletList" && fixture !== "h2") {
        await page.keyboard.press("Control+End");
        await page.keyboard.press("End");
      }
      await page.locator("[data-testid=editor]").getByText(clickText).first().click();
      await expect(content).toContainText(raw);
      await page.keyboard.press("Control+End");
      if (fixture === "h2" || fixture === "bulletList") {
        await expect(content).not.toContainText(raw);
      }
    });
  }

  test("syntax is hidden when the cursor is elsewhere", async ({ page }) => {
    await openFixture(page, "bold");
    await moveCursorAway(page);
    // Cursor at the end of the same line still counts as outside the bold run.
    await page.keyboard.press("End");
    await expect(page.locator("[data-testid=editor] .cm-content")).not.toContainText("**");
  });
});

test.describe("the editor value is exactly the Markdown", () => {
  for (const fixture of Object.keys(markdownFixtures) as MarkdownFixtureName[]) {
    test(fixture, async ({ page }) => {
      await openFixture(page, fixture);
      await moveCursorAway(page);
      await page.keyboard.type(" x");
      await expect(page.getByTestId("editor-value")).toHaveText(
        markdownFixtures[fixture] + " x",
        { useInnerText: false },
      );
      await page.keyboard.press("Backspace");
      await page.keyboard.press("Backspace");
      await expect(page.getByTestId("editor-value")).toHaveText(
        markdownFixtures[fixture],
        { useInnerText: false },
      );
    });
  }
});
