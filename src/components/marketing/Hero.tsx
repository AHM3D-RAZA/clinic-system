"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { HeroCopy } from "@/types/content";
import styles from "./Hero.module.css";

interface HeroProps {
  eyebrow: string;
  copy: HeroCopy;
  bookingHref?: string;
}

const CARD_BASE_TRANSFORMS = [
  "translate(-84%,-58%) rotate(-13deg)",
  "translate(-38%,-52%) rotate(-4deg)",
  "translate(6%,-56%) rotate(6deg)",
  "translate(-58%,-38%) rotate(-22deg)",
  "translate(-8%,-32%) rotate(15deg)",
];

/**
 * The signature visual: a fanned stack of photo cards that gently
 * settle and part as the cursor moves, like objects arranged on a
 * table rather than a hero banner. Cards are color placeholders here
 * (see project notes) — swap each `.card` background for a real photo
 * per clinic without touching the interaction logic.
 */
export function Hero({ eyebrow, copy, bookingHref = "/book" }: HeroProps) {
  const dioramaRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const diorama = dioramaRef.current;
    if (!diorama) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let frame = 0;

    const onMove = (e: MouseEvent) => {
      const rect = diorama.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const onLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const animate = () => {
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const depth = (i + 1) * 6;
        const rot = curX * depth * 0.4;
        const shiftX = curX * depth;
        const shiftY = curY * depth * 0.6;
        card.style.transform = `translate(${shiftX}px, ${shiftY}px) rotate(${rot}deg) ${CARD_BASE_TRANSFORMS[i]}`;
      });
      frame = requestAnimationFrame(animate);
    };

    diorama.addEventListener("mousemove", onMove);
    diorama.addEventListener("mouseleave", onLeave);
    frame = requestAnimationFrame(animate);

    return () => {
      diorama.removeEventListener("mousemove", onMove);
      diorama.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  const cardWords = ["care", "calm", "smile", "", ""];

  return (
    <header className={styles.hero} id="home">
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.copy}>
          <span className="eyebrow">{eyebrow}</span>
          <h1>
            {copy.headlineLines.map((line) => (
              <span key={line} className={styles.headlineLine}>
                {line}
                <br />
              </span>
            ))}
            <em>{copy.emphasis}</em>
          </h1>
          <p className={styles.lede}>{copy.lede}</p>
          <div className={styles.actions}>
            <Link href={bookingHref} className="btnPrimary">
              Make an appointment
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
            <Link href="/#services" className="btnGhost">
              See what we do
            </Link>
          </div>
        </div>

        <div className={styles.diorama} ref={dioramaRef}>
          <div className={styles.badge}>{copy.badge}</div>
          {cardWords.map((word, i) => (
            <div
              key={i}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className={styles.card}
              style={{
                background: CARD_GRADIENTS[i],
                transform: CARD_BASE_TRANSFORMS[i],
                zIndex: i >= 3 ? 1 : undefined,
              }}
            >
              {word && (
                <div className={styles.swatchLabel}>
                  <span>{word}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.scrollCue}>
        <span className={styles.scrollLine} /> scroll
      </div>
    </header>
  );
}

const CARD_GRADIENTS = [
  "linear-gradient(155deg,var(--color-primary),var(--color-primary-deep))",
  "linear-gradient(155deg,var(--color-secondary),var(--color-secondary-deep))",
  "linear-gradient(155deg,var(--color-accent),color-mix(in srgb, var(--color-accent) 65%, black))",
  "linear-gradient(155deg,var(--color-accent-surface),color-mix(in srgb, var(--color-accent-surface) 65%, black))",
  "linear-gradient(155deg,var(--color-ink-soft),var(--color-ink))",
];
