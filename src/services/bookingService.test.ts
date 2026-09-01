import { beforeEach, describe, expect, it } from "vitest";
import { bookingService } from "@/services/bookingService";
import { bookingRequestsTable } from "@/data/mockDb";
import type { CreateBookingInput } from "@/types/booking";

const SAMPLE_INPUT: CreateBookingInput = {
  clinicId: "aster",
  patient: {
    fullName: "Priya Nair",
    email: "priya@example.com",
    phone: "+1 (555) 402-1187",
    patientType: "new",
  },
  serviceId: "checkups-cleanings",
  preferredDate: "2099-03-01",
  preferredTime: "afternoon",
  notes: "Referred by a friend.",
};

describe("bookingService", () => {
  beforeEach(() => {
    bookingRequestsTable.__resetForTests();
  });

  it("create() produces a structured BookingRequest, not just an echo of the form", async () => {
    const booking = await bookingService.create(SAMPLE_INPUT);

    expect(booking.id).toEqual(expect.stringMatching(/^bkg_/));
    expect(booking.status).toBe("pending");
    expect(booking.createdAt).toBeTruthy();
    expect(booking.updatedAt).toBeTruthy();
    expect(booking.patient).toEqual(SAMPLE_INPUT.patient);
    expect(booking.serviceId).toBe(SAMPLE_INPUT.serviceId);
    expect(booking.preferredDate).toBe(SAMPLE_INPUT.preferredDate);
    expect(booking.preferredTime).toBe(SAMPLE_INPUT.preferredTime);
  });

  it("create() actually persists to the data layer, not just returning a value", async () => {
    const booking = await bookingService.create(SAMPLE_INPUT);

    // Read back through the SAME boundary a real database read would use —
    // proves the service didn't just hand back an in-memory object that
    // was never written anywhere.
    const persisted = await bookingService.getById(booking.id);
    expect(persisted).toEqual(booking);
  });

  it("create() assigns a unique id to each booking", async () => {
    const first = await bookingService.create(SAMPLE_INPUT);
    const second = await bookingService.create(SAMPLE_INPUT);
    expect(first.id).not.toBe(second.id);
  });

  it("getById() returns undefined for an unknown id", async () => {
    const result = await bookingService.getById("bkg_does_not_exist");
    expect(result).toBeUndefined();
  });

  it("listByClinic() only returns bookings for the requested clinic", async () => {
    await bookingService.create(SAMPLE_INPUT);
    await bookingService.create({ ...SAMPLE_INPUT, clinicId: "other-clinic" });

    const asterBookings = await bookingService.listByClinic("aster");
    expect(asterBookings.every((b) => b.clinicId === "aster")).toBe(true);
    expect(asterBookings.some((b) => b.clinicId === "other-clinic")).toBe(false);
  });

  it("updateStatus() changes status and bumps updatedAt", async () => {
    const booking = await bookingService.create(SAMPLE_INPUT);
    const originalUpdatedAt = booking.updatedAt;

    // ensure a measurable time difference
    await new Promise((resolve) => setTimeout(resolve, 5));

    const updated = await bookingService.updateStatus(booking.id, "confirmed");
    expect(updated?.status).toBe("confirmed");
    expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
  });

  it("updateStatus() on an unknown id returns undefined without throwing", async () => {
    const result = await bookingService.updateStatus("bkg_nope", "confirmed");
    expect(result).toBeUndefined();
  });
});
