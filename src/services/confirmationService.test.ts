import { beforeEach, describe, expect, it } from "vitest";
import { confirmBooking } from "@/services/confirmationService";
import { bookingRequestsTable } from "@/data/mockDb";
import { appointmentsTable } from "@/data/appointmentsTable";
import { bookingService } from "@/services/bookingService";
import type { BookingRequest } from "@/types/booking";

function makeBooking(overrides: Partial<BookingRequest> = {}): BookingRequest {
  const now = new Date().toISOString();
  return {
    id: `bkg_${Math.random().toString(36).slice(2, 10)}`,
    clinicId: "aster",
    patient: {
      fullName: "Confirmation Test Patient",
      email: "confirm-test@example.com",
      phone: "+1 (555) 200-3300",
      patientType: "new",
    },
    serviceId: "checkups-cleanings",
    preferredDate: "2099-07-01",
    preferredTime: "afternoon",
    status: "pending",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// A real doctor id from the seeded "aster" clinic content — confirming
// this test suite against the actual clinic-doctor source of truth,
// not a hand-rolled fixture, is the point of the "invalid doctor"
// checks below.
const REAL_DOCTOR_ID = "nadia-farooqi";

describe("confirmBooking", () => {
  beforeEach(() => {
    bookingRequestsTable.__resetForTests();
    appointmentsTable.__resetForTests();
  });

  it("confirms a pending booking and creates a matching appointment", async () => {
    const booking = bookingRequestsTable.insert(makeBooking({ id: "bkg_confirm_pending", status: "pending" }));

    const result = await confirmBooking(booking.id, REAL_DOCTOR_ID);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.booking.status).toBe("confirmed");
    expect(result.booking.assignedDoctorId).toBe(REAL_DOCTOR_ID);
    expect(result.appointment.sourceBookingId).toBe(booking.id);
    expect(result.appointment.doctorId).toBe(REAL_DOCTOR_ID);
    expect(result.appointment.clinicId).toBe(booking.clinicId);
    expect(result.appointment.serviceId).toBe(booking.serviceId);
    expect(result.appointment.date).toBe(booking.preferredDate);
    expect(result.appointment.status).toBe("confirmed");
  });

  it("confirms a contacted booking the same way as a pending one", async () => {
    const booking = bookingRequestsTable.insert(makeBooking({ id: "bkg_confirm_contacted", status: "contacted" }));

    const result = await confirmBooking(booking.id, REAL_DOCTOR_ID);

    expect(result.ok).toBe(true);
  });

  it("actually persists both writes, not just returning success", async () => {
    const booking = bookingRequestsTable.insert(makeBooking({ id: "bkg_confirm_persist" }));

    await confirmBooking(booking.id, REAL_DOCTOR_ID);

    const persistedBooking = await bookingService.getById(booking.id);
    expect(persistedBooking?.status).toBe("confirmed");
    expect(persistedBooking?.assignedDoctorId).toBe(REAL_DOCTOR_ID);

    const appointments = appointmentsTable.findByClinic("aster");
    expect(appointments.some((a) => a.sourceBookingId === booking.id)).toBe(true);
  });

  it("returns not_found for a booking id that doesn't exist", async () => {
    const result = await confirmBooking("bkg_does_not_exist", REAL_DOCTOR_ID);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("not_found");
  });

  it("rejects confirming an already-confirmed booking, and creates no appointment", async () => {
    const booking = bookingRequestsTable.insert(makeBooking({ id: "bkg_already_confirmed", status: "confirmed" }));
    const appointmentsBefore = appointmentsTable.findByClinic("aster").length;

    const result = await confirmBooking(booking.id, REAL_DOCTOR_ID);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid_state");
    expect(appointmentsTable.findByClinic("aster").length).toBe(appointmentsBefore);
  });

  it("rejects confirming a cancelled booking", async () => {
    const booking = bookingRequestsTable.insert(makeBooking({ id: "bkg_cancelled", status: "cancelled" }));
    const result = await confirmBooking(booking.id, REAL_DOCTOR_ID);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid_state");
  });

  it("rejects an unknown doctor id and leaves the booking untouched", async () => {
    const booking = bookingRequestsTable.insert(makeBooking({ id: "bkg_bad_doctor" }));

    const result = await confirmBooking(booking.id, "doctor-does-not-exist");

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid_doctor");

    const stillPending = await bookingService.getById(booking.id);
    expect(stillPending?.status).toBe("pending");
    expect(appointmentsTable.findByClinic("aster").some((a) => a.sourceBookingId === booking.id)).toBe(false);
  });

  it("rejects an empty doctor id", async () => {
    const booking = bookingRequestsTable.insert(makeBooking({ id: "bkg_empty_doctor" }));
    const result = await confirmBooking(booking.id, "");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid_doctor");
  });
});
