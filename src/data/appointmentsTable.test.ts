import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appointmentsTable } from "@/data/appointmentsTable";
import type { Appointment } from "@/types/appointment";

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: `apt_${Math.random().toString(36).slice(2, 10)}`,
    clinicId: "aster",
    patientId: "pat_test",
    patientName: "Persistence Test Patient",
    patientType: "new",
    doctorId: "nadia-farooqi",
    serviceId: "checkups-cleanings",
    date: "2099-06-01",
    time: "09:00",
    durationMinutes: 30,
    status: "confirmed",
    ...overrides,
  };
}

describe("appointmentsTable persistence", () => {
  beforeEach(() => {
    appointmentsTable.__resetForTests();
  });

  it("a created appointment exists in the store immediately", () => {
    appointmentsTable.insert(makeAppointment({ id: "apt_exists_check" }));
    expect(appointmentsTable.findAll().some((a) => a.id === "apt_exists_check")).toBe(true);
  });

  it("a retrieved appointment's stored data matches exactly what was written", () => {
    const appointment = makeAppointment({ id: "apt_match_check" });
    appointmentsTable.insert(appointment);

    const retrieved = appointmentsTable.findAll().find((a) => a.id === "apt_match_check");
    expect(retrieved).toEqual(appointment);
  });

  it("findByClinic only returns appointments for the requested clinic", () => {
    appointmentsTable.insert(makeAppointment({ id: "apt_aster", clinicId: "aster" }));
    appointmentsTable.insert(makeAppointment({ id: "apt_other", clinicId: "other-clinic" }));

    const asterAppointments = appointmentsTable.findByClinic("aster");
    expect(asterAppointments.some((a) => a.id === "apt_aster")).toBe(true);
    expect(asterAppointments.some((a) => a.id === "apt_other")).toBe(false);
  });

  it("multiple appointments coexist without overwriting each other", () => {
    appointmentsTable.insert(makeAppointment({ id: "apt_A", patientName: "Patient A" }));
    appointmentsTable.insert(makeAppointment({ id: "apt_B", patientName: "Patient B" }));

    const all = appointmentsTable.findAll();
    expect(all.find((a) => a.id === "apt_A")?.patientName).toBe("Patient A");
    expect(all.find((a) => a.id === "apt_B")?.patientName).toBe("Patient B");
  });

  it("existing seeded appointment data is still present after a reset", () => {
    appointmentsTable.__resetForTests();
    // The seed table (data/appointmentMockData.ts) always has records —
    // this proves the store didn't silently start empty.
    expect(appointmentsTable.findAll().length).toBeGreaterThan(0);
  });
});

describe("appointmentsTable persistence across a simulated server restart", () => {
  afterEach(() => {
    appointmentsTable.__resetForTests();
  });

  it("data written before a restart is still readable after the module reloads from disk", async () => {
    const before = await import("@/data/appointmentsTable");
    before.appointmentsTable.__resetForTests();
    before.appointmentsTable.insert(makeAppointment({ id: "apt_survives_restart", patientName: "Restart Test" }));
    expect(before.appointmentsTable.findAll().some((a) => a.id === "apt_survives_restart")).toBe(true);

    vi.resetModules();
    const after = await import("@/data/appointmentsTable");

    const survived = after.appointmentsTable.findAll().find((a) => a.id === "apt_survives_restart");
    expect(survived).toBeDefined();
    expect(survived?.patientName).toBe("Restart Test");
  });

  it("seed data is also present on a fresh module load (the store isn't empty on first run)", async () => {
    vi.resetModules();
    const fresh = await import("@/data/appointmentsTable");
    expect(fresh.appointmentsTable.findAll().length).toBeGreaterThan(0);
  });
});
