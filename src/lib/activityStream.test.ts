import { describe, it, expect } from "vitest";
import { buildActivityStreamNodes } from "./activityStream";
import type { BookingRequest } from "@/types/booking";
import type { DashboardOverviewSummary } from "@/types/dashboard";

const TODAY_ISO = "2026-06-01";

function booking(overrides: Partial<BookingRequest>): BookingRequest {
  return {
    id: "bkg_1",
    clinicId: "aster",
    patient: { fullName: "Pat Patient", email: "p@example.com", phone: "555-0100", patientType: "new" },
    serviceId: "checkups-cleanings",
    preferredDate: "2099-01-01",
    preferredTime: "morning",
    status: "pending",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
    ...overrides,
  };
}

function summaryOf(overrides: Partial<DashboardOverviewSummary>): DashboardOverviewSummary {
  return { pending: [], today: [], recent: [], totalCount: 0, ...overrides };
}

function manyBookings(count: number, prefix: string, statusOverrides: Partial<BookingRequest> = {}): BookingRequest[] {
  return Array.from({ length: count }, (_, i) =>
    booking({
      id: `${prefix}${i}`,
      createdAt: `2026-01-${String((i % 28) + 1).padStart(2, "0")}T00:00:00.000Z`,
      ...statusOverrides,
    }),
  );
}

function chapterEntryIds(nodes: ReturnType<typeof buildActivityStreamNodes>, chapterKey: string): string[] {
  const ids: string[] = [];
  let current = "";
  for (const node of nodes) {
    if (node.type === "chapterLabel") current = node.key;
    if (node.type === "entry" && current === chapterKey) ids.push(node.key);
  }
  return ids;
}

describe("buildActivityStreamNodes — grouping and dedup (unchanged behavior)", () => {
  it("renders all three chapter labels even when every chapter is empty", () => {
    const nodes = buildActivityStreamNodes(summaryOf({}), TODAY_ISO);
    const labels = nodes.filter((n) => n.type === "chapterLabel").map((n) => n.key);
    expect(labels).toEqual(["waiting", "today", "recent"]);
    expect(nodes.filter((n) => n.type === "emptyNote")).toHaveLength(3);
  });

  it("does not duplicate a pending booking that is also preferred for today", () => {
    const b = booking({ id: "a", status: "pending" });
    const nodes = buildActivityStreamNodes(summaryOf({ pending: [b], today: [b], recent: [b], totalCount: 1 }), TODAY_ISO);
    expect(chapterEntryIds(nodes, "waiting")).toEqual(["a"]);
    expect(chapterEntryIds(nodes, "today")).toEqual([]);
    expect(chapterEntryIds(nodes, "recent")).toEqual([]);
  });

  it("does not duplicate a today booking that also appears in recent", () => {
    const b = booking({ id: "a", status: "confirmed" });
    const nodes = buildActivityStreamNodes(summaryOf({ today: [b], recent: [b], totalCount: 1 }), TODAY_ISO);
    expect(nodes.filter((n) => n.type === "entry")).toHaveLength(1);
  });
});

