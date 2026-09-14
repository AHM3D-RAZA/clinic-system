import { describe, it, expect } from "vitest";
import { filterTeamMembers, groupTeamMembers, teamContextLine } from "./team";
import type { TeamMember } from "@/types/team";

function member(overrides: Partial<TeamMember>): TeamMember {
  return {
    id: "m1",
    name: "Pat Provider",
    initials: "PP",
    group: "careTeam",
    role: "Dental Hygienist",
    responsibility: "Does the thing.",
    availability: "inToday",
    swatch: "primary",
    ...overrides,
  };
}

describe("groupTeamMembers", () => {
  it("groups members into doctors, careTeam, frontOfHouse in that order", () => {
    const members = [
      member({ id: "front", group: "frontOfHouse" }),
      member({ id: "doc", group: "doctors" }),
      member({ id: "care", group: "careTeam" }),
    ];
    const sections = groupTeamMembers(members);
    expect(sections.map((s) => s.key)).toEqual(["doctors", "careTeam", "frontOfHouse"]);
  });

  it("omits a group entirely when it has no members", () => {
    const members = [member({ id: "doc", group: "doctors" })];
    const sections = groupTeamMembers(members);
    expect(sections.map((s) => s.key)).toEqual(["doctors"]);
  });

  it("returns no sections for an empty roster", () => {
    expect(groupTeamMembers([])).toEqual([]);
  });
});

describe("filterTeamMembers", () => {
  const members = [
    member({ id: "nadia", name: "Dr. Nadia Farooqi", role: "General & Cosmetic", group: "doctors" }),
    member({ id: "zoya", name: "Zoya Ahmed", role: "Front Desk Coordinator", group: "frontOfHouse" }),
  ];

  it("returns everyone when the filter is 'all' and the query is empty", () => {
    expect(filterTeamMembers(members, "all", "")).toHaveLength(2);
  });

  it("filters by group", () => {
    const result = filterTeamMembers(members, "doctors", "");
    expect(result.map((m) => m.id)).toEqual(["nadia"]);
  });

  it("matches a query against the name, case-insensitively", () => {
    const result = filterTeamMembers(members, "all", "zoya");
    expect(result.map((m) => m.id)).toEqual(["zoya"]);
  });

  it("matches a query against the role", () => {
    const result = filterTeamMembers(members, "all", "front desk");
    expect(result.map((m) => m.id)).toEqual(["zoya"]);
  });

  it("combines a group filter and a query", () => {
    const result = filterTeamMembers(members, "doctors", "zoya");
    expect(result).toHaveLength(0);
  });

  it("trims whitespace from the query", () => {
    const result = filterTeamMembers(members, "all", "  zoya  ");
    expect(result).toHaveLength(1);
  });
});

describe("teamContextLine", () => {
  it("says everyone's in when nobody is out today", () => {
    const members = [
      member({ id: "a", group: "doctors", availability: "inToday" }),
      member({ id: "b", group: "careTeam", availability: "inToday" }),
    ];
    expect(teamContextLine(members)).toContain("Everyone's in today.");
  });

  it("counts how many people are out today", () => {
    const members = [
      member({ id: "a", group: "doctors", availability: "inToday" }),
      member({ id: "b", group: "careTeam", availability: "offToday" }),
      member({ id: "c", group: "frontOfHouse", availability: "onLeave" }),
    ];
    expect(teamContextLine(members)).toContain("2 people are out today.");
  });

  it("uses singular phrasing for exactly one doctor and one person out", () => {
    const members = [
      member({ id: "a", group: "doctors", availability: "offToday" }),
      member({ id: "b", group: "careTeam", availability: "inToday" }),
    ];
    const line = teamContextLine(members);
    expect(line).toContain("1 doctor,");
    expect(line).toContain("1 person is out today.");
  });
});
