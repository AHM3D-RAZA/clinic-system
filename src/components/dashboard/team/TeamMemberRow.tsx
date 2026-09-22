import type { TeamMember } from "@/types/team";
import { swatchToCssVar, swatchToCssVarDeep } from "@/lib/theme";
import { TEAM_AVAILABILITY_LABELS } from "@/lib/team";
import { cn } from "@/lib/utils";
import styles from "./TeamMemberRow.module.css";

interface TeamMemberRowProps {
  member: TeamMember;
  selected: boolean;
  detailId: string;
  onToggle: (id: string) => void;
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
 *
 * The name/role/responsibility block is a button that opens the
 * "understanding this person" detail layer (see TeamMemberDetail).
 * The availability + direct-contact link on the right stay outside
 * that button — a phone number is its own action, not a way to open
 * a profile, and nesting a real link inside a button isn't valid HTML.
 */
export function TeamMemberRow({ member, selected, detailId, onToggle }: TeamMemberRowProps) {
  const avatarStyle = {
    background: `linear-gradient(155deg, ${swatchToCssVar(member.swatch)}, ${swatchToCssVarDeep(member.swatch)})`,
  };

  return (
    <li className={cn(styles.row, selected && styles.rowSelected)}>
      <button
        type="button"
        className={styles.who}
        onClick={() => onToggle(member.id)}
        aria-expanded={selected}
        aria-controls={detailId}
      >
        <span className={styles.avatar} style={avatarStyle} aria-hidden="true">
          {member.initials}
        </span>

        <span className={styles.content}>
          <span className={styles.nameLine}>
            <span className={styles.name}>{member.name}</span>
            <span className={styles.role}> · {member.role}</span>
          </span>
          <span className={styles.responsibility}>{member.responsibility}</span>
        </span>
      </button>

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
