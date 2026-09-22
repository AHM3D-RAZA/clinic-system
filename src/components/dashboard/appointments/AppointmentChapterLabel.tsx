import styles from "./AppointmentChapterLabel.module.css";

interface AppointmentChapterLabelProps {
  label: string;
  count: number;
}

export function AppointmentChapterLabel({ label, count }: AppointmentChapterLabelProps) {
  return (
    <li className={styles.item}>
      <h2 className={`eyebrow ${styles.label}`}>{label}</h2>
      <span className={styles.count}>
        {count} {count === 1 ? "appointment" : "appointments"}
      </span>
    </li>
  );
}
