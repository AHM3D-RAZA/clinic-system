import type { DayStripEntry } from "@/lib/appointments";
import { cn } from "@/lib/utils";
import styles from "./AppointmentDayNav.module.css";

interface AppointmentDayNavProps {
  days: DayStripEntry[];
  selectedIso: string;
  onSelect: (iso: string) => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
}

/**
 * A short run of days (see lib/appointments.ts#buildDayStrip) rendered
 * as text tabs rather than boxed pill buttons — a "which day" switcher
 * that reads like a page-through-the-daybook control, not a calendar
 * widget. Deliberately doesn't attempt a month view: Phase 1 is a
 * strong day view with sensible neighbors, not a full calendar grid.
 */
export function AppointmentDayNav({ days, selectedIso, onSelect, onPrevDay, onNextDay, onToday }: AppointmentDayNavProps) {
  return (
    <div className={styles.nav}>
      <div className={styles.controls}>
        <button type="button" className={styles.arrow} onClick={onPrevDay} aria-label="Previous day">
          <span aria-hidden="true">‹</span>
        </button>
        <button type="button" className={styles.todayButton} onClick={onToday}>
          Today
        </button>
        <button type="button" className={styles.arrow} onClick={onNextDay} aria-label="Next day">
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <div className={styles.stripWrap}>
        <div className={styles.strip} role="tablist" aria-label="Select a day">
          {days.map((day) => {
            const isSelected = day.iso === selectedIso;
            return (
              <button
                key={day.iso}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={cn(styles.day, isSelected && styles.dayActive)}
                onClick={() => onSelect(day.iso)}
              >
                <span className={styles.weekday}>{day.weekdayLabel}</span>
                <span className={styles.dayNumber}>{day.dayNumber}</span>
                {day.isToday && <span className={styles.todayDot} aria-hidden="true" />}
                {day.count > 0 && (
                  <span className={styles.count}>
                    {day.count} {day.count === 1 ? "appt" : "appts"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
