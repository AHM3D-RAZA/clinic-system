import { getClinicContentById } from "@/config/clinics";
import type { ClinicContentBundle } from "@/types/content";

/**
 * Resolves a clinic's full content bundle by id. Today this is a
 * synchronous lookup in a local registry; kept `async` so pages can
 * `await` it the same way they will once this is backed by an API
 * call or database read for a real multi-tenant deployment.
 */
async function getClinicContent(clinicId: string): Promise<ClinicContentBundle> {
  const bundle = getClinicContentById(clinicId);
  if (!bundle) {
    throw new Error(`Unknown clinic id: "${clinicId}"`);
  }
  return bundle;
}

export const clinicService = { getClinicContent };
