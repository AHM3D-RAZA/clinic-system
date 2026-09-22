import type { Appointment } from "@/types/appointment";
import type { BookingStatus } from "@/types/booking";

/**
 * Today's date as `yyyy-mm-dd`, matching how `Appointment.date` is
 * stored. Uses local date components (not `toISOString`, which is
 * UTC) so "today" matches the viewer's actual calendar day — in a
 * timezone ahead of UTC, formatting via UTC can report yesterday's
 * date until well into the local morning.
 */
export function todayIsoDate(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * `n` days from a given ISO date, as `yyyy-mm-dd`. Negative `n` moves
 * backward. Does the arithmetic entirely in UTC on the parsed
 * calendar components — not `new Date(iso + "T00:00:00")` followed by
 * `toISOString()`, which parses in local time but formats in UTC and
 * silently drifts by a day in any timezone ahead of UTC (this used to
 * make the "next day" control return the same date it started from).
 */
export function addDaysIso(iso: string, n: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day + n));
  return d.toISOString().slice(0, 10);
}

/** "14:30" -> "2:30 PM" */
export function formatTimeLabel(time: string): string {
  const [hourStr, minuteStr] = time.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
}

export type DayPart = "morning" | "afternoon" | "evening";

const DAY_PART_LABELS: Record<DayPart, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

/** Which part of the day a 24-hour "HH:mm" time falls in. */
export function dayPartForTime(time: string): DayPart {
  const hour = Number(time.split(":")[0]);
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

/** Chronological sort by clock time (ascending). */
export function sortByTime(appointments: Appointment[]): Appointment[] {
  return [...appointments].sort((a, b) => a.time.localeCompare(b.time));
}

/** Every appointment scheduled on a given ISO date. */
export function appointmentsOnDate(appointments: Appointment[], iso: string): Appointment[] {
  return sortByTime(appointments.filter((a) => a.date === iso));
}

export interface DayChapter {
  key: DayPart;
  label: string;
  appointments: Appointment[];
}

/**
 * Groups one day's (already-filtered) appointments into Morning /
 * Afternoon / Evening chapters, in that order, omitting any chapter
 * that has nothing in it — mirrors the daybook's chapter pattern so
 * Appointments reads as "the same product, a different room."
 */
export function buildDayChapters(dayAppointments: Appointment[]): DayChapter[] {
  const order: DayPart[] = ["morning", "afternoon", "evening"];
  return order
    .map((key) => ({
      key,
      label: DAY_PART_LABELS[key],
      appointments: dayAppointments.filter((a) => dayPartForTime(a.time) === key),
    }))
    .filter((chapter) => chapter.appointments.length > 0);
}

export interface DayStripEntry {
  iso: string;
  weekdayLabel: string;
  dayNumber: string;
  isToday: boolean;
  count: number;
}

/**
 * Builds the short run of days shown in the date strip, centered
 * loosely on `todayIso` but always including `selectedIso` even if a
 * caller has navigated further out — the strip should never silently
 * exclude the day currently being viewed.
 */
export function buildDayStrip(
  appointments: Appointment[],
  todayIso: string,
  selectedIso: string,
  daysBefore = 3,
  daysAfter = 3,
): DayStripEntry[] {
  const start = addDaysIso(todayIso, -daysBefore);
  const isos = new Set<string>();
  for (let i = 0; i <= daysBefore + daysAfter; i++) {
    isos.add(addDaysIso(start, i));
  }
  isos.add(selectedIso);

  return Array.from(isos)
    .sort()
    .map((iso) => {
      const date = new Date(`${iso}T00:00:00`);
      return {
        iso,
        weekdayLabel: date.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: date.toLocaleDateString("en-US", { day: "numeric" }),
        isToday: iso === todayIso,
        count: appointments.filter((a) => a.date === iso).length,
      };
    });
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Awaiting confirmation",
  contacted: "Contacted",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** Short, human status word for a schedule row. */
export function statusLabel(status: BookingStatus): string {
  return STATUS_LABELS[status];
}

/**
 * One-line summary of a day's appointments, e.g. "6 appointments · 2
 * awaiting confirmation" — surfaces "what needs attention" without a
 * separate stat-card section.
 */
export function buildDaySummaryLine(dayAppointments: Appointment[]): string {
  const total = dayAppointments.length;
  if (total === 0) return "No appointments scheduled";

  const pending = dayAppointments.filter((a) => a.status === "pending").length;
  const noun = total === 1 ? "appointment" : "appointments";
  if (pending === 0) return `${total} ${noun}`;

  const pendingNoun = pending === 1 ? "one" : `${pending}`;
  return `${total} ${noun} · ${pendingNoun} awaiting confirmation`;
}
