import styles from "./ClosedRequestsToggle.module.css";

interface ClosedRequestsToggleProps {
  count: number;
  expanded: boolean;
  onToggle: () => void;
}

/**
 * Closed requests need nothing from anyone, so they default to
 * out-of-sight rather than taking up room the "needs a reply" bucket
 * should own. One plain-text toggle for the whole bucket — not a
 * progressive "show N more" like the overview's daybook, since there's
 * no curation question here: it's either relevant right now or it
 * isn't.
 */
export function ClosedRequestsToggle({ count, expanded, onToggle }: ClosedRequestsToggleProps) {
  return (
    <button type="button" className={styles.button} onClick={onToggle} aria-expanded={expanded}>
      {expanded ? "Hide closed requests" : `Show ${count} closed ${count === 1 ? "request" : "requests"}`}
      <span className={styles.glyph} aria-hidden="true">
        {expanded ? "\u2191" : "\u2193"}
      </span>
    </button>
  );
}
