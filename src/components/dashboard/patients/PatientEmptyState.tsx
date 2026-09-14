import styles from "./PatientEmptyState.module.css";

interface PatientEmptyStateProps {
  query: string;
}

/**
 * Shown only when a search matches nothing — never on first load,
 * since the register always has patients in it by then. Echoes the
 * daybook's quiet/empty tone (dashed rule, soft copy) without reusing
 * that component directly.
 */
export function PatientEmptyState({ query }: PatientEmptyStateProps) {
  return (
    <div className={styles.empty}>
      <p className={styles.title}>No patients match &ldquo;{query}&rdquo;.</p>
      <p className={styles.body}>Try a different name, email, or phone number.</p>
    </div>
  );
}
