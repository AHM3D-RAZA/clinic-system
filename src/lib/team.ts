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

/**
 * Full-sentence version of a member's availability for the detail
 * layer — the roster row uses a compact "Off today · back Thursday"
 * fragment; the detail view reads better as an actual sentence.
 */
export function teamAvailabilitySentence(member: TeamMember): string {
  const note = member.availabilityNote;
  const capitalizedNote = note ? note.charAt(0).toUpperCase() + note.slice(1) : "";

  switch (member.availability) {
    case "inToday":
      return "In today.";
    case "offToday":
      return note ? `Not in today. ${capitalizedNote}.` : "Not in today.";
    case "onLeave":
      return note ? `On leave. ${capitalizedNote}.` : "On leave.";
    default:
      return "";
  }
}

/**
 * Places a person within the wider roster for the detail layer —
 * genuinely new context (how big is their team, who else is in it),
 * not a restatement of the row's own fields.
 */
export function teamPeerContextLine(member: TeamMember, allMembers: TeamMember[]): string {
  const peers = allMembers.filter((m) => m.group === member.group && m.id !== member.id);
  const groupLabel = TEAM_GROUP_LABELS[member.group].toLowerCase();

  if (peers.length === 0) {
    return `The only person currently in ${groupLabel}.`;
  }
  const peerNames = peers.map((p) => p.name.replace(/^Dr\.\s*/, ""));
  const names =
    peerNames.length === 1
      ? peerNames[0]
      : `${peerNames.slice(0, -1).join(", ")} and ${peerNames[peerNames.length - 1]}`;
  return `Part of ${groupLabel}, alongside ${names}.`;
}

/**
 * How to actually reach this person for the detail layer. Clinical
 * staff usually don't take direct calls, so when a member has no
 * `contact` of their own, this falls back to whoever on the roster
 * does front-desk work — a real answer instead of a blank field.
 */
export function teamReachabilityLine(
  member: TeamMember,
  allMembers: TeamMember[],
): { text: string; href?: string } {
  if (member.contact) {
    return { text: member.contact.label, href: member.contact.href };
  }
  const frontDesk = allMembers.find((m) => m.group === "frontOfHouse" && m.contact);
  if (frontDesk?.contact) {
    return { text: `Reachable through the front desk — ${frontDesk.contact.label}`, href: frontDesk.contact.href };
  }
  return { text: "Reachable through the front desk." };
}
