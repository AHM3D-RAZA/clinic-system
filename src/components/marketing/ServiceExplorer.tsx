"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { ServiceOffering } from "@/types/content";
import { swatchToCssVar, swatchToCssVarDeep } from "@/lib/theme";
import { cn } from "@/lib/utils";
import styles from "./ServiceExplorer.module.css";

interface ServiceExplorerProps {
  services: ServiceOffering[];
  bookingHref?: string;
}

/**
 * Not six generic icon cards — a big typographic index. Hovering a row
 * slides the name over and pops a small floating color card near the
 * cursor instead of an icon; clicking sends the visitor straight into
 * booking with that service pre-selected.
 */
export function ServiceExplorer({ services, bookingHref = "/book" }: ServiceExplorerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [peekPos, setPeekPos] = useState({ x: 0, y: 0 });
  const listRef = useRef<HTMLUListElement | null>(null);

  const hovered = services.find((s) => s.id === hoveredId) ?? null;

  const handleMouseMove = (e: React.MouseEvent) => {
    setPeekPos({ x: e.clientX + 26, y: e.clientY - 140 });
  };

  return (
    <section className={styles.services} id="services">
      <div className="wrap">
        <div className={styles.head}>
          <div>
            <span className={cn("sectionLabel", styles.label)}>What we do</span>
            <h2>Treatments, without the jargon.</h2>
          </div>
          <p>Hover a line to peek inside — or just tap it, everything&apos;s explained plainly once you&apos;re in.</p>
        </div>

        <ul className={styles.list} ref={listRef} onMouseMove={handleMouseMove}>
          {services.map((service, i) => (
            <li key={service.id}>
              <Link
                href={`${bookingHref}?service=${service.id}`}
                className={styles.row}
                onMouseEnter={() => setHoveredId(service.id)}
                onMouseLeave={() => setHoveredId((current) => (current === service.id ? null : current))}
              >
                <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.name}>{service.name}</span>
                <span className={styles.tag}>{service.tag}</span>
                <span className={styles.arrow}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div
        className={cn(styles.peek, hovered && styles.peekVisible)}
        style={{
          left: peekPos.x,
          top: peekPos.y,
          background: hovered
            ? `linear-gradient(155deg, ${swatchToCssVar(hovered.swatch)}, ${swatchToCssVarDeep(hovered.swatch)})`
            : undefined,
        }}
        aria-hidden="true"
      >
        <div className={styles.peekLabel}>
          <span>{hovered?.accentWord}</span>
        </div>
      </div>
    </section>
  );
}
