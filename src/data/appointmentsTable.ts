import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import type { Appointment } from "@/types/appointment";
import { APPOINTMENTS as SEED_APPOINTMENTS } from "./appointmentMockData";

/**
 * The appointment equivalent of `bookingRequestsTable` in
 * `data/mockDb.ts` — same file-backed-JSON-plus-`globalThis`-singleton
 * pattern, deliberately not a different persistence technology. See
 * the comment at the top of `mockDb.ts` for the full reasoning (why
 * file-backed instead of a bare array, why `globalThis` instead of a
 * module-level `let`); it applies here unchanged.
 *
 * Seeded from `data/appointmentMockData.ts`'s existing `APPOINTMENTS`
 * array on first initialization, so the demo data every other phase
 * already relies on keeps showing up exactly as before — this file
 * only adds the ability to durably create new records on top of it.
 */

const IS_TEST_ENV = !!process.env.VITEST;

/** Same reasoning as `mockDb.ts#resolveStorePath`, with its own env key so the two stores never collide in tests. */
function resolveStorePath(): string {
  if (!IS_TEST_ENV) {
    return join(process.cwd(), ".data", "appointments.json");
  }
  const envKey = "__ASTER_TEST_APPOINTMENTS_DB_PATH";
  if (!process.env[envKey]) {
    process.env[envKey] = join(tmpdir(), `aster-appointments-test-${randomUUID()}.json`);
  }
  return process.env[envKey]!;
}

const STORE_PATH = resolveStorePath();

function loadFromDisk(): Appointment[] | null {
  try {
    if (!existsSync(/* turbopackIgnore: true */ STORE_PATH)) return null;
    const raw = readFileSync(/* turbopackIgnore: true */ STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as Appointment[];
  } catch {
    return null;
  }
}

function saveToDisk(records: Appointment[]): void {
  const dir = dirname(STORE_PATH);
  if (!existsSync(/* turbopackIgnore: true */ dir)) {
    mkdirSync(/* turbopackIgnore: true */ dir, { recursive: true });
  }
  writeFileSync(/* turbopackIgnore: true */ STORE_PATH, JSON.stringify(records, null, 2), "utf-8");
}

declare global {
  var __asterMockAppointmentStores: Record<string, Appointment[]> | undefined;
}

function getStore(): Appointment[] {
  const stores = (globalThis.__asterMockAppointmentStores ??= {});
  if (!(STORE_PATH in stores)) {
    const initial = loadFromDisk() ?? [...SEED_APPOINTMENTS];
    stores[STORE_PATH] = initial;
    if (!existsSync(/* turbopackIgnore: true */ STORE_PATH)) {
      saveToDisk(initial);
    }
  }
  return stores[STORE_PATH]!;
}

function setStore(records: Appointment[]): void {
  const stores = (globalThis.__asterMockAppointmentStores ??= {});
  stores[STORE_PATH] = records;
}

export const appointmentsTable = {
  findAll(): Appointment[] {
    return [...getStore()];
  },
  findByClinic(clinicId: string): Appointment[] {
    return getStore().filter((a) => a.clinicId === clinicId);
  },
  insert(record: Appointment): Appointment {
    const next = [...getStore(), record];
    // Persist first, same reasoning as bookingRequestsTable.insert: if
    // the write fails, memory and disk never disagree about whether
    // this appointment actually got saved.
    saveToDisk(next);
    setStore(next);
    return record;
  },
  /** Test-only: restores the table to its seeded state, in memory AND on disk. */
  __resetForTests(): void {
    const seeded = [...SEED_APPOINTMENTS];
    setStore(seeded);
    saveToDisk(seeded);
  },
};
