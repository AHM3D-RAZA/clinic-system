import { beforeEach, describe, expect, it, vi } from "vitest";
import { bookingRequestsTable } from "@/data/mockDb";
import { appointmentsTable } from "@/data/appointmentsTable";
import { patientsTable } from "@/data/patientsMockDb";
import { asterTeam } from "@/data/team";
import { asterContentBundle } from "@/content/aster";
import { asterClinicConfig as asterClinic } from "@/content/aster/clinic";
import { DOCTOR, SEED_PATIENTS, SERVICE } from "@/data/seedGraph";

const doctorIds = Object.values(DOCTOR).map((d) => d.id);
const serviceIds = Object.values(SERVICE);

beforeEach(() => {
  bookingRequestsTable.__resetForTests();
  appointmentsTable.__resetForTests();
  patientsTable.__resetForTests();
});

describe("canonical seed graph — identities", () => {
  it("every seed patient has a unique id and a unique email", () => {
    const ids = SEED_PATIENTS.map((p) => p.id);
    const emails = SEED_PATIENTS.map((p) => p.email.toLowerCase());
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(emails).size).toBe(emails.length);
  });

  it("doctors and services are the ones the public content and the team roster know", () => {
    const contentDoctors = asterContentBundle.doctors.map((d) => d.id);
    const contentServices = asterContentBundle.services.map((s) => s.id);
    const teamDoctors = asterTeam.filter((m) => m.group === "doctors").map((m) => m.id);
    for (const id of doctorIds) {
      expect(contentDoctors).toContain(id);
      expect(teamDoctors).toContain(id);
    }
    for (const id of serviceIds) expect(contentServices).toContain(id);
  });

  it("the patient table is seeded from the graph, every primary doctor is a real doctor, and nothing stores a next appointment", () => {
    const patients = patientsTable.findByClinic("aster");
    expect(patients.map((p) => p.id).sort()).toEqual(SEED_PATIENTS.map((p) => p.id).sort());
    for (const p of patients) {
      expect(doctorIds).toContain(p.primaryDoctorId);
      expect(p.nextAppointment).toBeUndefined();
    }
  });
});

describe("canonical seed graph — appointments", () => {
  it("every appointment references a real patient, doctor and service", () => {
    const patientIds = new Set(patientsTable.findAll().map((p) => p.id));
    for (const a of appointmentsTable.findAll()) {
      expect(patientIds.has(a.patientId)).toBe(true);
      expect(doctorIds).toContain(a.doctorId);
      expect(serviceIds).toContain(a.serviceId);
    }
  });

  it("the name/type snapshot on each appointment matches its patient", () => {
    for (const a of appointmentsTable.findAll()) {
      const patient = patientsTable.findById(a.patientId);
      expect(a.patientName).toBe(patient?.fullName);
      expect(a.patientType).toBe(patient?.patientType);
    }
  });
});

describe("canonical seed graph — booking requests", () => {
  it("every booking that carries a patientId points at a real patient whose details match the snapshot", () => {
    for (const b of bookingRequestsTable.findAll()) {
      if (!b.patientId) continue;
      const patient = patientsTable.findById(b.patientId);
      expect(patient).toBeDefined();
      expect(b.patient.fullName).toBe(patient?.fullName);
      expect(b.patient.email).toBe(patient?.email);
      expect(b.patient.patientType).toBe(patient?.patientType);
    }
  });

  it("the only seeded booking without a patientId is the cancelled inquiry that never became a patient", () => {
    const unlinked = bookingRequestsTable.findAll().filter((b) => !b.patientId);
    expect(unlinked.map((b) => b.id)).toEqual(["bkg_seed0008"]);
    expect(unlinked[0].status).toBe("cancelled");
  });

  it("every booking uses a real service, and any assigned doctor is a real doctor", () => {
    for (const b of bookingRequestsTable.findAll()) {
      expect(serviceIds).toContain(b.serviceId);
      if (b.assignedDoctorId) expect(doctorIds).toContain(b.assignedDoctorId);
    }
  });

  it("every confirmed or completed booking has exactly one appointment that agrees with it", () => {
    const appointments = appointmentsTable.findAll();
    for (const b of bookingRequestsTable.findAll()) {
      if (b.status !== "confirmed" && b.status !== "completed") continue;
      const linked = appointments.filter((a) => a.sourceBookingId === b.id);
      expect(linked, `appointment for ${b.id}`).toHaveLength(1);
      expect(linked[0].patientId).toBe(b.patientId);
      expect(linked[0].doctorId).toBe(b.assignedDoctorId);
      expect(linked[0].serviceId).toBe(b.serviceId);
      expect(linked[0].date).toBe(b.preferredDate);
    }
  });
});

describe("patients table persistence", () => {
  it("a created patient survives a module reload", async () => {
    const before = await import("@/data/patientsMockDb");
    before.patientsTable.__resetForTests();
    before.patientsTable.insert({
      id: "pat_survives_restart",
      clinicId: "aster",
      fullName: "Restart Patient",
      email: "restart@example.com",
      phone: "+15550000000",
      patientType: "new",
      primaryDoctorId: DOCTOR.nadia.id,
      patientSince: "2099-01-01",
    });

    vi.resetModules();
    const after = await import("@/data/patientsMockDb");
    expect(after.patientsTable.findById("pat_survives_restart")?.fullName).toBe("Restart Patient");
  });
});

describe("clinic operating hours", () => {
  it("are structured alongside the display string, and consistent with it", () => {
    expect(asterClinic.contact.hours).toBe("Tue–Sat, 9am–6pm");
    expect(asterClinic.operatingHours).toEqual({ openDays: [2, 3, 4, 5, 6], opensAt: "09:00", closesAt: "18:00" });
  });
});
