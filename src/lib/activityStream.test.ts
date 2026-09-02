import { describe, it, expect } from "vitest";
import { buildActivityStreamNodes } from "./activityStream";
import type { BookingRequest } from "@/types/booking";
import type { DashboardOverviewSummary } from "@/types/dashboard";

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

describe("buildActivityStreamNodes", () => {
  it("renders all three chapter labels even when every chapter is empty", () => {
    const nodes = buildActivityStreamNodes(summaryOf({}));
    const labels = nodes.filter((n) => n.type === "chapterLabel").map((n) => n.key);
    expect(labels).toEqual(["waiting", "today", "recent"]);
    expect(nodes.filter((n) => n.type === "emptyNote")).toHaveLength(3);
  });

  it("does not duplicate a pending booking that is also preferred for today", () => {
    const b = booking({ id: "a", status: "pending" });
    const nodes = buildActivityStreamNodes(summaryOf({ pending: [b], today: [b], recent: [b], totalCount: 1 }));

    const entryIdsByChapter = new Map<string, string[]>();
    let currentChapter = "";
    for (const node of nodes) {
      if (node.type === "chapterLabel") currentChapter = node.key;
      if (node.type === "entry") {
        entryIdsByChapter.set(currentChapter, [...(entryIdsByChapter.get(currentChapter) ?? []), node.key]);
      }
    }

    expect(entryIdsByChapter.get("waiting")).toEqual(["a"]);
    expect(entryIdsByChapter.get("today")).toBeUndefined();
    expect(entryIdsByChapter.get("recent")).toBeUndefined();
  });

  it("does not duplicate a today booking that also appears in recent", () => {
    const b = booking({ id: "a", status: "confirmed" });
    const nodes = buildActivityStreamNodes(summaryOf({ today: [b], recent: [b], totalCount: 1 }));
    const entries = nodes.filter((n) => n.type === "entry");
    expect(entries).toHaveLength(1);
  });

  it("preserves the incoming order within each chapter", () => {
    const a = booking({ id: "a", createdAt: "2026-01-01T00:00:00.000Z" });
    const b = booking({ id: "b", createdAt: "2026-02-01T00:00:00.000Z" });
    const nodes = buildActivityStreamNodes(summaryOf({ recent: [b, a], totalCount: 2 }));
    const entries = nodes.filter((n) => n.type === "entry").map((n) => n.key);
    expect(entries).toEqual(["b", "a"]);
  });
});
