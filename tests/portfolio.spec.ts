import { test, expect } from "@playwright/test";

/**
 * Portfolio home social links (one row, a vertical rule between each, no
 * "Find me on" label) and the project Visit link glow.
 */
for (const [w, h] of [
  [1280, 900],
  [390, 844],
] as const) {
  test(`home ${w}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/");
    await expect(page.getByText("Find me on", { exact: true })).toHaveCount(0);
    const github = page.getByRole("link", { name: "GitHub" });
    // Wait for the entrance fade to finish before measuring.
    await expect(github).toBeVisible();
    await page.waitForTimeout(2500);

    // Row children in DOM order: link, rule, link, rule, link, rule, email.
    const items = await github.locator("xpath=..").evaluate((row) =>
      Array.from(row.children, (el) => {
        const r = el.getBoundingClientRect();
        return {
          rule: el.getAttribute("aria-hidden") === "true",
          left: r.left,
          right: r.right,
          mid: r.top + r.height / 2,
        };
      }),
    );
    expect(items.map((item) => item.rule)).toEqual([
      false,
      true,
      false,
      true,
      false,
      true,
      false,
    ]);
    for (let i = 1; i < items.length; i++) {
      // Left to right on one line, all vertically centered together.
      expect(items[i]!.left).toBeGreaterThanOrEqual(items[i - 1]!.right);
      expect(Math.abs(items[i]!.mid - items[0]!.mid)).toBeLessThanOrEqual(1.5);
    }

    const rowCenter = (items[0]!.left + items.at(-1)!.right) / 2;
    if (w >= 1024) {
      // Left-aligned with the hero copy.
      const heading = (await page
        .getByRole("heading", { level: 1 })
        .boundingBox())!;
      expect(Math.abs(items[0]!.left - heading.x)).toBeLessThanOrEqual(16);
    } else {
      // Centered on the page.
      expect(Math.abs(rowCenter - w / 2)).toBeLessThanOrEqual(2);
    }
  });
}
test("visit glow", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/projects");
  await page.waitForTimeout(800);
  await page
    .getByRole("button", { name: /^Show / })
    .nth(1)
    .click();
  await page.waitForTimeout(1200);
  const link = page.getByRole("link", { name: /^Visit / }).nth(1);
  const l = (await link.boundingBox())!;
  await page.mouse.move(l.x + l.width / 2, l.y + l.height / 2);
  await page.waitForTimeout(600);
  const s = await link.evaluate((el) => [
    getComputedStyle(el).textShadow,
    getComputedStyle(el).backgroundColor,
    getComputedStyle(el.querySelector("svg")!).filter,
  ]);
  expect(s[0]).not.toBe("none");
  expect(s[1]).toBe("rgba(0, 0, 0, 0)");
});
