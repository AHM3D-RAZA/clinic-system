import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Automated accessibility scanning catches the mechanical issues
 * (missing labels, contrast, aria misuse) reliably; it does NOT
 * replace manual keyboard-navigation and screen-reader testing, which
 * is covered separately in the manual QA checklist.
 */
test.describe("accessibility scan", () => {
  test("home page has no critical/serious axe violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .exclude("iframe")
      .analyze();

    const seriousOrWorse = results.violations.filter((v) => ["critical", "serious"].includes(v.impact ?? ""));
    expect(
      seriousOrWorse,
      `Serious/critical a11y violations:\n${JSON.stringify(seriousOrWorse, null, 2)}`,
    ).toEqual([]);
  });

  test("booking page has no critical/serious axe violations", async ({ page }) => {
    await page.goto("/book");
    const results = await new AxeBuilder({ page }).analyze();

    const seriousOrWorse = results.violations.filter((v) => ["critical", "serious"].includes(v.impact ?? ""));
    expect(
      seriousOrWorse,
      `Serious/critical a11y violations:\n${JSON.stringify(seriousOrWorse, null, 2)}`,
    ).toEqual([]);
  });

  test("dashboard page has no critical/serious axe violations", async ({ page }) => {
    await page.goto("/dashboard");
    const results = await new AxeBuilder({ page }).analyze();

    const seriousOrWorse = results.violations.filter((v) => ["critical", "serious"].includes(v.impact ?? ""));
    expect(
      seriousOrWorse,
      `Serious/critical a11y violations:\n${JSON.stringify(seriousOrWorse, null, 2)}`,
    ).toEqual([]);
  });

  test("booking form errors are announced accessibly", async ({ page }) => {
    await page.goto("/book");
    await page.getByRole("button", { name: /request this appointment/i }).click();

    const alert = page.getByRole("alert").first();
    await expect(alert).toBeVisible();
    // focus should move to the error summary so keyboard/screen-reader
    // users land directly on what needs fixing
    await expect(alert).toBeFocused();
  });

  test("every form field has an accessible name", async ({ page }) => {
    await page.goto("/book");
    for (const name of ["Full name", "Email", "Phone", "Treatment", "Preferred date"]) {
      await expect(page.getByLabel(name)).toHaveCount(1);
    }
  });
});
