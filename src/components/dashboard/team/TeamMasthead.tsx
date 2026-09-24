import styles from "./TeamMasthead.module.css";

interface TeamMasteheadProps {
  contextLine: string;
  clinicShortName: string;
}

/**
 * The team page's masthead — same device as the overview's
 * OverviewGreeting (hand-written eyebrow + display headline), so the
 * two pages read as the same product. The context line is a sentence,
 * not a row of stat tiles, on purpose (see project brief: "unnecessary
 * statistics").
 */
export function TeamMasthead({ contextLine, clinicShortName }: TeamMasteheadProps) {
  return (
    <div className={styles.masthead}>
      <span className={styles.mark}>the people</span>
      <h1 className={styles.headline}>Everyone behind {clinicShortName}.</h1>
      <p className={styles.context}>{contextLine}</p>
    </div>
  );
}
