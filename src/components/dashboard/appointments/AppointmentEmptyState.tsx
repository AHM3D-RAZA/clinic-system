import styles from "./AppointmentEmptyState.module.css";

interface AppointmentEmptyStateProps {
  dateLabel: string;
}

export function AppointmentEmptyState({ dateLabel }: AppointmentEmptyStateProps) {
  return (
    <div className={styles.quiet}>
      <p className={styles.quietTitle}>Nothing on the books for {dateLabel}.</p>
      <p className={styles.quietBody}>Once a booking is confirmed for this day, it&apos;ll show up here.</p>
    </div>
  );
}
