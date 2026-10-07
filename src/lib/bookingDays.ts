/**
 * Which weekdays the public booking form refuses. Today that is Sunday
 * only; Aster's published hours are "Tue–Sat" (content/aster/clinic.ts),
 * so Monday is a known open question — add 1 below to close it too.
 * Deliberately just a weekday check — not a scheduling engine (no
 * holidays, no per-doctor rules).
 */

/** 0 = Sunday … 6 = Saturday */
const CLOSED_WEEKDAYS: readonly number[] = [0];

export const OPEN_DAYS_HINT = "We're closed on Sundays.";
export const CLOSED_DAY_MESSAGE = "We're closed on Sundays — please pick another day.";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Weekday (0–6) of a YYYY-MM-DD string, or null if it isn't a real date. Timezone-independent. */
export function weekdayOfIsoDate(iso: string): number | null {
  const match = ISO_DATE.exec(iso);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1) return null;
  return date.getUTCDay();
}

/** An error message if the chosen date falls on a closed day; undefined otherwise (or if unparseable). */
export function closedDayError(iso: string | undefined): string | undefined {
  const weekday = iso ? weekdayOfIsoDate(iso) : null;
  if (weekday === null) return undefined;
  return CLOSED_WEEKDAYS.includes(weekday) ? CLOSED_DAY_MESSAGE : undefined;
}
