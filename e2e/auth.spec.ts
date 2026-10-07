import { test, expect } from "@playwright/test";
import { E2E_STAFF_EMAIL, E2E_STAFF_NAME, e2ePassword, signIn } from "./helpers/auth";

const PROTECTED_PAGES = [
  "/dashboard",
  "/dashboard/patients",
  "/dashboard/patients/anything",
  "/dashboard/bookings",
  "/dashboard/appointments",
  "/dashboard/team",
];

test.describe("staff authentication", () => {
  for (const path of PROTECTED_PAGES) {
    test(`signed-out ${path} redirects to login and shows no data`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login\?next=/);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("staff sign in");
      await expect(page.locator("body")).not.toContainText(/@example\.com|\+1 \(555\)/);
    });
  }

  test("signed-out API reads and writes are refused with 401", async ({ request }) => {
    const read = await request.get("/api/bookings/bkg_seed0001");
    expect(read.status()).toBe(401);
    expect(JSON.stringify(await read.json())).not.toMatch(/patient|email|phone/i);

    const confirm = await request.post("/api/bookings/bkg_seed0001/confirm", { data: { doctorId: "x" } });
    expect(confirm.status()).toBe(401);
  });

  test("signed-out soft-navigation (RSC) requests cannot fetch dashboard pages", async ({ request }) => {
    const response = await request.get("/dashboard/patients", {
      headers: { RSC: "1" },
      maxRedirects: 0,
    });
    expect(response.status()).toBeGreaterThanOrEqual(300);
    expect(response.status()).toBeLessThan(400);
    expect(response.headers()["location"]).toContain("/login");
  });

  test("public site and public booking submission stay public", async ({ page, request }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/$/);
    await page.goto("/book");
    await expect(page).toHaveURL(/\/book$/);
    const preferredDate = new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10);
    const response = await request.post("/api/bookings", {
      data: {
        clinicId: "aster",
        fullName: "Public Visitor",
        email: "visitor@example.com",
        phone: "555-010-2000",
        patientType: "new",
        serviceId: "checkups-cleanings",
        preferredDate,
        preferredTime: "morning",
      },
    });
    expect(response.status()).toBe(201);
    // …and the visitor still can't read it back.
    const { booking } = await response.json();
    expect((await request.get(`/api/bookings/${booking.id}`)).status()).toBe(401);
  });

  test("wrong password is refused with a generic message", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(E2E_STAFF_EMAIL);
    await page.getByLabel("Password").fill("not-the-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "don't match" })).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("sign in → identity shown → refresh keeps session → sign out locks the dashboard", async ({ page }) => {
    await signIn(page, "/dashboard/patients");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(E2E_STAFF_NAME).first()).toBeAttached();

    await page.reload();
    await expect(page).toHaveURL(/\/dashboard\/patients$/);

    const signOut = page.getByRole("button", { name: "Sign out" });
    // On mobile the sign-out lives in the drawer.
    if (!(await signOut.first().isVisible())) await page.getByRole("button", { name: "Open dashboard menu" }).click();
    await signOut.locator("visible=true").first().click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?next=/);
  });

  test("login ignores off-site `next` values", async ({ page }) => {
    await signIn(page, "/dashboard");
    await page.goto("/login?next=https://evil.example");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("login password is never needed in the URL or page", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(E2E_STAFF_EMAIL);
    await page.getByLabel("Password").fill(e2ePassword());
    await expect(page.getByLabel("Password")).toHaveAttribute("type", "password");
  });
});
