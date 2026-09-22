import type { TeamMember } from "@/types/team";
import { teamAvailabilitySentence, teamPeerContextLine, teamReachabilityLine } from "@/lib/team";
import styles from "./TeamMemberDetail.module.css";

interface TeamMemberDetailProps {
  member: TeamMember;
  allMembers: TeamMember[];
  detailId: string;
}

/**
 * The "understanding a person" layer from roster → understanding a
 * person. Deliberately doesn't restate the row (name/role/responsibility
 * are already visible right above this). Instead it answers the three
 * things someone actually opens a person for: where they fit on the
 * team, whether they're around, and how to reach them.
 */
export function TeamMemberDetail({ member, allMembers, detailId }: TeamMemberDetailProps) {
  const reachability = teamReachabilityLine(member, allMembers);

  return (
    <li id={detailId} className={styles.detail} role="region" aria-label={`More about ${member.name}`}>
      <span className={styles.mark}>about {member.name.replace(/^Dr\.\s*/, "").split(" ")[0]}</span>

      <dl className={styles.facts}>
        <div className={styles.fact}>
          <dt>On the team</dt>
          <dd>{teamPeerContextLine(member, allMembers)}</dd>
        </div>
        <div className={styles.fact}>
          <dt>Today</dt>
          <dd>{teamAvailabilitySentence(member)}</dd>
        </div>
        <div className={styles.fact}>
          <dt>Reach {member.name.replace(/^Dr\.\s*/, "").split(" ")[0]}</dt>
          <dd>
            {reachability.href ? (
              <a className={styles.contactLink} href={reachability.href}>
                {reachability.text}
              </a>
            ) : (
              reachability.text
            )}
          </dd>
        </div>
      </dl>
    </li>
  );
}
