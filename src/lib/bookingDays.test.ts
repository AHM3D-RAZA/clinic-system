import { describe, expect, it } from "vitest";
import { CLOSED_DAY_MESSAGE, closedDayError, weekdayOfIsoDate } from "./bookingDays";

describe("weekdayOfIsoDate", () => {
  it("reads the weekday straight from the date string", () => {
    expect(weekdayOfIsoDate("2026-10-11")).toBe(0); // Sunday
    expect(weekdayOfIsoDate("2026-10-06")).toBe(2); // Tuesday
  });

  it("returns null for anything that isn't a real calendar date", () => {
    expect(weekdayOfIsoDate("")).toBeNull();
    expect(weekdayOfIsoDate("next tuesday")).toBeNull();
    expect(weekdayOfIsoDate("2026-02-31")).toBeNull();
  });
});

describe("closedDayError", () => {
  it("rejects Sunday", () => {
    expect(closedDayError("2026-10-11")).toBe(CLOSED_DAY_MESSAGE);
  });

  it("accepts every other weekday", () => {
    for (const day of ["05", "06", "07", "08", "09", "10"]) {
      expect(closedDayError(`2026-10-${day}`)).toBeUndefined(); // Mon–Sat
    }
  });

  it("stays out of the way when there is no usable date", () => {
    expect(closedDayError(undefined)).toBeUndefined();
    expect(closedDayError("")).toBeUndefined();
    expect(closedDayError("garbage")).toBeUndefined();
  });
});
