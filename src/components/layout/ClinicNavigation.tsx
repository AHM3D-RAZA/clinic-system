"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ClinicConfig } from "@/types/clinic";
import type { NavLink } from "@/types/content";
import { cn } from "@/lib/utils";
import { useDismissablePanel } from "@/lib/useDismissablePanel";
import styles from "./ClinicNavigation.module.css";

interface ClinicNavigationProps {
  clinic: ClinicConfig;
  nav: NavLink[];
  bookingHref?: string;
}

export function ClinicNavigation({ clinic, nav, bookingHref = "/book" }: ClinicNavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerCloseRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  useDismissablePanel({
    isOpen: isDrawerOpen,
    onClose: () => setIsDrawerOpen(false),
    initialFocusRef: drawerCloseRef,
  });

  return (
    <>
      <nav className={cn(styles.nav, isScrolled && styles.isScrolled)}>
        <Link href="/#home" className={styles.mark}>
          <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <path
              d="M20 4C13 4 8 10 8 17c0 9 8 15 12 19 4-4 12-10 12-19 0-7-5-13-12-13Z"
              fill="var(--color-primary)"
            />
            <path
              d="M20 12c-3 0-5 2.5-5 6 0 4 3 7 5 9 2-2 5-5 5-9 0-3.5-2-6-5-6Z"
              fill="var(--color-cream)"
            />
          </svg>
          {clinic.shortName}
        </Link>

        <div className={styles.links}>
          {nav.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>

        <Link href={bookingHref} className={styles.cta}>
          Book a visit
        </Link>

        <button
          type="button"
          className={styles.burger}
          aria-label="Open menu"
          aria-expanded={isDrawerOpen}
          onClick={() => setIsDrawerOpen(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </nav>

      <div
        className={cn(styles.drawer, isDrawerOpen && styles.isOpen)}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!isDrawerOpen}
      >
        <button
          type="button"
          className={styles.drawerClose}
          aria-label="Close menu"
          onClick={() => setIsDrawerOpen(false)}
          tabIndex={isDrawerOpen ? 0 : -1}
          ref={drawerCloseRef}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        {nav.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setIsDrawerOpen(false)}
            tabIndex={isDrawerOpen ? 0 : -1}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href={bookingHref}
          className={styles.cta}
          onClick={() => setIsDrawerOpen(false)}
          tabIndex={isDrawerOpen ? 0 : -1}
        >
          Book a visit
        </Link>
      </div>
    </>
  );
}
