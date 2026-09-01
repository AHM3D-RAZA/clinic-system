import type { ClinicContentBundle } from "@/types/content";
import { asterContentBundle } from "@/content/aster";

/**
 * Every onboarded clinic, keyed by clinicId. Adding a client is adding
 * an entry here (backed by a new `content/<clinic>/` folder) — nothing
 * else in the app changes.
 */
const CLINIC_REGISTRY: Record<string, ClinicContentBundle> = {
  [asterContentBundle.clinic.id]: asterContentBundle,
};

/**
 * The clinic this deployment serves. In a real multi-tenant setup this
 * would be resolved per-request (subdomain, custom domain, path prefix,
 * etc.) instead of being a constant — everything downstream already
 * takes a clinicId, so that swap is localized to this one function.
 */
export const DEFAULT_CLINIC_ID = asterContentBundle.clinic.id;

export function getClinicRegistry(): Record<string, ClinicContentBundle> {
  return CLINIC_REGISTRY;
}

export function getClinicContentById(clinicId: string): ClinicContentBundle | undefined {
  return CLINIC_REGISTRY[clinicId];
}
