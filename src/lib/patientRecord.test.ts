import { describe, it, expect } from "vitest";
import { findPatientAppointments, findPatientBookingRequests, splitPatientSchedule } from "./patientRecord";
import type { Patient } from "@/types/patient";
import type { Appointment } from "@/types/appointment";
import type { BookingRequest } from "@/types/booking";

function patient(overrides: Partial<Patient> = {}): Patient {
  return {
    id: "pat_1",
    clinicId: "aster",
    fullName: "Maya Chen",
    email: "maya.chen@example.com",
    phone: "+15550192231",
    patientType: "existing",
    primaryDoctorId: "nadia-farooqi",
    patientSince: "2024-01-01",
    ...overrides,
  };
}

function appointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: "apt_1",
    clinicId: "aster",
    patientName: "Maya Chen",
    patientType: "existing",
    doctorId: "nadia-farooqi",
    serviceId: "checkups-cleanings",
    date: "2026-06-15",
    time: "09:00",
    durationMinutes: 30,
    status: "confirmed",
    ...overrides,
  };
}

function booking(overrides: Partial<BookingRequest> = {}): BookingRequest {
  return {
    id: "bkg_1",
    clinicId: "aster",
    patient: { fullName: "Maya Chen", email: "maya.chen@example.com", phone: "+15550192231", patientType: "existing" },
    serviceId: "checkups-cleanings",
    preferredDate: "2026-06-10",
    preferredTime: "morning",
    status: "confirmed",
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("findPatientAppointments", () => {
  it("matches by name, case-insensitively", () => {
    const appointments = [appointment({ patientName: "MAYA CHEN" }), appointment({ id: "apt_2", patientName: "Owen Bricks" })];
    expect(findPatientAppointments(appointments, patient()).map((a) => a.id)).toEqual(["apt_1"]);
  });

  it("returns nothing for a patient with no matching appointments", () => {
    const appointments = [appointment({ patientName: "Someone Else" })];
    expect(findPatientAppointments(appointments, patient())).toHaveLength(0);
  });
});

describe("findPatientBookingRequests", () => {
  it("matches by email, case-insensitively", () => {
    const bookings = [booking({ patient: { ...booking().patient, email: "MAYA.CHEN@example.com" } })];
    expect(findPatientBookingRequests(bookings, patient()).map((b) => b.id)).toEqual(["bkg_1"]);
  });

  it("returns nothing when no booking shares the patient's email", () => {
    const bookings = [booking({ patient: { ...booking().patient, email: "someone.else@example.com" } })];
    expect(findPatientBookingRequests(bookings, patient())).toHaveLength(0);
  });
});

describe("splitPatientSchedule", () => {
  const today = "2026-06-15";

  it("separates future from past appointments", () => {
    const appointments = [
      appointment({ id: "future", date: "2026-06-20" }),
      appointment({ id: "today", date: "2026-06-15" }),
      appointment({ id: "past", date: "2026-06-01" }),
    ];
    const { upcoming, recent } = splitPatientSchedule(appointments, today);
    expect(upcoming.map((a) => a.id)).toEqual(["today", "future"]);
    expect(recent.map((a) => a.id)).toEqual(["past"]);
  });

  it("orders recent most-first and caps it to the given limit", () => {
    const appointments = [
      appointment({ id: "a", date: "2026-05-01" }),
      appointment({ id: "b", date: "2026-05-15" }),
      appointment({ id: "c", date: "2026-05-10" }),
    ];
    const { recent } = splitPatientSchedule(appointments, today, 2);
    expect(recent.map((a) => a.id)).toEqual(["b", "c"]);
  });
});
