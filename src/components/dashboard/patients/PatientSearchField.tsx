import styles from "./PatientSearchField.module.css";

interface PatientSearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  totalCount: number;
}

/**
 * An underlined field rather than a boxed/pill search bar — meant to
 * read as part of the page's own typography, the way a librarian's
 * index card search would, not as a bolted-on admin-panel control.
 * The result count doubles as a live region so screen reader users
 * hear the match count update as they type.
 */
export function PatientSearchField({ value, onChange, resultCount, totalCount }: PatientSearchFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor="patient-search" className={styles.label}>
        Search the register
      </label>
      <input
        id="patient-search"
        type="search"
        className={styles.input}
        placeholder="Name, email, or phone"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
      />
      <p className={styles.count} aria-live="polite">
        {value.trim()
          ? `${resultCount} of ${totalCount} patients`
          : `${totalCount} patients`}
      </p>
    </div>
  );
}
