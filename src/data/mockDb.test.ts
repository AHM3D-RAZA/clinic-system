import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bookingRequestsTable } from "@/data/mockDb";
import type { BookingRequest } from "@/types/booking";

function makeBooking(overrides: Partial<BookingRequest> = {}): BookingRequest {
  const now = new Date().toISOString();
  return {
    id: `bkg_${Math.random().toString(36).slice(2, 10)}`,
    clinicId: "aster",
    patient: {
      fullName: "Persistence Test Patient",
      email: "persist@example.com",
      phone: "555-777-1234",
      patientType: "new",
    },
    serviceId: "checkups-cleanings",
    preferredDate: "2099-06-01",
    preferredTime: "morning",
    status: "pending",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("mockDb persistence", () => {
  beforeEach(() => {
    bookingRequestsTable.__resetForTests();
  });

  it("a created booking exists in the store immediately", () => {
    const booking = makeBooking({ id: "bkg_exists_check" });
    bookingRequestsTable.insert(booking);

    expect(bookingRequestsTable.findById("bkg_exists_check")).toBeDefined();
  });

  it("a retrieved booking's stored data matches exactly what was written", () => {
    const booking = makeBooking({ id: "bkg_match_check" });
    bookingRequestsTable.insert(booking);

    const retrieved = bookingRequestsTable.findById("bkg_match_check");
    expect(retrieved).toEqual(booking);
  });

  it("every booking has a stable, non-empty id", () => {
    const booking = makeBooking({ id: "bkg_id_check" });
    bookingRequestsTable.insert(booking);

    const retrieved = bookingRequestsTable.findById("bkg_id_check");
    expect(retrieved?.id).toBe("bkg_id_check");
    expect(retrieved?.id.length).toBeGreaterThan(0);
  });

  it("every booking has createdAt/updatedAt timestamps", () => {
    const booking = makeBooking({ id: "bkg_timestamp_check" });
    bookingRequestsTable.insert(booking);

    const retrieved = bookingRequestsTable.findById("bkg_timestamp_check");
    expect(retrieved?.createdAt).toBeTruthy();
    expect(new Date(retrieved!.createdAt).toString()).not.toBe("Invalid Date");
    expect(retrieved?.updatedAt).toBeTruthy();
  });

  it("stores the correct clinicId, not a hardcoded one", () => {
    const booking = makeBooking({ id: "bkg_clinic_check", clinicId: "some-other-clinic" });
    bookingRequestsTable.insert(booking);

    expect(bookingRequestsTable.findById("bkg_clinic_check")?.clinicId).toBe("some-other-clinic");
  });

  it("a newly inserted booking has the expected initial status", () => {
    const booking = makeBooking({ id: "bkg_status_check", status: "pending" });
    bookingRequestsTable.insert(booking);

    expect(bookingRequestsTable.findById("bkg_status_check")?.status).toBe("pending");
  });

  it("multiple bookings coexist without overwriting each other", () => {
    const a = makeBooking({ id: "bkg_A", patient: { ...makeBooking().patient, fullName: "Patient A" } });
    const b = makeBooking({ id: "bkg_B", patient: { ...makeBooking().patient, fullName: "Patient B" } });
    const c = makeBooking({ id: "bkg_C", patient: { ...makeBooking().patient, fullName: "Patient C" } });

    bookingRequestsTable.insert(a);
    bookingRequestsTable.insert(b);
    bookingRequestsTable.insert(c);

    expect(bookingRequestsTable.findById("bkg_A")?.patient.fullName).toBe("Patient A");
    expect(bookingRequestsTable.findById("bkg_B")?.patient.fullName).toBe("Patient B");
    expect(bookingRequestsTable.findById("bkg_C")?.patient.fullName).toBe("Patient C");
  });

  it("updateStatus changes only the targeted booking, leaving others untouched", () => {
    bookingRequestsTable.insert(makeBooking({ id: "bkg_X", status: "pending" }));
    bookingRequestsTable.insert(makeBooking({ id: "bkg_Y", status: "pending" }));

    bookingRequestsTable.updateStatus("bkg_X", "confirmed");

    expect(bookingRequestsTable.findById("bkg_X")?.status).toBe("confirmed");
    expect(bookingRequestsTable.findById("bkg_Y")?.status).toBe("pending");
  });
});

describe("mockDb persistence across a simulated server restart", () => {
  afterEach(() => {
    bookingRequestsTable.__resetForTests();
  });

  it("data written before a restart is still readable after the module reloads from disk", async () => {
    // "Restart" = the module's top-level init code runs again, exactly
    // as it would in a fresh Node process — the only thing that could
    // survive that is whatever's actually on disk, not anything held
    // in a JS variable. vi.resetModules() clears Vitest's module
    // cache (NOT process.env, which is how the same test-db file path
    // is preserved across the "restart" — see mockDb.ts) so the next
    // import re-executes mockDb's file-read-on-load logic for real.
    const before = await import("@/data/mockDb");
    before.bookingRequestsTable.__resetForTests();
    before.bookingRequestsTable.insert(
      makeBooking({ id: "bkg_survives_restart", patient: { ...makeBooking().patient, fullName: "Restart Test" } }),
    );
    expect(before.bookingRequestsTable.findById("bkg_survives_restart")).toBeDefined();

    vi.resetModules();
    const after = await import("@/data/mockDb");

    const survived = after.bookingRequestsTable.findById("bkg_survives_restart");
    expect(survived).toBeDefined();
    expect(survived?.patient.fullName).toBe("Restart Test");
  });

  it("seed data is also present on a fresh module load (the store isn't empty on first run)", async () => {
    vi.resetModules();
    const fresh = await import("@/data/mockDb");
    expect(fresh.bookingRequestsTable.findAll().length).toBeGreaterThan(0);
  });
});
