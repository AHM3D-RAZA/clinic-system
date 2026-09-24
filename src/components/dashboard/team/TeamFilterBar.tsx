import type { TeamGroupKey } from "@/types/team";
import { TEAM_GROUP_LABELS, TEAM_GROUP_ORDER } from "@/lib/team";
import { cn } from "@/lib/utils";
import styles from "./TeamFilterBar.module.css";

interface TeamFilterBarProps {
  activeGroup: TeamGroupKey | "all";
  onGroupChange: (group: TeamGroupKey | "all") => void;
  query: string;
  onQueryChange: (query: string) => void;
}

/**
 * A room filter ("All / Doctors / Care team / Front of house") plus a
 * plain-text search — not a faceted filter panel. With a roster this
 * small, the point isn't power-filtering, it's letting someone jump
 * straight to "who do I ask about X" without scanning three sections.
 */
export function TeamFilterBar({ activeGroup, onGroupChange, query, onQueryChange }: TeamFilterBarProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.tabsWrap}>
        <div className={styles.tabs} role="tablist" aria-label="Filter by team">
          <button
            type="button"
            role="tab"
            aria-selected={activeGroup === "all"}
            className={cn(styles.tab, activeGroup === "all" && styles.tabActive)}
            onClick={() => onGroupChange("all")}
          >
            Everyone
          </button>
          {TEAM_GROUP_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeGroup === key}
              className={cn(styles.tab, activeGroup === key && styles.tabActive)}
              onClick={() => onGroupChange(key)}
            >
              {TEAM_GROUP_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      <label className={styles.searchField}>
        <span className={styles.searchLabel}>Search</span>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search by name or role…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </label>
    </div>
  );
}
