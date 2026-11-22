import { expect, type Page, test } from "@playwright/test";

/**
 * The real editor against the real published article view for the same
 * sample article (dev-only page, no login needed). Positions are measured
 * from the title so the editor's action bar doesn't count.
 */

type Box = { x: number; y: number; width: number; height: number };

async function open(page: Page, view: "published" | "editor", width: number) {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto(`/bloggin/dev/editor-test?view=${view}`);
  await page.evaluate(() => document.fonts.ready);
  // Wait for visible images to finish loading (layout depends on them).
  await expect
    .poll(() =>
      page.evaluate(() =>
        [...document.images]
          .filter((img) => img.getClientRects().length)
          .every((img) => img.complete),
      ),
    )
    .toBe(true);
  // Let the published line-reveal animation finish.
  if (view === "published") await page.waitForTimeout(2500);
  if (view === "editor") {
    await page.waitForSelector(".cm-content");
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  }
}

async function box(page: Page, selector: string): Promise<Box> {
  const b = await page.locator(selector).first().boundingBox();
  expect(b, selector).not.toBeNull();
  return b!;
}

async function textBox(page: Page, root: string, text: string): Promise<Box> {
  const b = await page.evaluate(
    ({ root, text }) => {
      const scope = document.querySelector(root)!;
      const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const i = n.textContent?.indexOf(text) ?? -1;
        if (i < 0) continue;
        const el = n.parentElement!;
        if (!el.getClientRects().length) continue; // hidden (other layout)
        const range = document.createRange();
        range.setStart(n, i);
        range.setEnd(n, i + 1);
        const r = range.getBoundingClientRect();
        if (r.width === 0) continue;
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      }
      return null;
    },
    { root, text },
  );
  expect(b, `"${text}" in ${root}`).not.toBeNull();
  return b!;
}

function rel(b: Box, origin: Box) {
  return { x: Math.round(b.x - origin.x), y: Math.round(b.y - origin.y) };
}

function expectClose(a: { x: number; y: number }, b: { x: number; y: number }, what: string) {
  expect(Math.abs(a.x - b.x), `${what} x (published ${b.x}, editor ${a.x})`).toBeLessThanOrEqual(1);
  expect(Math.abs(a.y - b.y), `${what} y (published ${b.y}, editor ${a.y})`).toBeLessThanOrEqual(1);
}

