import { test, expect } from "@playwright/test";

test.describe("smoke: public site", () => {
  test("home page loads with no fatal JS errors and the essentials render", async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (err) => pageErrors.push(err));

    // Console errors from blocked third-party requests (Google Fonts is
    // unreachable in this sandboxed test/CI environment) are expected
    // and not app bugs. The browser's generic "Failed to load resource"
    // message doesn't carry the URL, so we key off the one external
    // resource this app ever requests (Google Fonts) — any other error
    // text still fails the test.
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      if (/failed to load resource.*403/i.test(msg.text())) return;
      consoleErrors.push(msg.text());
    });

    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Dentistry that");
    await expect(page.getByRole("navigation")).toBeVisible();
    await expect(page.getByRole("link", { name: "Book a visit" }).first()).toBeVisible();

    expect(pageErrors, `Unexpected page errors: ${pageErrors.map((e) => e.message).join(", ")}`).toHaveLength(0);
    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join(", ")}`).toHaveLength(0);
  });

  test("primary navigation links scroll to their sections", async ({ page, isMobile }) => {
    await page.goto("/");
    if (isMobile) {
      // the desktop pill nav is display:none below 900px — reach
      // "Services" through the mobile drawer instead.
      await page.getByRole("button", { name: "Open menu" }).click();
      await page.locator('[role="dialog"][aria-label="Site menu"]').getByRole("link", { name: "Services" }).click();
    } else {
      await page.getByRole("navigation").getByRole("link", { name: "Services" }).click();
    }
    await expect(page).toHaveURL(/#services$/);
    await expect(page.locator("#services")).toBeInViewport();
  });

  test("booking CTA from the homepage reaches a working booking page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Book a visit" }).first().click();
    await expect(page).toHaveURL(/\/book/);
    await expect(page.getByRole("heading", { name: /let's get you in the chair/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /request this appointment/i })).toBeVisible();
  });

  test("booking page loads directly with no fatal JS errors", async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (err) => pageErrors.push(err));

    await page.goto("/book");

    await expect(page.getByLabel("Full name")).toBeVisible();
    expect(pageErrors).toHaveLength(0);
  });

  test("back link on the booking page returns to the homepage", async ({ page }) => {
    await page.goto("/book");
    await page.getByRole("link", { name: /back to/i }).click();
    await expect(page).toHaveURL(/\/(#home)?$/);
  });

  test("mobile nav drawer opens, lists links, and closes on Escape", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    // Not getByRole here: an aria-hidden="true" element is correctly
    // excluded from the accessibility tree (that's the point of
    // aria-hidden), so a role query can never find the drawer while
    // it's closed. Locate it structurally instead.
    const drawer = page.locator('[role="dialog"][aria-label="Site menu"]');
    await expect(drawer).toHaveAttribute("aria-hidden", "true");

    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(drawer).toHaveAttribute("aria-hidden", "false");
    await expect(drawer.getByRole("link", { name: "Services" })).toBeInViewport();

    await page.keyboard.press("Escape");
    await expect(drawer).toHaveAttribute("aria-hidden", "true");
    await expect(drawer.getByRole("link", { name: "Services" })).not.toBeInViewport();
  });

  test("gallery labels stay inside their own card on small screens", async ({ page }) => {
    // Regression test: at mobile widths, the gallery tiles switch to a
    // static 2-column grid. Their text labels are absolutely positioned
    // within each tile — if the tile ever loses its positioning context
    // (e.g. `position: static` instead of `relative`), every label
    // collapses to the bottom of the whole gallery section instead of
    // sitting inside its own card.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#clinic");
    await page.locator("#clinic").scrollIntoViewIfNeeded();

    const firstTile = page
      .locator("#clinic")
      .getByText("the waiting room")
      .locator("xpath=ancestor::*[contains(@class, 'tile')]")
      .first();
    const secondTile = page
      .locator("#clinic")
      .getByText("chair 2")
      .locator("xpath=ancestor::*[contains(@class, 'tile')]")
      .first();

    const firstBox = await firstTile.boundingBox();
    const secondBox = await secondTile.boundingBox();
    expect(firstBox).not.toBeNull();
    expect(secondBox).not.toBeNull();

    // Each label's box should sit within a normal card-sized area (a
    // single tile at 4:5 aspect ratio, a couple hundred px tall at
    // mobile widths), not stretch across the ~900px+ height of the
    // whole gallery section the way the bug produced.
    expect(firstBox!.height).toBeLessThan(400);
    expect(secondBox!.height).toBeLessThan(400);

    // The two labels should be in different tiles (not visually
    // collapsed on top of one another at the same position).
    expect(Math.abs(firstBox!.y - secondBox!.y)).toBeLessThan(20);
    expect(Math.abs(firstBox!.x - secondBox!.x)).toBeGreaterThan(100);
  });
});
