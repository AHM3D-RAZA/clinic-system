import styles from "./ActivityStreamEmptyNote.module.css";

interface ActivityStreamEmptyNoteProps {
  message: string;
}

export function ActivityStreamEmptyNote({ message }: ActivityStreamEmptyNoteProps) {
  return (
    <li className={styles.item}>
      <span className={styles.rail} aria-hidden="true">
        <span className={styles.dot} />
      </span>
      <p className={styles.message}>{message}</p>
    </li>
  );
}
