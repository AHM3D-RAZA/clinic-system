import type { SwatchKey } from "./content";

/**
 * Which room of the clinic a person belongs to. Kept as three groups
 * (not just "doctor vs staff") because that's how a small clinic
 * actually thinks about its people day to day — the person who does
 * a root canal, the person who cleans your teeth, and the person who
 * booked you in are different jobs, not different tiers.
 */
export type TeamGroupKey = "doctors" | "careTeam" | "frontOfHouse";

/**
 * Whether someone is around today. Deliberately words, not a generic
 * "active/inactive" toggle — "on leave until March" reads like a real
 * clinic, "inactive" reads like a disabled database row.
 */
export type TeamAvailability = "inToday" | "offToday" | "onLeave";

export interface TeamContact {
  /** What's shown, e.g. "Ext. 102" or "front desk". */
  label: string;
  /** tel:/mailto: link, if this person is directly reachable. */
  href?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  group: TeamGroupKey;
  /** Job title as the clinic would say it out loud, e.g. "Endodontics". */
  role: string;
  /** One human sentence on what they actually do day to day. */
  responsibility: string;
  availability: TeamAvailability;
  /** Short note explaining the availability, e.g. "back Thursday". */
  availabilityNote?: string;
  contact?: TeamContact;
  swatch: SwatchKey;
}
