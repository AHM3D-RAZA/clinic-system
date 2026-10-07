import type { StaffIdentity } from "@/lib/auth/types";
import { logoutAction } from "@/app/login/actions";
import styles from "./DashboardStaffBadge.module.css";

interface DashboardStaffBadgeProps {
  clinicShortName: string;
  staff: StaffIdentity;
  /** False while the badge sits inside a hidden drawer, so Sign out can't be tabbed to. */
  tabbable?: boolean;
}

/**
 * The signed-in person: their initials, name and (optional) title, with
 * a quiet sign-out beneath. Identity comes from the verified session —
 * never from a hardcoded label.
 */
export function DashboardStaffBadge({ clinicShortName, staff, tabbable = true }: DashboardStaffBadgeProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.badge}>
        <span className={styles.avatar} aria-hidden="true">
          {staff.initials}
        </span>
        <span className={styles.text}>
          <span className={styles.role}>{staff.name}</span>
          <span className={styles.clinic}>{staff.title ? `${staff.title} · ${clinicShortName}` : clinicShortName}</span>
        </span>
      </div>
      <form action={logoutAction}>
        <button type="submit" className={styles.signOut} tabIndex={tabbable ? 0 : -1}>
          Sign out
        </button>
      </form>
    </div>
  );
}
