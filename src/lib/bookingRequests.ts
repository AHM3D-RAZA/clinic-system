import type { BookingRequest, BookingStatus } from "@/types/booking";

export type TriageGroupKey = "needsReply" | "waitingOnPatient" | "confirmed" | "closed";

export interface TriageGroup {
  key: TriageGroupKey;
  label: string;
  note: string;
  bookings: BookingRequest[];
}

/**
 * Bookings' own organizing principle: triage by status, not chronology
 * (the overview's daybook) or alphabet (the patient register) or a
 * single day (the appointment timeline). This is the front desk's
 * inbox — the question is "what needs a look", so status comes first
 * and everything within a status is ordered by how long it's been
 * waiting.
 */
export function buildTriageGroups(bookings: BookingRequest[]): TriageGroup[] {
  const byStatus = (statuses: BookingStatus[]) => bookings.filter((b) => statuses.includes(b.status));

  const needsReply = [...byStatus(["pending"])].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const waitingOnPatient = [...byStatus(["contacted"])].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const confirmed = [...byStatus(["confirmed"])].sort((a, b) => a.preferredDate.localeCompare(b.preferredDate));
  const closed = [...byStatus(["completed", "cancelled"])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    [
      { key: "needsReply", label: "Needs a reply", note: "oldest first", bookings: needsReply },
      { key: "waitingOnPatient", label: "Waiting to hear back", note: "already contacted", bookings: waitingOnPatient },
      { key: "confirmed", label: "Confirmed", note: "soonest first", bookings: confirmed },
      { key: "closed", label: "Closed", note: "completed or cancelled", bookings: closed },
    ] satisfies TriageGroup[]
  ).filter((group) => group.bookings.length > 0);
}

/** One sentence for the masthead — no stat tiles, matching the rest of the dashboard's voice. */
export function bookingsSummaryLine(bookings: BookingRequest[]): string {
  const needsReplyCount = bookings.filter((b) => b.status === "pending").length;
  const waitingCount = bookings.filter((b) => b.status === "contacted").length;

  if (needsReplyCount === 0 && waitingCount === 0) {
    return "Nothing needs a reply right now.";
  }
  if (needsReplyCount === 0) {
    const part = waitingCount === 1 ? "1 request is" : `${waitingCount} requests are`;
    return `${part} waiting to hear back from a patient.`;
  }
  const replyPart = needsReplyCount === 1 ? "1 request needs a reply" : `${needsReplyCount} requests need a reply`;
  if (waitingCount === 0) {
    return `${replyPart}.`;
  }
  const waitingPart = waitingCount === 1 ? "1 is" : `${waitingCount} are`;
  return `${replyPart}, and ${waitingPart} waiting to hear back from a patient.`;
}

/**
 * "2 hours ago", "yesterday", "5 days ago" — finer-grained than the
 * patient register's day-level `describeLastVisit`, since a booking
 * request's *received* time (not just date) is part of what tells you
 * how urgent it is.
 */
export function describeReceivedAt(createdAtIso: string, nowIso: string): string {
  const createdAt = new Date(createdAtIso).getTime();
  const now = new Date(nowIso).getTime();
  const rawMinutes = (now - createdAt) / 60_000;

  if (rawMinutes < 1) return "just now";
  const minutes = Math.round(rawMinutes);
  if (minutes < 60) return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;

  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;

  const weeks = Math.round(days / 7);
  if (weeks < 5) return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;

  const months = Math.round(days / 30);
  return months <= 1 ? "over a month ago" : `${months} months ago`;
}

/**
 * Whether a booking's preferred date has already passed without the
 * request being resolved — the single most actionable signal in the
 * "needs a reply" / "waiting to hear back" buckets, so it's surfaced
 * on the row rather than left for someone to notice by reading dates.
 */
export function isOverdue(booking: BookingRequest, todayIso: string): boolean {
  const activeStatuses: BookingStatus[] = ["pending", "contacted"];
  return activeStatuses.includes(booking.status) && booking.preferredDate < todayIso;
}
