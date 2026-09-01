import type { StatItem } from "@/types/content";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import styles from "./IntroSection.module.css";

interface IntroSectionProps {
  headline: string;
  copy: string;
  stats: StatItem[];
}

export function IntroSection({ headline, copy, stats }: IntroSectionProps) {
  return (
    <RevealOnScroll as="section" className={styles.intro}>
      <div className={`wrap ${styles.grid}`}>
        <div>
          <span className="sectionLabel">The short version</span>
          <h2>{headline}</h2>
        </div>
        <div>
          <p className={styles.copy}>{copy}</p>
          <div className={styles.stats}>
            {stats.map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <b>{stat.value}</b>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RevealOnScroll>
  );
}
