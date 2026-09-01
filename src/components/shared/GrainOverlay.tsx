import styles from "./GrainOverlay.module.css";

/** A very light noise texture over the whole page so flat color never reads as vector-flat. */
export function GrainOverlay() {
  return <div className={styles.grain} aria-hidden="true" />;
}
