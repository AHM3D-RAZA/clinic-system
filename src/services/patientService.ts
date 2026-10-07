import { patientsTable } from "@/data/patientsMockDb";
import { generateId } from "@/lib/utils";
import type { Patient } from "@/types/patient";

/**
 * The only part of the app that knows patient data currently lives in
 * a mock table. Callers only ever talk to this service. Swapping
 * `data/patientsMockDb.ts` for a real database/ORM later means changing
 * the function bodies below — nothing about this module's exported
 * shape needs to change.
 *
 * `async` on purpose, even though the mock work is synchronous — it
 * keeps call sites identical to what they'll look like once this hits
 * a real network/database call.
 */
async function listByClinic(clinicId: string): Promise<Patient[]> {
  return patientsTable.findByClinic(clinicId);
}

async function getById(id: string): Promise<Patient | undefined> {
  return patientsTable.findById(id);
}

/**
 * The narrowest reliable MVP match for "is this an existing patient?":
 * the same email address (trimmed, case-insensitive) within the same
 * clinic. Names aren't unique and phone numbers are formatted
 * inconsistently, so neither is used.
 */
async function findByEmail(clinicId: string, email: string): Promise<Patient | undefined> {
  const wanted = email.trim().toLowerCase();
  if (!wanted) return undefined;
  return patientsTable
    .findByClinic(clinicId)
    .find((p) => p.email.trim().toLowerCase() === wanted);
}

export type CreatePatientInput = Omit<Patient, "id" | "nextAppointment">;

/** Persists a new patient record and returns it with its generated id. */
async function create(input: CreatePatientInput): Promise<Patient> {
  return patientsTable.insert({ ...input, id: generateId("pat") });
}

export const patientService = { listByClinic, getById, findByEmail, create };
