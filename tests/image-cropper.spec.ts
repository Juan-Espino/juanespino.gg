import { expect, type Page, test } from "@playwright/test";

/**
 * Header images always end up 3:2. Images that already fit go straight
 * through; anything else opens the cropper with a ready, centered crop.
 */

type Result = {
  name: string;
  type: string;
  size: number;
  width: number;
  height: number;
  left: [number, number, number];
  right: [number, number, number];
};

/** Drops a generated image into the drop zone: left half red, right blue. */
async function addImage(
  page: Page,
  width: number,
  height: number,
  how: "pick" | "paste" | "drop" = "pick",
) {
  await page.evaluate(
    async ({ width, height, how }) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "rgb(255,0,0)";
      ctx.fillRect(0, 0, width / 2, height);
      ctx.fillStyle = "rgb(0,0,255)";
      ctx.fillRect(width / 2, 0, width / 2, height);
      const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), "image/png"));
      const file = new File([blob], "photo.png", { type: "image/png" });
      const dt = new DataTransfer();
      dt.items.add(file);

      const zone = document.querySelector<HTMLButtonElement>("button[aria-label='add an image']")!;
      if (how === "pick") {
        const input = zone.querySelector("input")!;
        input.files = dt.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      } else if (how === "paste") {
        zone.focus();
        zone.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true }));
      } else {
        zone.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true }));
      }
    },
    { width, height, how },
  );
}

async function result(page: Page): Promise<Result | "cancelled"> {
  const el = page.getByTestId("result");
  await expect(el).not.toBeEmpty();
  return JSON.parse((await el.textContent())!) as Result | "cancelled";
}

const dialog = (page: Page) => page.getByRole("dialog", { name: "crop image" });

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/bloggin/dev/crop-test");
  await page.waitForSelector("button[aria-label='add an image']");
});

test("an image that's already 3:2 skips the cropper and is unchanged", async ({ page }) => {
  await addImage(page, 1200, 800);
  const r = await result(page);
  await expect(dialog(page)).toBeHidden();
  expect(r).toMatchObject({ name: "photo.png", width: 1200, height: 800 });
});

test("a wide image opens the cropper with a ready 3:2 crop", async ({ page }) => {
  await addImage(page, 2000, 800);
  await expect(dialog(page)).toBeVisible();

  // The crop frame has the container's exact shape.
  const frame = (await page.locator(".reactEasyCrop_CropArea").boundingBox())!;
  expect(Math.abs(frame.width / frame.height - 1.5)).toBeLessThan(0.01);

  // Accept the preset crop straight away.
  await page.getByRole("button", { name: "use image" }).click();
  const r = await result(page);
  await expect(dialog(page)).toBeHidden();
  if (r === "cancelled") throw new Error("expected a crop");
  expect(r.width / r.height).toBeCloseTo(1.5, 2);
  expect(r.height).toBe(800); // full height kept, sides trimmed
  // Centered: red on the left, blue on the right.
  expect(r.left[0]).toBeGreaterThan(200);
  expect(r.right[2]).toBeGreaterThan(200);
});

test("dragging the image changes what's kept", async ({ page }) => {
  // 3000 wide: the 1200px crop pushed fully left is all red.
  await addImage(page, 3000, 800);
  await expect(dialog(page)).toBeVisible();
  const frame = (await page.locator(".reactEasyCrop_CropArea").boundingBox())!;
  const cx = frame.x + frame.width / 2;
  const cy = frame.y + frame.height / 2;
  // Drag right as far as it goes: the crop shows the left (red) side.
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + frame.width, cy, { steps: 10 });
  await page.mouse.up();
  await page.getByRole("button", { name: "use image" }).click();
  const r = await result(page);
  if (r === "cancelled") throw new Error("expected a crop");
  expect(r.left[0]).toBeGreaterThan(200);
  expect(r.right[0]).toBeGreaterThan(200); // still red: blue side cropped off
});

test("zooming in crops tighter", async ({ page }) => {
  await addImage(page, 1200, 1200); // tall-ish: square
  await expect(dialog(page)).toBeVisible();
  await page.getByLabel("zoom").fill("2");
  await page.getByRole("button", { name: "use image" }).click();
  const r = await result(page);
  if (r === "cancelled") throw new Error("expected a crop");
  expect(r.width / r.height).toBeCloseTo(1.5, 2);
  // At 2x the frame covers half the width: 600 source pixels.
  expect(r.width).toBeLessThanOrEqual(601);
});

test("Enter confirms, Escape and cancel upload nothing", async ({ page }) => {
  await addImage(page, 2000, 800);
  await expect(dialog(page)).toBeVisible();
  await page.keyboard.press("Enter");
  expect(await result(page)).not.toBe("cancelled");

  await addImage(page, 2000, 800);
  await expect(dialog(page)).toBeVisible();
  await page.keyboard.press("Escape");
  expect(await result(page)).toBe("cancelled");
  await expect(dialog(page)).toBeHidden();

  await addImage(page, 2000, 800);
  await page.getByRole("button", { name: "cancel" }).click();
  expect(await result(page)).toBe("cancelled");
});

test("paste and drop open the cropper too", async ({ page }) => {
  await addImage(page, 900, 900, "paste");
  await expect(dialog(page)).toBeVisible();
  await page.getByRole("button", { name: "cancel" }).click();
  await expect(dialog(page)).toBeHidden();

  await addImage(page, 900, 900, "drop");
  await expect(dialog(page)).toBeVisible();
});

test("huge images are scaled down to 2400px wide", async ({ page }) => {
  await addImage(page, 5000, 2000);
  await expect(dialog(page)).toBeVisible();
  await page.getByRole("button", { name: "use image" }).click();
  const r = await result(page);
  if (r === "cancelled") throw new Error("expected a crop");
  expect(r).toMatchObject({ width: 2400, height: 1600 });
});

test("works on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await addImage(page, 2000, 800);
  await expect(dialog(page)).toBeVisible();
  const box = (await dialog(page).boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(390);
  await page.getByRole("button", { name: "use image" }).click();
  const r = await result(page);
  if (r === "cancelled") throw new Error("expected a crop");
  expect(r.width / r.height).toBeCloseTo(1.5, 2);
});
