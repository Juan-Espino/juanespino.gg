import { defineConfig, devices } from "@playwright/test";

// Runs against the dev server: the markdown and editor test pages under
// /bloggin/dev are dev-only. Reuses a server that's already running.
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL,
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: `pnpm dev --port ${new URL(baseURL).port || 3000}`,
    url: `${baseURL}/bloggin`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
