import { test, expect } from "@playwright/test";

/** Portfolio home "Find me on" placement and the project Visit link glow. */
for (const [w, h] of [
  [1280, 900],
  [390, 844],
] as const) {
  test(`home ${w}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/");
    const label = page.getByText("Find me on", { exact: true });
    const github = page.getByRole("link", { name: "GitHub" });
    await expect(label).toBeVisible();
    const l = (await label.boundingBox())!;
    const g = (await github.boundingBox())!;
    const row = (await github.locator("xpath=..").boundingBox())!;
    if (w >= 1024) {
      // Left of the buttons, vertically centered with them.
      expect(l.x + l.width).toBeLessThanOrEqual(g.x);
      expect(
        Math.abs(l.y + l.height / 2 - (g.y + g.height / 2)),
      ).toBeLessThanOrEqual(1.5);
    } else {
      // Above the buttons, centered on the same axis.
      expect(l.y + l.height).toBeLessThanOrEqual(g.y);
      const text = await label.evaluate((el) => {
        const r = document.createRange();
        r.selectNodeContents(el);
        const b = r.getBoundingClientRect();
        return b.x + b.width / 2;
      });
      expect(Math.abs(text - (row.x + row.width / 2))).toBeLessThanOrEqual(1.5);
      expect(Math.abs(text - w / 2)).toBeLessThanOrEqual(2);
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
