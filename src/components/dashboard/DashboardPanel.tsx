import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./DashboardPanel.module.css";

interface DashboardPanelProps {
  title: string;
  tone?: "highlight" | "default";
  children: ReactNode;
}

export function DashboardPanel({ title, tone = "default", children }: DashboardPanelProps) {
  return (
    <section className={cn(styles.panel, tone === "highlight" && styles.highlight)}>
      <h2 className={styles.title}>{title}</h2>
      {children}
    </section>
  );
}
