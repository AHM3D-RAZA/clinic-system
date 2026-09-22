import styles from "./PatientsHeader.module.css";

/**
 * A quiet masthead — deliberately not a repeat of the overview's
 * greeting copy (no "good morning" here; this room isn't about time
 * of day, it's about the record book itself).
 */
export function PatientsHeader() {
  return (
    <div className={styles.masthead}>
      <span className={styles.mark}>the register</span>
      <h1 className={styles.headline}>Patients</h1>
      <p className={styles.context}>Every patient on file, in one place.</p>
    </div>
  );
}
