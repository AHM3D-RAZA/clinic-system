import { describe, it, expect } from "vitest";
import { bookingsSummaryLine, buildTriageGroups, describeReceivedAt, isOverdue } from "./bookingRequests";
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

describe("buildTriageGroups", () => {
  it("buckets by status into the four fixed groups, in a fixed order", () => {
    const bookings = [
      booking({ id: "a", status: "pending" }),
      booking({ id: "b", status: "contacted" }),
      booking({ id: "c", status: "confirmed" }),
      booking({ id: "d", status: "completed" }),
      booking({ id: "e", status: "cancelled" }),
    ];
    const groups = buildTriageGroups(bookings);
    expect(groups.map((g) => g.key)).toEqual(["needsReply", "waitingOnPatient", "confirmed", "closed"]);
    expect(groups.find((g) => g.key === "closed")?.bookings.map((b) => b.id).sort()).toEqual(["d", "e"]);
  });

  it("omits empty groups entirely rather than rendering them blank", () => {
    const groups = buildTriageGroups([booking({ id: "a", status: "pending" })]);
    expect(groups).toHaveLength(1);
    expect(groups[0].key).toBe("needsReply");
  });

  it("returns nothing for an empty input", () => {
    expect(buildTriageGroups([])).toEqual([]);
  });

  it("orders 'needs a reply' oldest-created first (longest-waiting request first)", () => {
    const newer = booking({ id: "newer", status: "pending", createdAt: "2026-05-30T00:00:00.000Z" });
    const older = booking({ id: "older", status: "pending", createdAt: "2026-05-01T00:00:00.000Z" });
    const groups = buildTriageGroups([newer, older]);
    expect(groups[0].bookings.map((b) => b.id)).toEqual(["older", "newer"]);
  });

  it("orders 'confirmed' by soonest preferred date first", () => {
    const later = booking({ id: "later", status: "confirmed", preferredDate: "2026-08-01" });
    const sooner = booking({ id: "sooner", status: "confirmed", preferredDate: "2026-06-01" });
    const groups = buildTriageGroups([later, sooner]);
    expect(groups[0].bookings.map((b) => b.id)).toEqual(["sooner", "later"]);
  });

  it("orders 'closed' by most-recently-updated first", () => {
    const older = booking({ id: "older", status: "completed", updatedAt: "2026-05-01T00:00:00.000Z" });
    const newer = booking({ id: "newer", status: "cancelled", updatedAt: "2026-05-30T00:00:00.000Z" });
    const groups = buildTriageGroups([older, newer]);
    expect(groups[0].bookings.map((b) => b.id)).toEqual(["newer", "older"]);
  });
});

describe("bookingsSummaryLine", () => {
  it("reports nothing needing attention when there are no pending/contacted bookings", () => {
    expect(bookingsSummaryLine([booking({ status: "confirmed" })])).toBe("Nothing needs a reply right now.");
  });

  it("singular vs plural phrasing for a single pending request", () => {
    expect(bookingsSummaryLine([booking({ status: "pending" })])).toBe("1 request needs a reply.");
  });

  it("combines pending and contacted counts in one sentence", () => {
    const bookings = [booking({ id: "a", status: "pending" }), booking({ id: "b", status: "contacted" })];
    expect(bookingsSummaryLine(bookings)).toBe("1 request needs a reply, and 1 is waiting to hear back from a patient.");
  });

  it("handles contacted-only with no pending", () => {
    expect(bookingsSummaryLine([booking({ status: "contacted" })])).toBe("1 request is waiting to hear back from a patient.");
  });
});

describe("describeReceivedAt", () => {
  const now = "2026-06-01T12:00:00.000Z";

  it.each([
    ["2026-06-01T11:59:30.000Z", "just now"],
    ["2026-06-01T11:59:00.000Z", "1 minute ago"],
    ["2026-06-01T11:30:00.000Z", "30 minutes ago"],
    ["2026-06-01T11:00:00.000Z", "1 hour ago"],
    ["2026-06-01T06:00:00.000Z", "6 hours ago"],
    ["2026-05-31T12:00:00.000Z", "yesterday"],
    ["2026-05-27T12:00:00.000Z", "5 days ago"],
    ["2026-05-18T12:00:00.000Z", "2 weeks ago"],
    ["2026-03-01T12:00:00.000Z", "3 months ago"],
  ])("formats %s relative to now as %s", (createdAt, expected) => {
    expect(describeReceivedAt(createdAt, now)).toBe(expected);
  });
});

describe("isOverdue", () => {
  const todayIso = "2026-06-15";

  it("is true for a pending request whose preferred date has passed", () => {
    expect(isOverdue(booking({ status: "pending", preferredDate: "2026-06-10" }), todayIso)).toBe(true);
  });

  it("is false for a pending request whose preferred date is today or future", () => {
    expect(isOverdue(booking({ status: "pending", preferredDate: "2026-06-15" }), todayIso)).toBe(false);
    expect(isOverdue(booking({ status: "pending", preferredDate: "2026-06-20" }), todayIso)).toBe(false);
  });

  it("is false for statuses that no longer need action, even if the date passed", () => {
    expect(isOverdue(booking({ status: "confirmed", preferredDate: "2026-06-10" }), todayIso)).toBe(false);
    expect(isOverdue(booking({ status: "completed", preferredDate: "2026-06-10" }), todayIso)).toBe(false);
    expect(isOverdue(booking({ status: "cancelled", preferredDate: "2026-06-10" }), todayIso)).toBe(false);
  });
});
