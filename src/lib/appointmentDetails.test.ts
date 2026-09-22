import { describe, it, expect } from "vitest";
import { availableStatusActions, describeAppointment, patientOriginPhrase } from "./appointmentDetails";
import type { Appointment } from "@/types/appointment";

function appointment(overrides: Partial<Appointment>): Appointment {
  return {
    id: "apt_1",
    clinicId: "aster",
    patientName: "Pat Patient",
    patientType: "new",
    doctorId: "nadia-farooqi",
    serviceId: "checkups-cleanings",
    date: "2026-06-01",
    time: "09:00",
    durationMinutes: 30,
    status: "confirmed",
    ...overrides,
  };
}

describe("patientOriginPhrase", () => {
  it("describes a new patient", () => {
    expect(patientOriginPhrase("new")).toBe("a new patient, on their first visit");
  });

  it("describes a returning patient", () => {
    expect(patientOriginPhrase("existing")).toBe("a returning patient");
  });
});

describe("describeAppointment", () => {
  it("composes a single-sentence summary", () => {
    const a = appointment({
      patientName: "Grace Coleman",
      patientType: "existing",
      time: "16:30",
      durationMinutes: 45,
    });
    expect(describeAppointment(a, "Cosmetic & whitening", "Dr. Nadia Farooqi", "Thursday, September 3")).toBe(
      "Grace Coleman is a returning patient, booked in for Cosmetic & whitening with Dr. Nadia Farooqi — Thursday, September 3 at 4:30 PM (45 min).",
    );
  });

  it("uses the new-patient phrasing for a first visit", () => {
    const a = appointment({ patientName: "Owen Bricks", patientType: "new", time: "09:00", durationMinutes: 30 });
    expect(describeAppointment(a, "Check-ups & cleanings", "Dr. Nadia Farooqi", "Today")).toBe(
      "Owen Bricks is a new patient, on their first visit, booked in for Check-ups & cleanings with Dr. Nadia Farooqi — Today at 9:00 AM (30 min).",
    );
  });
});

describe("availableStatusActions", () => {
  it("offers confirm and cancel from pending", () => {
    expect(availableStatusActions("pending")).toEqual([
      { label: "Confirm appointment", nextStatus: "confirmed" },
      { label: "Cancel appointment", nextStatus: "cancelled" },
    ]);
  });

  it("offers confirm and cancel from contacted", () => {
    expect(availableStatusActions("contacted")).toEqual([
      { label: "Confirm appointment", nextStatus: "confirmed" },
      { label: "Cancel appointment", nextStatus: "cancelled" },
    ]);
  });

  it("offers only cancel from confirmed", () => {
    expect(availableStatusActions("confirmed")).toEqual([{ label: "Cancel appointment", nextStatus: "cancelled" }]);
  });

  it("offers nothing from a terminal completed state", () => {
    expect(availableStatusActions("completed")).toEqual([]);
  });

  it("offers nothing from a terminal cancelled state", () => {
    expect(availableStatusActions("cancelled")).toEqual([]);
  });
});
