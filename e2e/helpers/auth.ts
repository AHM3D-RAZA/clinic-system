import { expect, type Page } from "@playwright/test";

/**
 * Test-only staff login. playwright.config.ts generates a random password
 * per run and hands the matching hash to the app server, so no password
 * lives in source. Both values reach the workers through the environment.
 */
export const E2E_STAFF_EMAIL = "e2e.staff@clinic.test";
export const E2E_STAFF_NAME = "Esme Tester";

export function e2ePassword(): string {
  const password = process.env.E2E_STAFF_PASSWORD;
  if (!password) throw new Error("E2E_STAFF_PASSWORD is not set — run via `playwright test` so the config creates it.");
  return password;
}

/** Signs in through the real login form; the session cookie is shared with `page.request`. */
export async function signIn(page: Page, next = "/dashboard"): Promise<void> {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Email").fill(E2E_STAFF_EMAIL);
  await page.getByLabel("Password").fill(e2ePassword());
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(new RegExp(`${next.replace(/[/?]/g, "\\$&")}$`));
}
