import styles from "./DashboardEmptyState.module.css";

interface DashboardEmptyStateProps {
  title: string;
  body: string;
}

export function DashboardEmptyState({ title, body }: DashboardEmptyStateProps) {
  return (
    <div className={styles.empty}>
      <p className={styles.title}>{title}</p>
      <p className={styles.body}>{body}</p>
    </div>
  );
}
