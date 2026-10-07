import { describe, expect, it } from "vitest";
import { deriveAppointmentFromBooking } from "./deriveAppointment";
import type { BookingRequest } from "@/types/booking";

function makeBooking(overrides: Partial<BookingRequest> = {}): BookingRequest {
  return {
    id: "bkg_derive_test",
    clinicId: "aster",
    patient: {
      fullName: "Kiran Aziz",
      email: "kiran@example.com",
      phone: "+1 (555) 111-2233",
      patientType: "new",
    },
    serviceId: "fillings-repairs",
    preferredDate: "2099-05-10",
    preferredTime: "morning",
    status: "pending",
    createdAt: "2099-05-01T00:00:00.000Z",
    updatedAt: "2099-05-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("deriveAppointmentFromBooking", () => {
  it("preserves clinicId, serviceId, and preferredDate", () => {
    const booking = makeBooking();
    const appointment = deriveAppointmentFromBooking(booking, "nadia-farooqi", "pat_1");

    expect(appointment.clinicId).toBe(booking.clinicId);
    expect(appointment.serviceId).toBe(booking.serviceId);
    expect(appointment.date).toBe(booking.preferredDate);
  });

  it("preserves the patient's name and type", () => {
    const booking = makeBooking({
      patient: { fullName: "Zoya Sheikh", email: "z@example.com", phone: "555-000", patientType: "existing" },
    });
    const appointment = deriveAppointmentFromBooking(booking, "sana-malik", "pat_1");

    expect(appointment.patientName).toBe("Zoya Sheikh");
    expect(appointment.patientType).toBe("existing");
  });

  it("carries the given patient id onto the appointment", () => {
    const appointment = deriveAppointmentFromBooking(makeBooking(), "nadia-farooqi", "pat_specific");
    expect(appointment.patientId).toBe("pat_specific");
  });

  it("uses the given doctor id", () => {
    const appointment = deriveAppointmentFromBooking(makeBooking(), "rehan-khalid", "pat_1");
    expect(appointment.doctorId).toBe("rehan-khalid");
  });

  it("sets sourceBookingId to the booking's id", () => {
    const booking = makeBooking({ id: "bkg_specific_id" });
    const appointment = deriveAppointmentFromBooking(booking, "nadia-farooqi", "pat_1");
    expect(appointment.sourceBookingId).toBe("bkg_specific_id");
  });

  it("generates a stable-looking appointment id, distinct per call", () => {
    const booking = makeBooking();
    const a = deriveAppointmentFromBooking(booking, "nadia-farooqi", "pat_1");
    const b = deriveAppointmentFromBooking(booking, "nadia-farooqi", "pat_1");

    expect(a.id).toEqual(expect.stringMatching(/^apt_/));
    expect(a.id).not.toBe(b.id);
  });

  it("sets status to confirmed", () => {
    const appointment = deriveAppointmentFromBooking(makeBooking(), "nadia-farooqi", "pat_1");
    expect(appointment.status).toBe("confirmed");
  });

  it("sets a sensible default duration", () => {
    const appointment = deriveAppointmentFromBooking(makeBooking(), "nadia-farooqi", "pat_1");
    expect(appointment.durationMinutes).toBeGreaterThan(0);
  });

  it.each([
    ["morning", "09:00"],
    ["afternoon", "13:00"],
    ["evening", "17:00"],
  ] as const)("maps preferredTime %s to %s by default", (preferredTime, expectedTime) => {
    const appointment = deriveAppointmentFromBooking(makeBooking({ preferredTime }), "nadia-farooqi", "pat_1");
    expect(appointment.time).toBe(expectedTime);
  });

  it("an explicit time overrides the preferredTime default", () => {
    const appointment = deriveAppointmentFromBooking(makeBooking({ preferredTime: "morning" }), "nadia-farooqi", "pat_1", "10:30");
    expect(appointment.time).toBe("10:30");
  });

  it("is deterministic in every field except the generated id", () => {
    const booking = makeBooking();
    const a = deriveAppointmentFromBooking(booking, "nadia-farooqi", "pat_1", "11:00");
    const b = deriveAppointmentFromBooking(booking, "nadia-farooqi", "pat_1", "11:00");

    const { id: idA, ...restA } = a;
    const { id: idB, ...restB } = b;
    expect(restA).toEqual(restB);
    expect(idA).not.toBe(idB);
  });
});
