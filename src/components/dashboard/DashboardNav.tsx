"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ClinicConfig } from "@/types/clinic";
import { cn } from "@/lib/utils";
import { useDismissablePanel } from "@/lib/useDismissablePanel";
import { DASHBOARD_NAV_ITEMS } from "./navItems";
import { DashboardNavList } from "./DashboardNavList";
import { DashboardStaffBadge } from "./DashboardStaffBadge";
import styles from "./DashboardNav.module.css";

interface DashboardNavProps {
  clinic: ClinicConfig;
}

/**
 * On desktop this renders as a fixed left rail (see DashboardNav.module.css
 * for the breakpoint). On mobile the rail hides and a compact top bar
 * with a menu button takes over, opening the same nav list in a
 * dismissable drawer — the same escape/focus behavior the public
 * site's mobile nav already uses, via the shared hook.
 */
export function DashboardNav({ clinic }: DashboardNavProps) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerCloseRef = useRef<HTMLButtonElement | null>(null);

  useDismissablePanel({
    isOpen: isDrawerOpen,
    onClose: () => setIsDrawerOpen(false),
    initialFocusRef: drawerCloseRef,
  });

  const brand = (
    <Link href="/dashboard" className={styles.mark}>
      <span className={styles.markDot} aria-hidden="true" />
      {clinic.shortName}
    </Link>
  );

  return (
    <>
      {/* Desktop rail */}
      <nav className={styles.rail} aria-label="Dashboard navigation">
        {brand}
        <DashboardNavList items={DASHBOARD_NAV_ITEMS} currentPath={pathname} />
        <DashboardStaffBadge clinicShortName={clinic.shortName} />
      </nav>

      {/* Mobile top bar */}
      <div className={styles.topBar}>
        {brand}
        <button
          type="button"
          className={styles.menuButton}
          aria-label="Open dashboard menu"
          aria-expanded={isDrawerOpen}
          onClick={() => setIsDrawerOpen(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div
        className={cn(styles.drawer, isDrawerOpen && styles.isOpen)}
        role="dialog"
        aria-modal="true"
        aria-label="Dashboard menu"
        aria-hidden={!isDrawerOpen}
      >
        <button
          type="button"
          className={styles.drawerClose}
          aria-label="Close dashboard menu"
          onClick={() => setIsDrawerOpen(false)}
          tabIndex={isDrawerOpen ? 0 : -1}
          ref={drawerCloseRef}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
        <DashboardNavList
          items={DASHBOARD_NAV_ITEMS}
          currentPath={pathname}
          onNavigate={() => setIsDrawerOpen(false)}
          tabbable={isDrawerOpen}
        />
        <DashboardStaffBadge clinicShortName={clinic.shortName} />
      </div>
    </>
  );
}
