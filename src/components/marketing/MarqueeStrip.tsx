import styles from "./MarqueeStrip.module.css";

interface MarqueeStripProps {
  items: string[];
}

export function MarqueeStrip({ items }: MarqueeStripProps) {
  // duplicated once so the CSS animation can loop seamlessly at -50%
  const loop = [...items, ...items];

  return (
    <div className={styles.marquee} aria-hidden="true">
      <div className={styles.track}>
        {loop.map((item, i) => (
          <span key={i}>
            {item} <span className={styles.dot}>&bull;</span>
          </span>
        ))}
      </div>
    </div>
  );
}
