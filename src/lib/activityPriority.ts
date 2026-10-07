import type { BookingRequest } from "@/types/booking";

/**
 * "Waiting on you" reads as a reply queue: anything preferred for today
 * jumps to the front (most urgent), then oldest-requested-first within
 * that — the request that's been waiting longest gets seen first. A
 * simple, deterministic stand-in for a real priority system.
 */
export function prioritizeWaiting(bookings: BookingRequest[], todayIso: string): BookingRequest[] {
  return [...bookings].sort((a, b) => {
    const aToday = a.preferredDate === todayIso ? 0 : 1;
    const bToday = b.preferredDate === todayIso ? 0 : 1;
    if (aToday !== bToday) return aToday - bToday;
    return a.createdAt.localeCompare(b.createdAt);
  });
}