test.describe("desktop editor matches the published article", () => {
  test("header, image and wrapped text line up", async ({ page }) => {
    await open(page, "published", 1280);
    const pTitle = await box(page, "article header h2");
    const pDate = await textBox(page, "article header", "July 4, 2026");
    const pImage = await box(page, "article img");
    const pText = await Promise.all(
      ["Paragraph 1.", "Paragraph 2.", "Paragraph 3."].map((t) =>
        textBox(page, "article", t),
      ),
    );
    const pTitleStyle = await page
      .locator("article header h2")
      .first()
      .evaluate((el) => {
        const s = getComputedStyle(el);
        return [s.fontSize, s.fontWeight, s.fontStyle, s.lineHeight];
      });

    await open(page, "editor", 1280);
    const title = page.locator("header input[aria-label=title]");
    const eTitle = await box(page, "header input[aria-label=title]");
    const eDate = await textBox(page, "form header", "July 4, 2026");
    const eImage = await box(page, ".cm-float-host img");
    const eText = await Promise.all(
      ["Paragraph 1.", "Paragraph 2.", "Paragraph 3."].map((t) =>
        textBox(page, ".cm-content", t),
      ),
    );
    const eTitleStyle = await title.evaluate((el) => {
      const s = getComputedStyle(el);
      return [s.fontSize, s.fontWeight, s.fontStyle, s.lineHeight];
    });

    expect(eTitleStyle).toEqual(pTitleStyle);
    expect(Math.abs(eTitle.height - pTitle.height), "title height").toBeLessThanOrEqual(1);
    expectClose(rel(eDate, eTitle), rel(pDate, pTitle), "date");
    expectClose(rel(eImage, eTitle), rel(pImage, pTitle), "header image");
    expect(Math.abs(eImage.width - pImage.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(eImage.height - pImage.height)).toBeLessThanOrEqual(1);
    pText.forEach((p, i) => expectClose(rel(eText[i]!, eTitle), rel(p, pTitle), `paragraph ${i + 1}`));
  });

  test("action bar: label, switch, submit and delete", async ({ page }) => {
    await open(page, "editor", 1280);
    await expect(page.getByText("editing article")).toBeVisible();
    // Sample article is published: on = update, off = unpublish.
    const submit = page.locator("form button[type=submit]").first();
    await expect(submit).toHaveAccessibleName("update");
    await page.getByRole("switch").click();
    await expect(submit).toHaveAccessibleName("unpublish");
    // The visible label settles on the new text after the turnstile swap.
    await expect(submit.locator(".text-center")).toHaveText("unpublish");
    // Width stays put across labels (sized to the longest one).
    const before = (await submit.boundingBox())!.width;
    await page.getByRole("switch").click();
    await expect(submit.locator(".text-center")).toHaveText("update");
    expect((await submit.boundingBox())!.width).toBeCloseTo(before, 0);
    await expect(page.getByRole("button", { name: "delete article" })).toBeVisible();

    // Bar stays on screen while scrolling a long article.
    await page.mouse.wheel(0, 800);
    await expect(submit).toBeInViewport();
  });

  test("change image appears on hover", async ({ page }) => {
    await open(page, "editor", 1280);
    const button = page.locator(".cm-float-host").getByRole("button", { name: "change image" });
    await expect(button).toHaveCSS("opacity", "0");
    await page.locator(".cm-float-host img").hover();
    await expect(button).toHaveCSS("opacity", "1");
  });

  test("typing in the text still works next to the image", async ({ page }) => {
    await open(page, "editor", 1280);
    await page.locator(".cm-content").getByText("Paragraph 1.").click();
    await page.keyboard.press("Control+Home");
    await page.keyboard.type("Edited. ");
    await expect(page.locator(".cm-content")).toContainText("Edited. Paragraph 1.");
    await expect(page.locator("input[name=content]")).toHaveValue(/^Edited\. Paragraph 1\./);
  });
});

test.describe("tablets get the desktop layout", () => {
  for (const view of ["published", "editor"] as const) {
    test(view, async ({ page }) => {
      await open(page, view, 820);
      if (view === "published") {
        await expect(page.locator("article header h2")).toBeVisible();
        await expect(page.locator("section .md\\:hidden")).toBeHidden();
      } else {
        await expect(page.locator("header input[aria-label=title]")).toBeVisible();
        await expect(page.locator("form > .aspect-3\\/2")).toBeHidden();
        // The host is zero-height by design; check the floated image.
        await expect(page.locator(".cm-float-host img")).toBeVisible();
      }
    });
  }
});

test.describe("mobile editor matches the published mobile article", () => {
  test("hero, title, date and text line up", async ({ page }) => {
    await open(page, "published", 390);
    const pHero = await box(page, "section .md\\:hidden .aspect-3\\/2");
    const pTitle = await box(page, "section .md\\:hidden h2");
    const pTitleStyle = await page
      .locator("section .md\\:hidden h2")
      .evaluate((el) => {
        const s = getComputedStyle(el);
        return [s.fontSize, s.fontWeight, s.fontStyle, s.textAlign];
      });
    const pDate = await textBox(page, "section", "July 4, 2026");
    const pText = await textBox(page, "section", "Paragraph 1.");

    await open(page, "editor", 390);
    const eHero = await box(page, "form > .aspect-3\\/2");
    const eTitleEl = page.locator("form > .aspect-3\\/2 textarea[aria-label=title]");
    const eTitleStyle = await eTitleEl.evaluate((el) => {
      const s = getComputedStyle(el);
      return [s.fontSize, s.fontWeight, s.fontStyle, s.textAlign];
    });
    const eDate = await textBox(page, "form > .aspect-3\\/2", "July 4, 2026");
    const eText = await textBox(page, ".cm-content", "Paragraph 1.");

    expect(eTitleStyle).toEqual(pTitleStyle);
    expect(Math.abs(eHero.width - pHero.width), "hero width").toBeLessThanOrEqual(1);
    expect(Math.abs(eHero.height - pHero.height), "hero height").toBeLessThanOrEqual(1);
    // Date badge centered the same way in the hero.
    expect(Math.abs(eDate.x - eHero.x - (pDate.x - pHero.x))).toBeLessThanOrEqual(1);
    // Text starts at the same inset under the hero.
    expect(Math.abs(eText.x - pText.x), "text x").toBeLessThanOrEqual(1);
    expect(Math.abs(eText.y - (eHero.y + eHero.height) - (pText.y - (pHero.y + pHero.height))), "text y").toBeLessThanOrEqual(1);
    // The desktop float image isn't shown on mobile, so text isn't squeezed.
    await expect(page.locator(".cm-float-host")).toBeHidden();
    expect(pTitle.width).toBeGreaterThan(0);
  });

  test("the whole title is visible", async ({ page }) => {
    await open(page, "editor", 390);
    const title = page.locator("form > .aspect-3\\/2 textarea[aria-label=title]");
    const fits = () =>
      title.evaluate((el: HTMLTextAreaElement) => el.scrollHeight <= el.clientHeight + 1);
    expect(await fits()).toBe(true);
    await title.click();
    await page.keyboard.press("End");
    await page.keyboard.type(" And Its Ending Too");
    expect(await fits()).toBe(true);
  });

  test("no horizontal scrolling", async ({ page }) => {
    await open(page, "editor", 390);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
