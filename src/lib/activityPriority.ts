import type { BookingRequest } from "@/types/booking";

const TIME_ORDER: Record<BookingRequest["preferredTime"], number> = {
  morning: 0,
  afternoon: 1,
  evening: 2,
};

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

/** "Today" reads through the day in order: morning, then afternoon, then evening. */
export function prioritizeToday(bookings: BookingRequest[]): BookingRequest[] {
  return [...bookings].sort((a, b) => {
    const byTime = TIME_ORDER[a.preferredTime] - TIME_ORDER[b.preferredTime];
    if (byTime !== 0) return byTime;
    return a.createdAt.localeCompare(b.createdAt);
  });
}
