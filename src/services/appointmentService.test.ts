import { beforeEach, describe, expect, it } from "vitest";
import { appointmentService } from "@/services/appointmentService";
import { appointmentsTable } from "@/data/appointmentsTable";
import type { Appointment } from "@/types/appointment";

const SAMPLE_APPOINTMENT: Appointment = {
  id: "apt_service_test",
  clinicId: "aster",
  patientId: "pat_test",
  patientName: "Priya Nair",
  patientType: "new",
  doctorId: "nadia-farooqi",
  serviceId: "checkups-cleanings",
  date: "2099-03-01",
  time: "09:00",
  durationMinutes: 30,
  status: "confirmed",
};

describe("appointmentService", () => {
  beforeEach(() => {
    appointmentsTable.__resetForTests();
  });

  it("listByClinic returns the existing seeded appointments for that clinic", async () => {
    const appointments = await appointmentService.listByClinic("aster");
    expect(appointments.length).toBeGreaterThan(0);
    expect(appointments.every((a) => a.clinicId === "aster")).toBe(true);
  });

  it("listByClinic only returns appointments for the requested clinic", async () => {
    const asterAppointments = await appointmentService.listByClinic("aster");
    const otherAppointments = await appointmentService.listByClinic("some-other-clinic");
    expect(otherAppointments).toEqual([]);
    expect(asterAppointments.length).toBeGreaterThan(0);
  });

  it("create() actually persists to the data layer, not just returning a value", async () => {
    await appointmentService.create(SAMPLE_APPOINTMENT);

    const persisted = await appointmentService.listByClinic("aster");
    expect(persisted.some((a) => a.id === "apt_service_test")).toBe(true);
  });

  it("create() returns the exact record it was given, unmodified", async () => {
    const created = await appointmentService.create(SAMPLE_APPOINTMENT);
    expect(created).toEqual(SAMPLE_APPOINTMENT);
  });

  it("a newly created appointment coexists with the existing seeded data, not replacing it", async () => {
    const before = await appointmentService.listByClinic("aster");
    await appointmentService.create(SAMPLE_APPOINTMENT);
    const after = await appointmentService.listByClinic("aster");

    expect(after.length).toBe(before.length + 1);
  });
});
