import styles from "./AppointmentsHeader.module.css";

interface AppointmentsHeaderProps {
  dateHeading: string;
  summaryLine: string;
}

export function AppointmentsHeader({ dateHeading, summaryLine }: AppointmentsHeaderProps) {
  return (
    <header className={styles.header}>
      <span className="eyebrow">the working schedule</span>
      <h1 className={styles.heading}>{dateHeading}</h1>
      <p className={styles.summary}>{summaryLine}</p>
    </header>
  );
}
