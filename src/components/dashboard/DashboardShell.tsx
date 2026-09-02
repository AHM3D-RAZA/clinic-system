import type { ReactNode } from "react";
import type { ClinicConfig } from "@/types/clinic";
import { DashboardNav } from "./DashboardNav";
import styles from "./DashboardShell.module.css";

interface DashboardShellProps {
  clinic: ClinicConfig;
  children: ReactNode;
}

/**
 * Positions the nav (rail on desktop, top bar on mobile — see
 * DashboardNav) alongside the main content area. Stays a server
 * component itself; all the interactive nav state lives in
 * DashboardNav, which is the only client boundary this shell needs.
 */
export function DashboardShell({ clinic, children }: DashboardShellProps) {
  return (
    <div className={styles.shell}>
      <DashboardNav clinic={clinic} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
