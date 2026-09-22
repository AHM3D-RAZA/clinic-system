import type { TeamAvailability, TeamGroupKey, TeamMember } from "@/types/team";

/** Display order for the roster's three sections. */
export const TEAM_GROUP_ORDER: TeamGroupKey[] = ["doctors", "careTeam", "frontOfHouse"];

export const TEAM_GROUP_LABELS: Record<TeamGroupKey, string> = {
  doctors: "Doctors",
  careTeam: "Care team",
  frontOfHouse: "Front of house",
};

export const TEAM_AVAILABILITY_LABELS: Record<TeamAvailability, string> = {
  inToday: "In today",
  offToday: "Off today",
  onLeave: "On leave",
};

/** Groups a flat roster into its three sections, in display order, skipping empty ones. */
export function groupTeamMembers(members: TeamMember[]): { key: TeamGroupKey; members: TeamMember[] }[] {
  return TEAM_GROUP_ORDER.map((key) => ({
    key,
    members: members.filter((member) => member.group === key),
  })).filter((section) => section.members.length > 0);
}

/** One sentence summarizing the roster for the masthead — no stat tiles. */
export function teamContextLine(members: TeamMember[]): string {
  const doctorCount = members.filter((m) => m.group === "doctors").length;
  const otherCount = members.length - doctorCount;
  const outCount = members.filter((m) => m.availability !== "inToday").length;

  const doctorsPart = doctorCount === 1 ? "1 doctor" : `${doctorCount} doctors`;
  const othersPart = otherCount === 1 ? "1 more person" : `${otherCount} more people`;
  const base = `${doctorsPart}, ${othersPart} keeping the studio running.`;

  if (outCount === 0) {
    return `${base} Everyone's in today.`;
  }
  const outPart = outCount === 1 ? "1 person is" : `${outCount} people are`;
  return `${base} ${outPart} out today.`;
}

/**
 * Filters the roster by group and a free-text query, matched against
 * name and role. Case-insensitive, trims whitespace.
 */
export function filterTeamMembers(
  members: TeamMember[],
  groupFilter: TeamGroupKey | "all",
  query: string,
): TeamMember[] {
  const normalizedQuery = query.trim().toLowerCase();

  return members.filter((member) => {
    const matchesGroup = groupFilter === "all" || member.group === groupFilter;
    if (!matchesGroup) return false;
    if (!normalizedQuery) return true;
    return (
      member.name.toLowerCase().includes(normalizedQuery) ||
      member.role.toLowerCase().includes(normalizedQuery)
    );
  });
}
