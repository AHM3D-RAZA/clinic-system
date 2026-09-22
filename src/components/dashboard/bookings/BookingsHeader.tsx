import styles from "./BookingsHeader.module.css";

interface BookingsHeaderProps {
  contextLine: string;
}

/**
 * No "good morning" (that's the overview's voice) and no "the register"
 * (that's patients' voice) — this room is the front desk's inbox, so
 * the mark names it plainly.
 */
export function BookingsHeader({ contextLine }: BookingsHeaderProps) {
  return (
    <div className={styles.masthead}>
      <span className={styles.mark}>the front desk</span>
      <h1 className={styles.headline}>Bookings</h1>
      <p className={styles.context}>{contextLine}</p>
    </div>
  );
}
