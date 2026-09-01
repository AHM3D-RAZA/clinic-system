/** Combines class names, skipping falsy values. */
export function cn(...classes: Array<string | false | undefined | null>): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Generates a reasonably-unique id for mock records, e.g. "bkg_9f2ac1".
 * Good enough for an in-memory mock store; a real database would assign
 * its own ids and this helper would simply stop being called.
 */
export function generateId(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 10)
      : Math.random().toString(36).slice(2, 12);
  return `${prefix}_${random}`;
}

export function formatDateForDisplay(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export const PREFERRED_TIME_LABELS: Record<string, string> = {
  morning: "Morning (9am–12pm)",
  afternoon: "Afternoon (12–4pm)",
  evening: "Evening (4–6pm)",
};

/** Formats an E.164-ish phone string as `(555) 123-4567` for display. Falls back to the input if it doesn't look like a 10-digit US number. */
export function formatPhoneReadable(e164: string): string {
  const digits = e164.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return e164;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
