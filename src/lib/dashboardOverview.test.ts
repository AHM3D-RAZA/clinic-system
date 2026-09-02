import { describe, it, expect } from "vitest";
import {
  buildOverviewSummary,
  buildServiceNameLookup,
  greetingLabel,
  greetingPeriod,
  todayIsoDate,
} from "./dashboardOverview";
import type { BookingRequest } from "@/types/booking";

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

describe("buildOverviewSummary", () => {
  it("returns zeroed-out groups for an empty clinic", () => {
    const summary = buildOverviewSummary([], "2026-06-01");
    expect(summary).toEqual({ pending: [], today: [], recent: [], totalCount: 0 });
  });

  it("filters pending requests regardless of other statuses present", () => {
    const bookings = [
      booking({ id: "a", status: "pending" }),
      booking({ id: "b", status: "confirmed" }),
      booking({ id: "c", status: "cancelled" }),
    ];
    const summary = buildOverviewSummary(bookings, "2026-06-01");
    expect(summary.pending.map((b) => b.id)).toEqual(["a"]);
  });

  it("groups bookings whose preferred date matches today", () => {
    const bookings = [
      booking({ id: "a", preferredDate: "2026-06-01" }),
      booking({ id: "b", preferredDate: "2026-06-02" }),
    ];
    const summary = buildOverviewSummary(bookings, "2026-06-01");
    expect(summary.today.map((b) => b.id)).toEqual(["a"]);
  });

  it("orders recent bookings newest-created first", () => {
    const bookings = [
      booking({ id: "old", createdAt: "2026-01-01T00:00:00.000Z" }),
      booking({ id: "new", createdAt: "2026-06-01T00:00:00.000Z" }),
      booking({ id: "mid", createdAt: "2026-03-01T00:00:00.000Z" }),
    ];
    const summary = buildOverviewSummary(bookings, "2026-06-01");
    expect(summary.recent.map((b) => b.id)).toEqual(["new", "mid", "old"]);
  });

  it("caps recent bookings at 6 even with more on file", () => {
    const bookings = Array.from({ length: 10 }, (_, i) =>
      booking({ id: `b${i}`, createdAt: `2026-01-${String(i + 1).padStart(2, "0")}T00:00:00.000Z` }),
    );
    const summary = buildOverviewSummary(bookings, "2026-06-01");
    expect(summary.recent).toHaveLength(6);
    expect(summary.totalCount).toBe(10);
  });

  it("does not mutate the input array", () => {
    const bookings = [booking({ id: "a" }), booking({ id: "b" })];
    const copy = [...bookings];
    buildOverviewSummary(bookings, "2026-06-01");
    expect(bookings).toEqual(copy);
  });
});

describe("todayIsoDate", () => {
  it("formats a date as yyyy-mm-dd", () => {
    expect(todayIsoDate(new Date("2026-03-14T08:00:00.000Z"))).toBe("2026-03-14");
  });
});

describe("greetingPeriod / greetingLabel", () => {
  it("returns morning before noon", () => {
    expect(greetingPeriod(new Date(2026, 0, 1, 8))).toBe("morning");
  });

  it("returns afternoon between 12 and 5pm", () => {
    expect(greetingPeriod(new Date(2026, 0, 1, 14))).toBe("afternoon");
  });

  it("returns evening from 5pm onward", () => {
    expect(greetingPeriod(new Date(2026, 0, 1, 19))).toBe("evening");
  });

  it("maps each period to a human label", () => {
    expect(greetingLabel("morning")).toBe("Good morning");
    expect(greetingLabel("afternoon")).toBe("Good afternoon");
    expect(greetingLabel("evening")).toBe("Good evening");
  });
});

describe("buildServiceNameLookup", () => {
  it("maps service id to name", () => {
    const lookup = buildServiceNameLookup([
      { id: "checkups-cleanings", name: "Checkups & Cleanings", tag: "", description: "", accentWord: "", swatch: "primary" },
      { id: "whitening", name: "Whitening", tag: "", description: "", accentWord: "", swatch: "accent" },
    ]);
    expect(lookup).toEqual({ "checkups-cleanings": "Checkups & Cleanings", whitening: "Whitening" });
  });

  it("returns an empty object for no services", () => {
    expect(buildServiceNameLookup([])).toEqual({});
  });
});
