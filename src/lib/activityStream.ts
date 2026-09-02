import type { BookingRequest } from "@/types/booking";
import type { DashboardOverviewSummary } from "@/types/dashboard";

export type ActivityChapterKey = "waiting" | "today" | "recent";

/**
 * A flat, ordered list of everything the daybook stream renders — chapter
 * labels, booking entries, and per-chapter empty notes all live in one
 * sequence so the UI can thread a single connecting line through all of
 * them instead of three unrelated groups. See DashboardOverview.
 */
export type ActivityStreamNode =
  | { type: "chapterLabel"; key: ActivityChapterKey; label: string; note: string }
  | { type: "entry"; key: string; booking: BookingRequest }
  | { type: "emptyNote"; key: string; message: string };

const CHAPTER_COPY: Record<ActivityChapterKey, { label: string; note: string; empty: string }> = {
  waiting: {
    label: "Waiting on you",
    note: "reply needed",
    empty: "You're caught up — no requests are waiting on a reply.",
  },
  today: {
    label: "Today",
    note: "on the books",
    empty: "Nothing else is on the books for today.",
  },
  recent: {
    label: "Recently in",
    note: "latest first",
    empty: "No booking requests yet — they'll appear here as they come in.",
  },
};

/**
 * Groups bookings into the three chapters and removes duplicates across
 * them, so a pending request for today's date surfaces once (under
 * "Waiting on you", the more urgent chapter) instead of twice. Ordering
 * within each chapter is inherited from `summary` — already
 * newest/soonest-first from `buildOverviewSummary`.
 */
export function buildActivityStreamNodes(summary: DashboardOverviewSummary): ActivityStreamNode[] {
  const waiting = summary.pending;
  const waitingIds = new Set(waiting.map((b) => b.id));

  const today = summary.today.filter((b) => !waitingIds.has(b.id));
  const todayIds = new Set(today.map((b) => b.id));

  const recent = summary.recent.filter((b) => !waitingIds.has(b.id) && !todayIds.has(b.id));

  const chapters: Array<{ key: ActivityChapterKey; bookings: BookingRequest[] }> = [
    { key: "waiting", bookings: waiting },
    { key: "today", bookings: today },
    { key: "recent", bookings: recent },
  ];

  const nodes: ActivityStreamNode[] = [];
  for (const chapter of chapters) {
    const copy = CHAPTER_COPY[chapter.key];
    nodes.push({ type: "chapterLabel", key: chapter.key, label: copy.label, note: copy.note });
    if (chapter.bookings.length === 0) {
      nodes.push({ type: "emptyNote", key: `${chapter.key}-empty`, message: copy.empty });
    } else {
      for (const booking of chapter.bookings) {
        nodes.push({ type: "entry", key: booking.id, booking });
      }
    }
  }
  return nodes;
}
