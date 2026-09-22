import { Fragment } from "react";
import type { TeamGroupKey, TeamMember } from "@/types/team";
import { TEAM_GROUP_LABELS } from "@/lib/team";
import { cn } from "@/lib/utils";
import { TeamMemberRow } from "./TeamMemberRow";
import { TeamMemberDetail } from "./TeamMemberDetail";
import styles from "./TeamGroupSection.module.css";

interface TeamGroupSectionProps {
  groupKey: TeamGroupKey;
  members: TeamMember[];
  allMembers: TeamMember[];
  selectedId: string | null;
  onToggleSelect: (id: string) => void;
}

/** A named section of the roster ("Doctors", "Care team", …) and its rows. */
export function TeamGroupSection({ groupKey, members, allMembers, selectedId, onToggleSelect }: TeamGroupSectionProps) {
  return (
    <section className={styles.section}>
      <h2 className={cn("eyebrow", styles.label)}>
        {TEAM_GROUP_LABELS[groupKey]}
        <span className={styles.count}>{members.length}</span>
      </h2>
      <ul className={styles.list}>
        {members.map((member) => {
          const detailId = `team-detail-${member.id}`;
          const selected = member.id === selectedId;
          return (
            <Fragment key={member.id}>
              <TeamMemberRow
                member={member}
                selected={selected}
                detailId={detailId}
                onToggle={onToggleSelect}
              />
              {selected && (
                <TeamMemberDetail member={member} allMembers={allMembers} detailId={detailId} />
              )}
            </Fragment>
          );
        })}
      </ul>
    </section>
  );
}
