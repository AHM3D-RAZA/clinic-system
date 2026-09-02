import { cn } from "@/lib/utils";
import styles from "./ActivityStreamChapterLabel.module.css";

interface ActivityStreamChapterLabelProps {
  label: string;
  note: string;
}

/**
 * A chapter divider inside the stream's single flat list. Deliberately an
 * `<h2>` (real document structure for screen readers) styled with the
 * site's existing hand-written "eyebrow" mark rather than a boxed panel
 * title — this is what ties the daybook back to the public site's DNA.
 */
export function ActivityStreamChapterLabel({ label, note }: ActivityStreamChapterLabelProps) {
  return (
    <li className={styles.item}>
      <h2 className={cn("eyebrow", styles.label)}>{label}</h2>
      <span className={styles.note}>{note}</span>
    </li>
  );
}
