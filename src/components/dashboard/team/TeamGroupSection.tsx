import type { TeamGroupKey, TeamMember } from "@/types/team";
import { TEAM_GROUP_LABELS } from "@/lib/team";
import { cn } from "@/lib/utils";
import { TeamMemberRow } from "./TeamMemberRow";
import styles from "./TeamGroupSection.module.css";

interface TeamGroupSectionProps {
  groupKey: TeamGroupKey;
  members: TeamMember[];
}

/** A named section of the roster ("Doctors", "Care team", …) and its rows. */
export function TeamGroupSection({ groupKey, members }: TeamGroupSectionProps) {
  return (
    <section className={styles.section}>
      <h2 className={cn("eyebrow", styles.label)}>
        {TEAM_GROUP_LABELS[groupKey]}
        <span className={styles.count}>{members.length}</span>
      </h2>
      <ul className={styles.list}>
        {members.map((member) => (
          <TeamMemberRow key={member.id} member={member} />
        ))}
      </ul>
    </section>
  );
}
