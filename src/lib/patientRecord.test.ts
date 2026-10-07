import { describe, it, expect } from "vitest";
import {
  findPatientAppointments,
  findPatientBookingRequests,
  splitPatientSchedule,
  withDerivedSchedule,
} from "./patientRecord";
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
    patientId: "pat_1",
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
  it("joins on patientId", () => {
    const appointments = [appointment(), appointment({ id: "apt_2", patientId: "pat_2" })];
    expect(findPatientAppointments(appointments, patient()).map((a) => a.id)).toEqual(["apt_1"]);
  });

  it("does not match on name — a same-named different patient is a different patient", () => {
    const appointments = [appointment({ patientId: "pat_other", patientName: "Maya Chen" })];
    expect(findPatientAppointments(appointments, patient())).toHaveLength(0);
  });

  it("still finds the appointment if the stored name snapshot differs", () => {
    const appointments = [appointment({ patientName: "M. Chen" })];
    expect(findPatientAppointments(appointments, patient())).toHaveLength(1);
  });
});

describe("findPatientBookingRequests", () => {
  it("joins on patientId", () => {
    const bookings = [booking({ patientId: "pat_1" }), booking({ id: "bkg_2", patientId: "pat_2" })];
    expect(findPatientBookingRequests(bookings, patient()).map((b) => b.id)).toEqual(["bkg_1"]);
  });

  it("does not match on email, and ignores requests with no patientId yet", () => {
    const bookings = [booking({ patientId: undefined })];
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

describe("withDerivedSchedule", () => {
  const today = "2026-06-15";

  it("derives nextAppointment from the earliest upcoming pending/confirmed appointment", () => {
    const appointments = [
      appointment({ id: "later", date: "2026-06-20" }),
      appointment({ id: "soon", date: "2026-06-16", time: "10:00", serviceId: "root-canal" }),
      appointment({ id: "cancelled", date: "2026-06-15", status: "cancelled" }),
      appointment({ id: "past", date: "2026-06-01" }),
    ];
    const result = withDerivedSchedule(patient(), appointments, today);
    expect(result.nextAppointment).toEqual({
      appointmentId: "soon",
      dateIso: "2026-06-16",
      time: "10:00",
      serviceId: "root-canal",
    });
  });

  it("has no nextAppointment without a real upcoming appointment, whatever was stored", () => {
    const stale = patient({
      nextAppointment: { appointmentId: "ghost", dateIso: "2026-07-01", time: "09:00", serviceId: "root-canal" },
    });
    expect(withDerivedSchedule(stale, [], today).nextAppointment).toBeUndefined();
  });

  it("ignores other patients' appointments", () => {
    const appointments = [appointment({ patientId: "pat_other", date: "2026-06-16" })];
    expect(withDerivedSchedule(patient(), appointments, today).nextAppointment).toBeUndefined();
  });

  it("moves lastVisit forward to a more recent completed appointment", () => {
    const appointments = [appointment({ status: "completed", date: "2026-06-14" })];
    const result = withDerivedSchedule(patient({ lastVisit: "2025-08-01" }), appointments, today);
    expect(result.lastVisit).toBe("2026-06-14");
  });

  it("never moves lastVisit backwards", () => {
    const appointments = [appointment({ status: "completed", date: "2024-01-01" })];
    const result = withDerivedSchedule(patient({ lastVisit: "2026-06-01" }), appointments, today);
    expect(result.lastVisit).toBe("2026-06-01");
  });

  it("does not mutate the stored patient", () => {
    const stored = patient();
    withDerivedSchedule(stored, [appointment({ date: "2026-06-16" })], today);
    expect(stored.nextAppointment).toBeUndefined();
  });
});