describe("buildActivityStreamNodes — curation", () => {
  it("caps 'waiting' at 3 entries and shows a toggle with the correct reveal count", () => {
    const pending = manyBookings(5, "w");
    const nodes = buildActivityStreamNodes(summaryOf({ pending, totalCount: 5 }), TODAY_ISO);
    expect(chapterEntryIds(nodes, "waiting")).toHaveLength(3);
    const toggle = nodes.find((n) => n.type === "toggle" && n.chapterKey === "waiting");
    expect(toggle).toMatchObject({ expanded: false, label: "2 more waiting on a reply" });
  });

  it("caps 'today' at 4 and 'recent' at 3 by default", () => {
    const today = manyBookings(6, "t");
    const recent = manyBookings(5, "r");
    const nodes = buildActivityStreamNodes(summaryOf({ today, recent, totalCount: 11 }), TODAY_ISO);
    expect(chapterEntryIds(nodes, "today")).toHaveLength(4);
    expect(chapterEntryIds(nodes, "recent")).toHaveLength(3);
  });

  it("does not show a toggle when a chapter is already within its initial limit", () => {
    const pending = manyBookings(2, "w");
    const nodes = buildActivityStreamNodes(summaryOf({ pending, totalCount: 2 }), TODAY_ISO);
    expect(nodes.find((n) => n.type === "toggle" && n.chapterKey === "waiting")).toBeUndefined();
  });

  it("expanding a chapter reveals up to its expanded cap, with a collapse toggle", () => {
    const pending = manyBookings(6, "w");
    const nodes = buildActivityStreamNodes(summaryOf({ pending, totalCount: 6 }), TODAY_ISO, new Set(["waiting"]));
    expect(chapterEntryIds(nodes, "waiting")).toHaveLength(6);
    const toggle = nodes.find((n) => n.type === "toggle" && n.chapterKey === "waiting");
    expect(toggle).toMatchObject({ expanded: true, label: "Show fewer" });
    expect(nodes.find((n) => n.type === "overflowNote" && n.key.startsWith("waiting"))).toBeUndefined();
  });

  it("beyond the expanded cap, shows an overflow note instead of growing further", () => {
    const pending = manyBookings(12, "w");
    const nodes = buildActivityStreamNodes(summaryOf({ pending, totalCount: 12 }), TODAY_ISO, new Set(["waiting"]));
    // expanded cap for "waiting" is 6
    expect(chapterEntryIds(nodes, "waiting")).toHaveLength(6);
    const overflow = nodes.find((n) => n.type === "overflowNote" && n.key === "waiting-overflow");
    expect(overflow).toMatchObject({ message: "6 more beyond that — the full history will live in Bookings." });
  });

  it("other chapters are unaffected by one chapter's expanded state", () => {
    const pending = manyBookings(6, "w");
    const recent = manyBookings(6, "r");
    const nodes = buildActivityStreamNodes(
      summaryOf({ pending, recent, totalCount: 12 }),
      TODAY_ISO,
      new Set(["waiting"]),
    );
    expect(chapterEntryIds(nodes, "waiting")).toHaveLength(6);
    expect(chapterEntryIds(nodes, "recent")).toHaveLength(3);
  });

  it("does not blow up with a large realistic dataset (5 pending / 12 today / 20 recent pool)", () => {
    const pending = manyBookings(5, "w");
    const today = manyBookings(12, "t");
    const recent = manyBookings(20, "r");
    const nodes = buildActivityStreamNodes(summaryOf({ pending, today, recent, totalCount: 37 }), TODAY_ISO);

    expect(chapterEntryIds(nodes, "waiting")).toHaveLength(3);
    expect(chapterEntryIds(nodes, "today")).toHaveLength(4);
    expect(chapterEntryIds(nodes, "recent")).toHaveLength(3);
    // three toggles, no overflow notes yet (nothing expanded)
    expect(nodes.filter((n) => n.type === "toggle")).toHaveLength(3);
    expect(nodes.filter((n) => n.type === "overflowNote")).toHaveLength(0);

    const allExpanded = buildActivityStreamNodes(
      summaryOf({ pending, today, recent, totalCount: 37 }),
      TODAY_ISO,
      new Set(["waiting", "today", "recent"]),
    );
    // hard ceilings hold even fully expanded
    expect(chapterEntryIds(allExpanded, "waiting")).toHaveLength(5); // under its cap of 6
    expect(chapterEntryIds(allExpanded, "today")).toHaveLength(8); // capped from 12
    expect(chapterEntryIds(allExpanded, "recent")).toHaveLength(6); // capped from 20
    expect(allExpanded.filter((n) => n.type === "overflowNote")).toHaveLength(2); // today + recent exceed their caps
  });
});
