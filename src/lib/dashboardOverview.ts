import type { BookingRequest } from "@/types/booking";
import type { Doctor, ServiceOffering } from "@/types/content";
import type { DashboardOverviewSummary } from "@/types/dashboard";

// The overview's own curation (see lib/activityStream.ts) decides how many
// of these are actually shown and how many are revealed on "show more" —
// this is just the upstream pool size, kept comfortably above the
// activity stream's largest expanded cap (8) so there's room to expand
// into before hitting a hard "recently in" boundary.
const RECENT_POOL_LIMIT = 20;

/**
 * Shapes a clinic's raw booking requests into what the overview page
 * needs to render. Pure and framework-free on purpose — the page
 * (server component) calls this after fetching through
 * `bookingService`, and it's fully unit-testable without rendering
 * anything.
 */
export function buildOverviewSummary(
  bookings: BookingRequest[],
  todayIso: string,
): DashboardOverviewSummary {
  const byNewestFirst = [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    pending: byNewestFirst.filter((b) => b.status === "pending"),
    today: byNewestFirst.filter((b) => b.preferredDate === todayIso),
    recent: byNewestFirst.slice(0, RECENT_POOL_LIMIT),
    totalCount: bookings.length,
  };
}

/** Today's date as `yyyy-mm-dd`, matching how `preferredDate` is stored. */
export function todayIsoDate(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export type GreetingPeriod = "morning" | "afternoon" | "evening";

/**
 * Time-of-day greeting for the overview masthead. Kept separate from
 * any copy/JSX so it's trivial to unit test across hours.
 */
export function greetingPeriod(now: Date = new Date()): GreetingPeriod {
  const hour = now.getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

const GREETING_LABELS: Record<GreetingPeriod, string> = {
  morning: "Good morning",
  afternoon: "Good afternoon",
  evening: "Good evening",
};

export function greetingLabel(period: GreetingPeriod): string {
  return GREETING_LABELS[period];
}

/**
 * Booking records only store a `serviceId`; panels need the human
 * name. Built once per render from the clinic's service list rather
 * than looked up per-row.
 */
export function buildServiceNameLookup(services: ServiceOffering[]): Record<string, string> {
  return Object.fromEntries(services.map((service) => [service.id, service.name]));
}

/**
 * Same idea as `buildServiceNameLookup`, for `BookingRequest.assignedDoctorId`.
 * Lets the overview say "with Dr. Farooqi" instead of just a raw id — one of
 * the small threads that ties a booking to the person handling it.
 */
export function buildDoctorNameLookup(doctors: Doctor[]): Record<string, string> {
  return Object.fromEntries(doctors.map((doctor) => [doctor.id, doctor.name]));
}
