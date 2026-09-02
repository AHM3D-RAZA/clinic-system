import { test, expect } from "@playwright/test";

test.describe("smoke: dashboard", () => {
  test("dashboard loads with no fatal JS errors and shows the real overview", async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (err) => pageErrors.push(err));

    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      // Google Fonts is unreachable in this sandboxed environment — not an app bug.
      if (/failed to load resource.*403/i.test(msg.text())) return;
      consoleErrors.push(msg.text());
    });

    await page.goto("/dashboard");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Good (morning|afternoon|evening)/);
    await expect(page.getByRole("heading", { name: "Needs attention" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Recent activity" })).toBeVisible();

    // At least one real booking request renders — proving this reads
    // persisted data through the service layer, not a stub or an
    // empty shell. (Not pinned to a specific seeded name: repeated
    // local/CI runs accumulate real bookings in the same mock store,
    // same as a real database would.)
    await expect(page.locator("main ul li").first()).toBeVisible();

    expect(pageErrors, `Unexpected page errors: ${pageErrors.map((e) => e.message).join(", ")}`).toHaveLength(0);
    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join(", ")}`).toHaveLength(0);
  });

  test("a freshly submitted booking request shows up in the dashboard's attention panel", async ({ page }) => {
    // Unique per run: the mock store persists across repeated local/CI
    // runs (same as a real database would), so a fixed name would
    // eventually collide with a booking an earlier run left behind.
    const patientName = `Dashboard Test Patient ${Date.now()}`;

    await page.goto("/book");
    await page.getByLabel("Full name").fill(patientName);
    await page.getByLabel("Email").fill("dashboard-test@example.com");
    await page.getByLabel("Phone").fill("555-222-9999");
    await page.getByRole("radiogroup", { name: "Patient type" }).getByLabel("First visit").check();
    await page.getByLabel("Treatment").selectOption({ index: 1 });
    await page.getByLabel("Preferred date").fill("2099-06-15");
    await page.getByRole("radiogroup", { name: "Preferred time of day" }).getByLabel("Morning").check();
    await page.getByRole("button", { name: /request this appointment/i }).click();
    // Scoped to the post-submission confirmation region specifically —
    // the booking page's static intro copy ("we'll follow up to
    // confirm a specific time") also contains "follow up", so a loose
    // page-wide text match here would pass even if submission failed.
    await expect(page.getByRole("status")).toContainText("You're on our list");

    await page.goto("/dashboard");
    const attentionPanel = page.locator("section", { has: page.getByRole("heading", { name: "Needs attention" }) });
    await expect(attentionPanel.getByText(patientName)).toBeVisible();
  });

  test("desktop nav rail lists Overview as active and the unimplemented items as honest placeholders", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "desktop-only rail; covered by the mobile drawer test below");
    await page.goto("/dashboard");

    const rail = page.getByRole("navigation", { name: "Dashboard navigation" });
    await expect(rail.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
    await expect(rail.getByText("Patients")).toBeVisible();
    await expect(rail.getByRole("link", { name: "Patients" })).toHaveCount(0);
    await expect(rail.getByText("Soon").first()).toBeVisible();
  });

  test("mobile menu opens the dashboard nav drawer and closes on Escape", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile-only drawer; covered by the desktop rail test above");
    await page.goto("/dashboard");

    await page.getByRole("button", { name: "Open dashboard menu" }).click();
    const drawer = page.locator('[role="dialog"][aria-label="Dashboard menu"]');
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Overview" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(drawer).toHaveAttribute("aria-hidden", "true");
  });
});
