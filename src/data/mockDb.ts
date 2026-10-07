import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import type { BookingRequest } from "@/types/booking";

/**
 * A stand-in for a real database table — file-backed JSON instead of a
 * bare in-memory array, specifically so it survives a dev/prod server
 * restart and behaves like a convincing mock database rather than
 * resetting to seed data every time the process restarts.
 *
 * Persistence is a plain seam: everything below writes to and reads
 * from `STORE_PATH` through `loadFromDisk`/`saveToDisk`. Swapping this
 * file's internals for a real database/ORM later is the only change
 * needed — `bookingService.ts` and everything above it stays the same,
 * because nothing outside this module touches the store directly.
 *
 * Concurrency note: writes are synchronous (`writeFileSync`) so two
 * requests can't interleave a partial write. That's the right tradeoff
 * for a small local mock store, not for a real production database.
 *
 * Singleton note: the in-memory table lives on `globalThis`, not a
 * plain module-level `let`. Next.js's per-route bundling can give an
 * API Route Handler and an App Router page SEPARATE instances of this
 * module within the same running server — a plain module-level
 * variable would then be two independent copies, so a booking created
 * through the API would silently never appear on a page that reads
 * through the other copy (confirmed while building the dashboard: a
 * freshly submitted booking wasn't showing up until this fix). Keying
 * by `STORE_PATH` on `globalThis` means every module instance in the
 * same process shares one true table, while a genuine process restart
 * (a fresh `globalThis`) still forces a real reload from disk.
 */

const IS_TEST_ENV = !!process.env.VITEST;

/**
 * In tests, each worker/process gets its own isolated store file so
 * test files never collide — but the SAME path is reused across a
 * `vi.resetModules()` + re-import within one test run (env vars, unlike
 * the module cache, aren't cleared by `vi.resetModules()`), which is
 * exactly what lets a test simulate "the server restarted" by
 * re-importing this module and checking the same file is read back.
 */
function resolveStorePath(): string {
  if (!IS_TEST_ENV) {
    return join(process.cwd(), ".data", "bookings.json");
  }
  const envKey = "__ASTER_TEST_DB_PATH";
  if (!process.env[envKey]) {
    process.env[envKey] = join(tmpdir(), `aster-bookings-test-${randomUUID()}.json`);
  }
  return process.env[envKey]!;
}

const STORE_PATH = resolveStorePath();

const SEED_BOOKING_REQUESTS: BookingRequest[] = [
  // A couple of seeded records so the data layer behaves like a system
  // that's already in use, not an empty shell.
  {
    id: "bkg_seed0001",
    clinicId: "aster",
    patient: {
      fullName: "Maya Chen",
      email: "maya.chen@example.com",
      phone: "+1 (555) 019-2231",
      patientType: "existing",
    },
    serviceId: "checkups-cleanings",
    preferredDate: nextWeekdayIso(3),
    preferredTime: "morning",
    notes: "Would like the same hygienist as last time if possible.",
    status: "confirmed",
    assignedDoctorId: "nadia-farooqi",
    createdAt: daysAgoIso(4),
    updatedAt: daysAgoIso(1),
  },
  {
    id: "bkg_seed0002",
    clinicId: "aster",
    patient: {
      fullName: "Owen Bricks",
      email: "owen.b@example.com",
      phone: "+1 (555) 048-7710",
      patientType: "new",
    },
    serviceId: "cosmetic-whitening",
    preferredDate: nextWeekdayIso(6),
    preferredTime: "afternoon",
    status: "pending",
    createdAt: daysAgoIso(1),
    updatedAt: daysAgoIso(1),
  },
];

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function nextWeekdayIso(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

/** Reads the store file. Returns `null` if it doesn't exist yet or is unreadable/corrupt — callers fall back to seed data in that case. */
function loadFromDisk(): BookingRequest[] | null {
  try {
    if (!existsSync(/* turbopackIgnore: true */ STORE_PATH)) return null;
    const raw = readFileSync(/* turbopackIgnore: true */ STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as BookingRequest[];
  } catch {
    // Corrupt or unreadable file: treat as "no persisted data" rather
    // than crashing the whole app on startup.
    return null;
  }
}

/**
 * Writes the full table to disk. Throws on failure (e.g. an
 * unwritable filesystem) rather than swallowing the error — callers
 * rely on this throwing so a failed booking write surfaces as a real
 * error instead of a false "success".
 */
function saveToDisk(records: BookingRequest[]): void {
  const dir = dirname(STORE_PATH);
  if (!existsSync(/* turbopackIgnore: true */ dir)) {
    mkdirSync(/* turbopackIgnore: true */ dir, { recursive: true });
  }
  writeFileSync(/* turbopackIgnore: true */ STORE_PATH, JSON.stringify(records, null, 2), "utf-8");
}

/**
 * The shared table, held on `globalThis` and keyed by `STORE_PATH` so
 * every module instance in this process — however many separate
 * bundles Next.js's per-route splitting produced — reads and writes
 * through the exact same array reference. See the singleton note
 * above for why a plain module-level variable isn't safe here.
 */
declare global {
  var __asterMockDbStores: Record<string, BookingRequest[]> | undefined;
}

function getStore(): BookingRequest[] {
  const stores = (globalThis.__asterMockDbStores ??= {});
  if (!(STORE_PATH in stores)) {
    const initial = loadFromDisk() ?? [...SEED_BOOKING_REQUESTS];
    stores[STORE_PATH] = initial;
    // Persist the seed immediately on first run so the file exists
    // from the very first read, and so "survives restart" is true
    // even before any booking has ever been created.
    if (!existsSync(/* turbopackIgnore: true */ STORE_PATH)) {
      saveToDisk(initial);
    }
  }
  return stores[STORE_PATH]!;
}

function setStore(records: BookingRequest[]): void {
  const stores = (globalThis.__asterMockDbStores ??= {});
  stores[STORE_PATH] = records;
}

export const bookingRequestsTable = {
  findAll(): BookingRequest[] {
    return [...getStore()];
  },
  findById(id: string): BookingRequest | undefined {
    return getStore().find((b) => b.id === id);
  },
  findByClinic(clinicId: string): BookingRequest[] {
    return getStore().filter((b) => b.clinicId === clinicId);
  },
  insert(record: BookingRequest): BookingRequest {
    const next = [...getStore(), record];
    // Persist first: if the write fails, the in-memory table stays
    // exactly as it was, so memory and disk never disagree about
    // whether this booking actually got saved.
    saveToDisk(next);
    setStore(next);
    return record;
  },
  updateStatus(id: string, status: BookingRequest["status"]): BookingRequest | undefined {
    const current = getStore();
    const existing = current.find((b) => b.id === id);
    if (!existing) return undefined;
    const updated: BookingRequest = { ...existing, status, updatedAt: new Date().toISOString() };
    const next = current.map((b) => (b.id === id ? updated : b));
    saveToDisk(next);
    setStore(next);
    return updated;
  },
  /**
   * Test-only: restores the table to its seeded state, in memory AND
   * on disk. Never called by application code — only by test setup, so
   * each test starts from a known baseline instead of leaking state
   * from the previous one.
   */
  __resetForTests(): void {
    const seeded = [...SEED_BOOKING_REQUESTS];
    setStore(seeded);
    saveToDisk(seeded);
  },
};
