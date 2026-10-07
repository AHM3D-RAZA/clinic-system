import { defineConfig, devices } from "@playwright/test";

/**
 * E2E/smoke tests run against a real `next build` + `next start` server
 * (not `next dev`) so they exercise the same server-rendered output a
 * real deployment would — a static/dynamic route mismatch or a
 * server-only bug can hide behind dev mode's extra tolerance.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], launchOptions: { executablePath: "/opt/google/chrome/chrome" } },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"], launchOptions: { executablePath: "/opt/google/chrome/chrome" } },
    },
  ],
  webServer: {
    command: "npm run build && npm run start -- -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
