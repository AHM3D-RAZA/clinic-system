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
  clinicShortName: string;
}

/**
 * The team workspace's only client boundary — everything above this
 * (data fetching) stays server-side. Owns three bits of UI state
 * (active group tab, search text, and which member is expanded); the
 * actual grouping/filtering/context logic lives in lib/team.ts so this
 * stays a thin wiring layer, matching how DashboardOverview is structured.
 */
export function TeamPage({ members, clinicShortName }: TeamPageProps) {
  const [groupFilter, setGroupFilter] = useState<TeamGroupKey | "all">("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visibleMembers = useMemo(
    () => filterTeamMembers(members, groupFilter, query),
    [members, groupFilter, query],
  );
  const sections = useMemo(() => groupTeamMembers(visibleMembers), [visibleMembers]);
  const contextLine = useMemo(() => teamContextLine(members), [members]);

  const handleToggleSelect = (id: string) => {
    setSelectedId((current) => (current === id ? null : id));
  };

  return (
    <div>
      <TeamMasthead contextLine={contextLine} clinicShortName={clinicShortName} />

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
          <TeamGroupSection
            key={section.key}
            groupKey={section.key}
            members={section.members}
            allMembers={members}
            selectedId={selectedId}
            onToggleSelect={handleToggleSelect}
          />
        ))
      )}
    </div>
  );
}
