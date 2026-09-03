import { test, expect } from "@playwright/test";

/**
 * The dashboard masthead states its own waiting count in prose (see
 * OverviewGreeting) — "Nothing's waiting on you", "One request is
 * waiting on you", or "N requests are waiting on you". Reading that
 * sentence is a more durable test signal than counting rendered stream
 * items, since the curated stream deliberately doesn't show everything.
 */
function parseWaitingCount(text: string | null): number {
  if (!text) throw new Error("Expected the dashboard greeting's context line to have text.");
  if (text.startsWith("Nothing's waiting on you")) return 0;
  if (text.startsWith("One request is waiting on you")) return 1;
  const match = text.match(/^(\d+) requests are waiting on you/);
  if (!match) throw new Error(`Could not parse a waiting count from: "${text}"`);
  return Number(match[1]);
}

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
    await expect(page.getByRole("heading", { name: "Waiting on you" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Recently in" })).toBeVisible();

    // At least one real booking request renders — proving this reads
    // persisted data through the service layer, not a stub or an
    // empty shell. (Not pinned to a specific seeded name: repeated
    // local/CI runs accumulate real bookings in the same mock store,
    // same as a real database would.)
    await expect(page.locator("main ul li").first()).toBeVisible();

    expect(pageErrors, `Unexpected page errors: ${pageErrors.map((e) => e.message).join(", ")}`).toHaveLength(0);
    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join(", ")}`).toHaveLength(0);
  });

  test("submitting a booking increases the dashboard's waiting-on-you count by one, and the record actually persists", async ({
    page,
    request,
  }) => {
    // Phase 2 note: "Waiting on you" is curated (initial cap 3, expanded
    // cap 8) and orders oldest-request-first, so a *freshly* submitted
    // request is always the newest and can sort past the visible window
    // once the store has accumulated bookings across repeated runs —
    // it will not always be individually visible in the stream, by
    // design. What must hold regardless of queue depth is: (a) the
    // dashboard's own stated waiting count goes up by exactly one, and
    // (b) the record is genuinely persisted, not just claimed by the UI.
    await page.goto("/dashboard");
    const contextLine = page.locator("h1 + p");
    const before = parseWaitingCount(await contextLine.textContent());

    const patientName = `Dashboard Test Patient ${Date.now()}`;
    await page.goto("/book");
    await page.getByLabel("Full name").fill(patientName);
    await page.getByLabel("Email").fill("dashboard-test@example.com");
    await page.getByLabel("Phone").fill("555-222-9999");
    await page.getByRole("radiogroup", { name: "Patient type" }).getByLabel("First visit").check();
    await page.getByLabel("Treatment").selectOption({ index: 1 });
    await page.getByLabel("Preferred date").fill("2099-06-15");
    await page.getByRole("radiogroup", { name: "Preferred time of day" }).getByLabel("Morning").check();

    const [createResponse] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/bookings") && res.request().method() === "POST"),
      page.getByRole("button", { name: /request this appointment/i }).click(),
    ]);
    // Scoped to the post-submission confirmation region specifically —
    // the booking page's static intro copy ("we'll follow up to
    // confirm a specific time") also contains "follow up", so a loose
    // page-wide text match here would pass even if submission failed.
    await expect(page.getByRole("status")).toContainText("You're on our list");

    // Persistence proof, same pattern as booking-flow.spec.ts: read the
    // record back through the app's own API, not just trust the UI.
    const createBody = await createResponse.json();
    expect(createBody.ok).toBe(true);
    const bookingId = createBody.booking.id;
    const getResponse = await request.get(`/api/bookings/${bookingId}`);
    expect(getResponse.ok()).toBe(true);
    const getBody = await getResponse.json();
    expect(getBody.booking).toMatchObject({ id: bookingId, status: "pending", patient: { fullName: patientName } });

    await page.goto("/dashboard");
    const after = parseWaitingCount(await contextLine.textContent());
    expect(after).toBe(before + 1);
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
