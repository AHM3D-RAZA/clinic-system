import { randomBytes } from "node:crypto";
import { defineConfig, devices } from "@playwright/test";
import { hashPassword } from "./src/lib/auth/passwordHash";

// Test-only staff login: a fresh random password each run, hashed for the
// app server. Workers inherit E2E_STAFF_PASSWORD from this process.
process.env.E2E_STAFF_PASSWORD ??= randomBytes(12).toString("base64url");
const e2eStaffAccounts = JSON.stringify([
  {
    email: "e2e.staff@clinic.test",
    name: "Esme Tester",
    title: "Front desk",
    passwordHash: hashPassword(process.env.E2E_STAFF_PASSWORD),
  },
]);

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
    env: { AUTH_SECRET: randomBytes(32).toString("base64url"), STAFF_ACCOUNTS: e2eStaffAccounts },
    timeout: 120_000,
  },
});
