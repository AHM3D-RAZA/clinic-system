import type { TeamMember } from "@/types/team";
import { swatchToCssVar, swatchToCssVarDeep } from "@/lib/theme";
import { TEAM_AVAILABILITY_LABELS } from "@/lib/team";
import styles from "./TeamMemberRow.module.css";

interface TeamMemberRowProps {
  member: TeamMember;
}

const AVAILABILITY_DOT: Record<TeamMember["availability"], string> = {
  inToday: styles.dotIn,
  offToday: styles.dotOff,
  onLeave: styles.dotLeave,
};

/**
 * One person, read the way a small clinic actually talks about its
 * people: who they are, what they're actually responsible for, and
 * whether they're around — not a database row of fields in boxes.
 */
export function TeamMemberRow({ member }: TeamMemberRowProps) {
  const avatarStyle = {
    background: `linear-gradient(155deg, ${swatchToCssVar(member.swatch)}, ${swatchToCssVarDeep(member.swatch)})`,
  };

  return (
    <li className={styles.row}>
      <span className={styles.avatar} style={avatarStyle} aria-hidden="true">
        {member.initials}
      </span>

      <div className={styles.content}>
        <p className={styles.who}>
          <span className={styles.name}>{member.name}</span>
          <span className={styles.role}> · {member.role}</span>
        </p>
        <p className={styles.responsibility}>{member.responsibility}</p>
      </div>

      <div className={styles.side}>
        <span className={styles.availability}>
          <span className={`${styles.dot} ${AVAILABILITY_DOT[member.availability]}`} aria-hidden="true" />
          {TEAM_AVAILABILITY_LABELS[member.availability]}
          {member.availabilityNote ? ` · ${member.availabilityNote}` : ""}
        </span>
        {member.contact && (
          <a className={styles.contact} href={member.contact.href}>
            {member.contact.label}
          </a>
        )}
      </div>
    </li>
  );
}
