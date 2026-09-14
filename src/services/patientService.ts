import { patientsTable } from "@/data/patientsMockDb";
import type { Patient } from "@/types/patient";

/**
 * The only part of the app that knows patient data currently lives in
 * a mock table. Callers (the Patients workspace today) only ever talk
 * to this service. Swapping `data/patientsMockDb.ts` for a real
 * database/ORM later means changing the function bodies below —
 * nothing about this module's exported shape needs to change.
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

export const patientService = { listByClinic, getById };
