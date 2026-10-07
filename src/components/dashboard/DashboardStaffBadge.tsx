import styles from "./DashboardStaffBadge.module.css";

interface DashboardStaffBadgeProps {
  clinicShortName: string;
}

/**
 * Represents "who this workspace is for" without inventing a fake
 * signed-in user — there's no auth in this milestone (see project
 * scope), so this is honestly a role/workspace label, not a profile
 * menu with dead links.
 */
export function DashboardStaffBadge({ clinicShortName }: DashboardStaffBadgeProps) {
  return (
    <div className={styles.badge}>
      <span className={styles.avatar} aria-hidden="true">
        {clinicShortName.slice(0, 2).toUpperCase()}
      </span>
      <span className={styles.text}>
        <span className={styles.role}>Front desk</span>
        <span className={styles.clinic}>{clinicShortName}</span>
      </span>
    </div>
  );
}
