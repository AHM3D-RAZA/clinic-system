import styles from "./BookingsEmptyState.module.css";

export function BookingsEmptyState() {
  return (
    <div className={styles.empty}>
      <p className={styles.title}>No requests yet.</p>
      <p className={styles.body}>Once someone books through the website, their request will land here.</p>
    </div>
  );
}
