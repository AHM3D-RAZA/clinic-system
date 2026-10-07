import Link from "next/link";
import { cn } from "@/lib/utils";
import styles from "./NotFoundPanel.module.css";

export interface NotFoundAction {
  href: string;
  label: string;
}

interface NotFoundPanelProps {
  title: string;
  body: string;
  primary: NotFoundAction;
  secondary: NotFoundAction;
  /** "dashboard" swaps the card to cream so it reads on the paper-coloured shell */
  tone?: "site" | "dashboard";
}

/**
 * The shared "page not found" card. Presentational only: each surface
 * (public site, dashboard) decides its own words and links — see
 * notFoundCopy.ts — and wraps this in whatever chrome it already has.
 */
export function NotFoundPanel({ title, body, primary, secondary, tone = "site" }: NotFoundPanelProps) {
  return (
    <section className={cn(styles.panel, tone === "dashboard" && styles.dashboard)}>
      <div className={styles.tape} aria-hidden="true" />
      <span className={styles.mark}>404 &middot; page not found</span>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.body}>{body}</p>
      <div className={styles.actions}>
        <Link href={primary.href} className="btnPrimary">
          {primary.label}
        </Link>
        <Link href={secondary.href} className="btnGhost">
          {secondary.label}
        </Link>
      </div>
    </section>
  );
}
