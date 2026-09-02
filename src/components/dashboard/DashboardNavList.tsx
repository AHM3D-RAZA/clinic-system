import Link from "next/link";
import type { DashboardNavItem } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import { NavIcon } from "./NavIcon";
import styles from "./DashboardNav.module.css";

interface DashboardNavListProps {
  items: DashboardNavItem[];
  currentPath: string;
  onNavigate?: () => void;
  /**
   * Set to `false` when this list lives inside a panel that's
   * currently off-screen/`aria-hidden` (the mobile drawer while
   * closed) — otherwise its links stay in tab order even though
   * they're invisible, which axe flags (and keyboard users hit).
   * The desktop rail is always visible, so it never sets this.
   */
  tabbable?: boolean;
}

/**
 * Renders each nav item as a real link when implemented, or an honest
 * disabled entry with a "Soon" tag when it isn't — never a link to a
 * route that 404s, never a control that looks clickable but does
 * nothing.
 */
export function DashboardNavList({ items, currentPath, onNavigate, tabbable = true }: DashboardNavListProps) {
  return (
    <ul className={styles.list}>
      {items.map((item) => {
        const isActive = item.implemented && currentPath === item.href;

        if (!item.implemented) {
          return (
            <li key={item.id}>
              <span className={cn(styles.item, styles.itemSoon)} aria-disabled="true">
                <NavIcon icon={item.icon} />
                {item.label}
                <span className={styles.soonTag}>Soon</span>
              </span>
            </li>
          );
        }

        return (
          <li key={item.id}>
            <Link
              href={item.href}
              className={cn(styles.item, isActive && styles.itemActive)}
              aria-current={isActive ? "page" : undefined}
              onClick={onNavigate}
              tabIndex={tabbable ? undefined : -1}
            >
              <NavIcon icon={item.icon} />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
