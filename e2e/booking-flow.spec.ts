import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { BookingRequest } from "../src/types/booking";

function futureDateIso(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

/**
 * Reads the mock store's actual JSON file straight off disk — the same
 * file `src/data/mockDb.ts` reads on startup. This is what proves
 * persistence is real (survives a server restart) rather than just
 * "held in the running server's memory for as long as this test's dev
 * server happens to stay up." The E2E suite runs against a real
 * `next build` + `next start` (see playwright.config.ts), so this is
 * reading the actual file that process would read again if restarted.
 */
function readStoreFileDirectly(): BookingRequest[] {
  const storePath = join(process.cwd(), ".data", "bookings.json");
  const raw = readFileSync(storePath, "utf-8");
  return JSON.parse(raw) as BookingRequest[];
}

test.describe("end-to-end: patient books an appointment", () => {
  test("a real patient can open the site, book a visit, and the booking is actually persisted", async ({
    page,
    request,
  }) => {
    // 1. Open website.
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // 2. Navigate to booking via the real UI, not a direct page.goto —
    // this is the path a real patient takes.
    await page.getByRole("link", { name: "Book a visit" }).first().click();
    await expect(page).toHaveURL(/\/book/);

    // 3. Fill in patient information.
    await page.getByLabel("Full name").fill("Farah Siddiqui");
    await page.getByLabel("Email").fill("farah.siddiqui@example.com");
    await page.getByLabel("Phone").fill("+1 (555) 774-2201");
    await page.getByRole("radio", { name: "First visit" }).check();

    // 4. Select/request a service.
    await page.getByLabel("Treatment").selectOption("cosmetic-whitening");

    // 5. Select preferred date/time.
    const preferredDate = futureDateIso(7);
    await page.getByLabel("Preferred date").fill(preferredDate);
    await page.getByRole("radio", { name: "Afternoon" }).check();

    await page.getByLabel(/anything we should know/i).fill("First time getting whitening done, a bit nervous.");

    // 6. Submit.
    const [createResponse] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/bookings") && res.request().method() === "POST"),
      page.getByRole("button", { name: /request this appointment/i }).click(),
    ]);

    // 7. Verify successful submission — a real confirmation, with the
    // patient's own data reflected back, not a generic toast.
    await expect(page.getByRole("status")).toBeVisible();
    await expect(page.getByText(/you're on our list, farah/i)).toBeVisible();
    await expect(page.getByText("Cosmetic & whitening")).toBeVisible();
    await expect(page.getByText("farah.siddiqui@example.com")).toBeVisible();
    await expect(page.getByText(/\+1 \(555\) 774-2201/)).toBeVisible();

    // The booking form itself should be gone now — replaced by the
    // confirmation, not sitting underneath it re-submittable.
    await expect(page.getByRole("button", { name: /request this appointment/i })).toHaveCount(0);

    // 8. Verify the booking was actually passed to the mock data/service
    // layer — not just that the UI claimed success. Read it back
    // through the same API boundary the UI used to create it.
    const createBody = await createResponse.json();
    expect(createBody.ok).toBe(true);
    const bookingId = createBody.booking.id;

    const getResponse = await request.get(`/api/bookings/${bookingId}`);
    expect(getResponse.ok()).toBe(true);
    const getBody = await getResponse.json();
    expect(getBody.booking).toMatchObject({
      id: bookingId,
      status: "pending",
      serviceId: "cosmetic-whitening",
      preferredDate,
      preferredTime: "afternoon",
      patient: {
        fullName: "Farah Siddiqui",
        email: "farah.siddiqui@example.com",
        phone: "+1 (555) 774-2201",
        patientType: "new",
      },
    });

    // Stronger than the API check above: read the mock store's actual
    // file off disk directly, bypassing the running server entirely.
    // This is the concrete proof that the booking would still be there
    // if the server process were killed and restarted right now — an
    // in-memory-only store would still pass every assertion up to this
    // point (the server is still running), but would have nothing on
    // disk for this to find.
    const onDisk = readStoreFileDirectly();
    const persistedRecord = onDisk.find((b) => b.id === bookingId);
    expect(persistedRecord, "booking should exist in the on-disk store file, not just server memory").toBeDefined();
    expect(persistedRecord?.patient.fullName).toBe("Farah Siddiqui");
  });

  test("multiple bookings created in sequence all coexist on disk, none overwriting another", async ({
    request,
  }) => {
    const names = ["Coexist Patient A", "Coexist Patient B", "Coexist Patient C"];
    const createdIds: string[] = [];

    for (const fullName of names) {
      const response = await request.post("/api/bookings", {
        data: {
          clinicId: "aster",
          fullName,
          email: `${fullName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
          phone: "555-100-2000",
          patientType: "new",
          serviceId: "checkups-cleanings",
          preferredDate: futureDateIso(4),
          preferredTime: "morning",
        },
      });
      expect(response.ok()).toBe(true);
      const body = await response.json();
      createdIds.push(body.booking.id);
    }

    const onDisk = readStoreFileDirectly();
    for (let i = 0; i < names.length; i++) {
      const record = onDisk.find((b) => b.id === createdIds[i]);
      expect(record?.patient.fullName).toBe(names[i]);
    }
    // and none of them collapsed onto the same id
    expect(new Set(createdIds).size).toBe(3);
  });

  test("refreshing after a successful booking does not resubmit or duplicate it", async ({ page, request }) => {
    await page.goto("/book");
    await page.getByLabel("Full name").fill("Wasi Rahman");
    await page.getByLabel("Email").fill("wasi.rahman@example.com");
    await page.getByLabel("Phone").fill("555-902-1120");
    await page.getByRole("radio", { name: "Been here before" }).check();
    await page.getByLabel("Treatment").selectOption("checkups-cleanings");
    await page.getByLabel("Preferred date").fill(futureDateIso(3));
    await page.getByRole("radio", { name: "Morning" }).check();

    const [createResponse] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/bookings") && res.request().method() === "POST"),
      page.getByRole("button", { name: /request this appointment/i }).click(),
    ]);
    const { booking } = await createResponse.json();

    await expect(page.getByRole("status")).toBeVisible();

    // A real user's next move after seeing a confirmation is often to
    // refresh or re-visit the page — this must not create a second
    // booking, and the empty form should reappear rather than
    // re-showing (and re-postable) stale confirmation state.
    let postCount = 0;
    page.on("request", (req) => {
      if (req.url().includes("/api/bookings") && req.method() === "POST") postCount += 1;
    });

    await page.reload();
    await expect(page.getByLabel("Full name")).toHaveValue("");
    expect(postCount).toBe(0);

    const getResponse = await request.get(`/api/bookings/${booking.id}`);
    const getBody = await getResponse.json();
    expect(getBody.booking.id).toBe(booking.id);
  });

  test("submitting the form again after success starts a fresh request", async ({ page }) => {
    await page.goto("/book");
    await page.getByLabel("Full name").fill("Second Patient");
    await page.getByLabel("Email").fill("second@example.com");
    await page.getByLabel("Phone").fill("555-333-4400");
    await page.getByRole("radio", { name: "First visit" }).check();
    await page.getByLabel("Treatment").selectOption("checkups-cleanings");
    await page.getByLabel("Preferred date").fill(futureDateIso(2));
    await page.getByRole("radio", { name: "Evening" }).check();
    await page.getByRole("button", { name: /request this appointment/i }).click();

    await expect(page.getByRole("status")).toBeVisible();

    await page.getByRole("button", { name: /submit another request/i }).click();
    await expect(page.getByLabel("Full name")).toBeVisible();
    await expect(page.getByLabel("Full name")).toHaveValue("");
  });
});
