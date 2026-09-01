import type { Testimonial } from "@/types/content";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import styles from "./QuoteBand.module.css";

interface QuoteBandProps {
  testimonial: Testimonial;
}

export function QuoteBand({ testimonial }: QuoteBandProps) {
  return (
    <RevealOnScroll as="section" className={styles.band}>
      <div className="wrap">
        <span className={styles.mark} aria-hidden="true">
          &ldquo;
        </span>
        <blockquote className={styles.quote}>{testimonial.quote}</blockquote>
        <cite className={styles.attribution}>&mdash; {testimonial.attribution}</cite>
      </div>
    </RevealOnScroll>
  );
}
