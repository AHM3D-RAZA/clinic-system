import { beforeEach, describe, expect, it } from "vitest";
import { confirmBooking } from "@/services/confirmationService";
import { bookingRequestsTable } from "@/data/mockDb";
import { appointmentsTable } from "@/data/appointmentsTable";
import { patientsTable } from "@/data/patientsMockDb";
import { todayIsoDate } from "@/lib/appointments";
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
    patientsTable.__resetForTests();
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

  describe("patient resolution", () => {
    it("creates a patient record for a genuinely new patient, and links booking and appointment to it", async () => {
      const booking = bookingRequestsTable.insert(makeBooking({ id: "bkg_new_patient" }));
      const patientsBefore = patientsTable.findByClinic("aster").length;

      const result = await confirmBooking(booking.id, REAL_DOCTOR_ID);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(patientsTable.findByClinic("aster")).toHaveLength(patientsBefore + 1);
      expect(result.patient).toMatchObject({
        fullName: "Confirmation Test Patient",
        email: "confirm-test@example.com",
        patientType: "new",
        primaryDoctorId: REAL_DOCTOR_ID,
        clinicId: "aster",
      });
      expect(patientsTable.findById(result.patient.id)).toBeDefined();
      expect(result.appointment.patientId).toBe(result.patient.id);
      expect(result.booking.patientId).toBe(result.patient.id);
      expect((await bookingService.getById(booking.id))?.patientId).toBe(result.patient.id);
    });

    it("resolves an existing patient by email instead of creating a duplicate", async () => {
      const booking = bookingRequestsTable.insert(
        makeBooking({
          id: "bkg_existing_by_email",
          patient: {
            fullName: "Maya Chen",
            email: "  MAYA.CHEN@example.com ",
            phone: "+1 (555) 019-2231",
            patientType: "existing",
          },
        }),
      );
      const patientsBefore = patientsTable.findByClinic("aster").length;

      const result = await confirmBooking(booking.id, REAL_DOCTOR_ID);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.patient.id).toBe("pat_maya-chen");
      expect(result.appointment.patientId).toBe("pat_maya-chen");
      expect(patientsTable.findByClinic("aster")).toHaveLength(patientsBefore);
    });

    it("does not match an existing patient by name alone", async () => {
      const booking = bookingRequestsTable.insert(
        makeBooking({
          id: "bkg_same_name_new_email",
          patient: { fullName: "Maya Chen", email: "a.different.maya@example.com", phone: "+1 (555) 000-0000", patientType: "new" },
        }),
      );
      const result = await confirmBooking(booking.id, REAL_DOCTOR_ID);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.patient.id).not.toBe("pat_maya-chen");
    });

    it("uses the booking's own patientId when it has one", async () => {
      const booking = bookingRequestsTable.insert(
        makeBooking({ id: "bkg_with_patient_id", patientId: "pat_zara-hussain" }),
      );
      const patientsBefore = patientsTable.findByClinic("aster").length;

      const result = await confirmBooking(booking.id, REAL_DOCTOR_ID);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.patient.id).toBe("pat_zara-hussain");
      expect(result.appointment.patientId).toBe("pat_zara-hussain");
      expect(patientsTable.findByClinic("aster")).toHaveLength(patientsBefore);
    });

    it("two requests from the same new patient end up with one patient record", async () => {
      const first = bookingRequestsTable.insert(makeBooking({ id: "bkg_repeat_1" }));
      const second = bookingRequestsTable.insert(makeBooking({ id: "bkg_repeat_2" }));

      const a = await confirmBooking(first.id, REAL_DOCTOR_ID);
      const b = await confirmBooking(second.id, REAL_DOCTOR_ID);

      expect(a.ok && b.ok).toBe(true);
      if (!a.ok || !b.ok) return;
      expect(b.patient.id).toBe(a.patient.id);
    });

    it("rejects a booking pointing at a patient that doesn't exist, writing nothing", async () => {
      const booking = bookingRequestsTable.insert(makeBooking({ id: "bkg_ghost_patient", patientId: "pat_ghost" }));
      const patientsBefore = patientsTable.findByClinic("aster").length;
      const appointmentsBefore = appointmentsTable.findByClinic("aster").length;

      const result = await confirmBooking(booking.id, REAL_DOCTOR_ID);

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.code).toBe("invalid_patient");
      expect((await bookingService.getById(booking.id))?.status).toBe("pending");
      expect(patientsTable.findByClinic("aster")).toHaveLength(patientsBefore);
      expect(appointmentsTable.findByClinic("aster")).toHaveLength(appointmentsBefore);
    });
  });

  describe("service and date validation", () => {
    it("rejects a service this clinic doesn't offer, writing nothing", async () => {
      const booking = bookingRequestsTable.insert(makeBooking({ id: "bkg_bad_service", serviceId: "no-such-service" }));
      const patientsBefore = patientsTable.findByClinic("aster").length;
      const appointmentsBefore = appointmentsTable.findByClinic("aster").length;

      const result = await confirmBooking(booking.id, REAL_DOCTOR_ID);

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.code).toBe("invalid_service");
      expect((await bookingService.getById(booking.id))?.status).toBe("pending");
      expect(patientsTable.findByClinic("aster")).toHaveLength(patientsBefore);
      expect(appointmentsTable.findByClinic("aster")).toHaveLength(appointmentsBefore);
    });

    it("rejects a requested date that has already passed, writing nothing", async () => {
      const booking = bookingRequestsTable.insert(makeBooking({ id: "bkg_past_date", preferredDate: "2000-01-01" }));
      const patientsBefore = patientsTable.findByClinic("aster").length;
      const appointmentsBefore = appointmentsTable.findByClinic("aster").length;

      const result = await confirmBooking(booking.id, REAL_DOCTOR_ID);

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.code).toBe("date_in_past");
      expect((await bookingService.getById(booking.id))?.status).toBe("pending");
      expect(patientsTable.findByClinic("aster")).toHaveLength(patientsBefore);
      expect(appointmentsTable.findByClinic("aster")).toHaveLength(appointmentsBefore);
    });

    it("accepts a request for today", async () => {
      const booking = bookingRequestsTable.insert(makeBooking({ id: "bkg_today", preferredDate: todayIsoDate() }));
      const result = await confirmBooking(booking.id, REAL_DOCTOR_ID);
      expect(result.ok).toBe(true);
    });

    it("an invalid doctor never creates a patient", async () => {
      const booking = bookingRequestsTable.insert(makeBooking({ id: "bkg_doctor_no_patient" }));
      const patientsBefore = patientsTable.findByClinic("aster").length;
      await confirmBooking(booking.id, "doctor-does-not-exist");
      expect(patientsTable.findByClinic("aster")).toHaveLength(patientsBefore);
    });
  });
});
