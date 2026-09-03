import styles from "./ActivityStreamOverflowNote.module.css";

interface ActivityStreamOverflowNoteProps {
  message: string;
}

export function ActivityStreamOverflowNote({ message }: ActivityStreamOverflowNoteProps) {
  return (
    <li className={styles.item}>
      <span className={styles.rail} aria-hidden="true">
        <span className={styles.dot} />
      </span>
      <p className={styles.message}>{message}</p>
    </li>
  );
}
