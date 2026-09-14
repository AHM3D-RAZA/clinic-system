import styles from "./TeamEmptyState.module.css";

interface TeamEmptyStateProps {
  query: string;
}

/** Mirrors the tone of the overview's "it's quiet in here" empty state. */
export function TeamEmptyState({ query }: TeamEmptyStateProps) {
  return (
    <div className={styles.empty}>
      <p className={styles.title}>No one matches &ldquo;{query}&rdquo;.</p>
      <p className={styles.body}>Try a different name, role, or clear the search.</p>
    </div>
  );
}
