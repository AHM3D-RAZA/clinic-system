"use client";

import { useMemo, useState } from "react";
import type { TeamGroupKey, TeamMember } from "@/types/team";
import { filterTeamMembers, groupTeamMembers, teamContextLine } from "@/lib/team";
import { TeamMasthead } from "./TeamMasthead";
import { TeamFilterBar } from "./TeamFilterBar";
import { TeamGroupSection } from "./TeamGroupSection";
import { TeamEmptyState } from "./TeamEmptyState";

interface TeamPageProps {
  members: TeamMember[];
}

/**
 * The team workspace's only client boundary — everything above this
 * (data fetching) stays server-side. Owns just two bits of UI state
 * (which group tab is active, what's typed into search); the actual
 * grouping/filtering logic lives in lib/team.ts so this stays a thin
 * wiring layer, matching how DashboardOverview is structured.
 */
export function TeamPage({ members }: TeamPageProps) {
  const [groupFilter, setGroupFilter] = useState<TeamGroupKey | "all">("all");
  const [query, setQuery] = useState("");

  const visibleMembers = useMemo(
    () => filterTeamMembers(members, groupFilter, query),
    [members, groupFilter, query],
  );
  const sections = useMemo(() => groupTeamMembers(visibleMembers), [visibleMembers]);
  const contextLine = useMemo(() => teamContextLine(members), [members]);

  return (
    <div>
      <TeamMasthead contextLine={contextLine} />

      <TeamFilterBar
        activeGroup={groupFilter}
        onGroupChange={setGroupFilter}
        query={query}
        onQueryChange={setQuery}
      />

      {sections.length === 0 ? (
        <TeamEmptyState query={query} />
      ) : (
        sections.map((section) => (
          <TeamGroupSection key={section.key} groupKey={section.key} members={section.members} />
        ))
      )}
    </div>
  );
}
