import { describe, it, expect } from "vitest";
import { prioritizeWaiting } from "./activityPriority";
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

describe("prioritizeWaiting", () => {
  it("puts anything preferred for today ahead of everything else", () => {
    const todayIso = "2026-06-01";
    const future = booking({ id: "future", preferredDate: "2099-01-01", createdAt: "2026-05-01T00:00:00.000Z" });
    const forToday = booking({ id: "today", preferredDate: todayIso, createdAt: "2026-05-31T00:00:00.000Z" });
    const result = prioritizeWaiting([future, forToday], todayIso);
    expect(result.map((b) => b.id)).toEqual(["today", "future"]);
  });

  it("orders same-urgency requests oldest-created first", () => {
    const todayIso = "2026-06-01";
    const newer = booking({ id: "newer", createdAt: "2026-05-30T00:00:00.000Z" });
    const older = booking({ id: "older", createdAt: "2026-05-01T00:00:00.000Z" });
    const result = prioritizeWaiting([newer, older], todayIso);
    expect(result.map((b) => b.id)).toEqual(["older", "newer"]);
  });
});
