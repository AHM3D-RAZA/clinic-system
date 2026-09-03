import styles from "./ActivityStreamToggle.module.css";

interface ActivityStreamToggleProps {
  label: string;
  expanded: boolean;
  onToggle: () => void;
}

/**
 * Renders as a rail node like any other stream item, but the "content"
 * is a plain-text button rather than a booking — visually it reads as
 * the timeline itself inviting you further down, not a UI control
 * bolted on top of it.
 */
export function ActivityStreamToggle({ label, expanded, onToggle }: ActivityStreamToggleProps) {
  return (
    <li className={styles.item}>
      <span className={styles.rail} aria-hidden="true">
        <span className={styles.dot} />
      </span>
      <button type="button" className={styles.button} onClick={onToggle} aria-expanded={expanded}>
        {label}
        <span className={styles.glyph} aria-hidden="true">
          {expanded ? "\u2191" : "\u2193"}
        </span>
      </button>
    </li>
  );
}
