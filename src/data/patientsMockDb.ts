import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import type { Patient } from "@/types/patient";
import { SEED_CLINIC_ID, SEED_PATIENTS, seedDate, type SeedPatient } from "./seedGraph";

/**
 * The patient equivalent of `bookingRequestsTable` / `appointmentsTable`
 * — the same file-backed-JSON-plus-`globalThis`-singleton pattern (see
 * the comment at the top of `mockDb.ts` for the reasoning), not a
 * different persistence technology. It's file-backed now because
 * confirming a booking for a genuinely new patient creates a patient
 * record, and that has to survive a refresh like everything else.
 *
 * Seeded from the canonical seed graph (`seedGraph.ts`) — the identity
 * fields are declared once there. `nextAppointment` is deliberately not
 * seeded or stored: it's derived from real appointments at read time.
 */

const IS_TEST_ENV = !!process.env.VITEST;

function resolveStorePath(): string {
  if (!IS_TEST_ENV) {
    return join(process.cwd(), ".data", "patients.json");
  }
  const envKey = "__ASTER_TEST_PATIENTS_DB_PATH";
  if (!process.env[envKey]) {
    process.env[envKey] = join(tmpdir(), `aster-patients-test-${randomUUID()}.json`);
  }
  return process.env[envKey]!;
}

const STORE_PATH = resolveStorePath();

function toPatient(seed: SeedPatient): Patient {
  return {
    id: seed.id,
    clinicId: SEED_CLINIC_ID,
    fullName: seed.fullName,
    email: seed.email,
    phone: seed.phone,
    patientType: seed.patientType,
    primaryDoctorId: seed.primaryDoctorId,
    patientSince: seedDate(-seed.patientSinceDaysAgo),
    ...(seed.lastVisitDaysAgo !== undefined ? { lastVisit: seedDate(-seed.lastVisitDaysAgo) } : {}),
    ...(seed.attentionNote ? { attentionNote: seed.attentionNote } : {}),
  };
}

function seedPatients(): Patient[] {
  return SEED_PATIENTS.map(toPatient);
}

function loadFromDisk(): Patient[] | null {
  try {
    if (!existsSync(/* turbopackIgnore: true */ STORE_PATH)) return null;
    const parsed = JSON.parse(readFileSync(/* turbopackIgnore: true */ STORE_PATH, "utf-8"));
    return Array.isArray(parsed) ? (parsed as Patient[]) : null;
  } catch {
    return null;
  }
}

function saveToDisk(records: Patient[]): void {
  const dir = dirname(STORE_PATH);
  if (!existsSync(/* turbopackIgnore: true */ dir)) {
    mkdirSync(/* turbopackIgnore: true */ dir, { recursive: true });
  }
  writeFileSync(/* turbopackIgnore: true */ STORE_PATH, JSON.stringify(records, null, 2), "utf-8");
}

declare global {
  var __asterMockPatientStores: Record<string, Patient[]> | undefined;
}

function getStore(): Patient[] {
  const stores = (globalThis.__asterMockPatientStores ??= {});
  if (!(STORE_PATH in stores)) {
    const initial = loadFromDisk() ?? seedPatients();
    stores[STORE_PATH] = initial;
    if (!existsSync(/* turbopackIgnore: true */ STORE_PATH)) {
      saveToDisk(initial);
    }
  }
  return stores[STORE_PATH]!;
}

function setStore(records: Patient[]): void {
  const stores = (globalThis.__asterMockPatientStores ??= {});
  stores[STORE_PATH] = records;
}

export const patientsTable = {
  findAll(): Patient[] {
    return [...getStore()];
  },
  findByClinic(clinicId: string): Patient[] {
    return getStore().filter((p) => p.clinicId === clinicId);
  },
  findById(id: string): Patient | undefined {
    return getStore().find((p) => p.id === id);
  },
  /** Persist first, then update memory — same reasoning as the other tables' `insert`. */
  insert(record: Patient): Patient {
    const next = [...getStore(), record];
    saveToDisk(next);
    setStore(next);
    return record;
  },
  /** Test-only: restores the table to its seeded state, in memory AND on disk. */
  __resetForTests(): void {
    const seeded = seedPatients();
    setStore(seeded);
    saveToDisk(seeded);
  },
};
