import type { BookingRequest } from "@/types/booking";
import type { DashboardOverviewSummary } from "@/types/dashboard";
import { prioritizeToday, prioritizeWaiting } from "./activityPriority";

export type ActivityChapterKey = "waiting" | "today" | "recent";

/**
 * A flat, ordered list of everything the daybook stream renders — chapter
 * labels, booking entries, empty notes, expand/collapse toggles, and the
 * occasional "more than this" overflow note all live in one sequence so
 * the UI can thread a single connecting line through all of them instead
 * of unrelated groups. See ClinicActivityStream.
 */
export type ActivityStreamNode =
  | { type: "chapterLabel"; key: ActivityChapterKey; label: string; note: string }
  | { type: "entry"; key: string; booking: BookingRequest }
  | { type: "emptyNote"; key: string; message: string }
  | { type: "toggle"; key: string; chapterKey: ActivityChapterKey; expanded: boolean; label: string }
  | { type: "overflowNote"; key: string; message: string };

interface ChapterCopy {
  label: string;
  note: string;
  empty: string;
  /** Completes "N more ___" on the expand toggle, e.g. "3 more waiting on a reply". */
  moreSuffix: string;
}

const CHAPTER_COPY: Record<ActivityChapterKey, ChapterCopy> = {
  waiting: {
    label: "Waiting on you",
    note: "reply needed",
    empty: "You're caught up — no requests are waiting on a reply.",
    moreSuffix: "waiting on a reply",
  },
  today: {
    label: "Today",
    note: "on the books",
    empty: "Nothing else is on the books for today.",
    moreSuffix: "booked in today",
  },
  recent: {
    label: "Recently in",
    note: "latest first",
    empty: "No booking requests yet — they'll appear here as they come in.",
    moreSuffix: "from before",
  },
};

/**
 * The overview's deliberate visual ceiling per chapter. `initial` is what
 * shows before any interaction; `expanded` is the hard cap once "show
 * more" has been used — past that, an overflow note points to the full
 * history instead of the stream growing without bound. See Phase 2 brief:
 * the overview is an orientation layer, not a full activity log.
 */
const CHAPTER_LIMITS: Record<ActivityChapterKey, { initial: number; expanded: number }> = {
  waiting: { initial: 3, expanded: 6 },
  today: { initial: 4, expanded: 8 },
  recent: { initial: 3, expanded: 6 },
};

/**
 * Groups bookings into the three chapters, removes duplicates across them
 * (a pending request for today surfaces once, under the more urgent
 * "Waiting on you" chapter), applies each chapter's ordering rule, and
 * curates how much of each chapter is actually rendered based on which
 * chapters the caller says are expanded. All curation/ordering logic
 * lives here — components just render whatever nodes come back.
 */
export function buildActivityStreamNodes(
  summary: DashboardOverviewSummary,
  todayIso: string,
  expandedChapters: ReadonlySet<ActivityChapterKey> = new Set(),
): ActivityStreamNode[] {
  const waiting = prioritizeWaiting(summary.pending, todayIso);
  const waitingIds = new Set(waiting.map((b) => b.id));

  const today = prioritizeToday(summary.today.filter((b) => !waitingIds.has(b.id)));
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
    const limits = CHAPTER_LIMITS[chapter.key];
    const total = chapter.bookings.length;
    const isExpanded = expandedChapters.has(chapter.key);

    nodes.push({ type: "chapterLabel", key: chapter.key, label: copy.label, note: copy.note });

    if (total === 0) {
      nodes.push({ type: "emptyNote", key: `${chapter.key}-empty`, message: copy.empty });
      continue;
    }

    const visibleCount = Math.min(total, isExpanded ? limits.expanded : limits.initial);
    for (const booking of chapter.bookings.slice(0, visibleCount)) {
      nodes.push({ type: "entry", key: booking.id, booking });
    }

    if (!isExpanded && total > limits.initial) {
      const revealCount = Math.min(total, limits.expanded) - limits.initial;
      nodes.push({
        type: "toggle",
        key: `${chapter.key}-toggle`,
        chapterKey: chapter.key,
        expanded: false,
        label: `${revealCount} more ${copy.moreSuffix}`,
      });
    } else if (isExpanded && total > limits.initial) {
      nodes.push({
        type: "toggle",
        key: `${chapter.key}-toggle`,
        chapterKey: chapter.key,
        expanded: true,
        label: "Show fewer",
      });
      if (total > limits.expanded) {
        const overflow = total - limits.expanded;
        nodes.push({
          type: "overflowNote",
          key: `${chapter.key}-overflow`,
          message: `${overflow} more beyond that — the full history will live in Bookings.`,
        });
      }
    }
  }

  return nodes;
}
