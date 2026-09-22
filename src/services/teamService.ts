import type { TeamMember } from "@/types/team";
import { DEFAULT_CLINIC_ID } from "@/config/clinics";
import { asterTeam } from "@/data/team";

const TEAM_REGISTRY: Record<string, TeamMember[]> = {
  [DEFAULT_CLINIC_ID]: asterTeam,
};

/**
 * Resolves a clinic's team roster by id. Today this is a synchronous
 * lookup against local mock data; kept `async` — same as
 * `clinicService.getClinicContent` — so the page that calls it doesn't
 * need to change when this is backed by a real database read.
 */
async function listByClinic(clinicId: string): Promise<TeamMember[]> {
  const roster = TEAM_REGISTRY[clinicId];
  if (!roster) {
    throw new Error(`Unknown clinic id: "${clinicId}"`);
  }
  return roster;
}

export const teamService = { listByClinic };
