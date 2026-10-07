import { describe, it, expect } from "vitest";
import {
  addDaysIso,
  appointmentsOnDate,
  buildDayChapters,
  buildDayStrip,
  buildDaySummaryLine,
  dayPartForTime,
  formatTimeLabel,
  sortByTime,
  statusLabel,
  todayIsoDate,
} from "./appointments";
import type { Appointment } from "@/types/appointment";

function appointment(overrides: Partial<Appointment>): Appointment {
  return {
    id: "apt_1",
    clinicId: "aster",
    patientName: "Pat Patient",
    patientType: "new",
    doctorId: "nadia-farooqi",
    serviceId: "checkups-cleanings",
    date: "2026-06-01",
    time: "09:00",
    durationMinutes: 30,
    status: "confirmed",
    ...overrides,
  };
}

describe("todayIsoDate", () => {
  it("formats a Date as yyyy-mm-dd", () => {
    expect(todayIsoDate(new Date("2026-06-15T08:00:00.000Z"))).toBe("2026-06-15");
  });
});

describe("addDaysIso", () => {
  it("moves forward across a month boundary", () => {
    expect(addDaysIso("2026-06-29", 3)).toBe("2026-07-02");
  });

  it("moves backward across a month boundary", () => {
    expect(addDaysIso("2026-07-01", -2)).toBe("2026-06-29");
  });

  it("returns the same date for n = 0", () => {
    expect(addDaysIso("2026-06-15", 0)).toBe("2026-06-15");
  });
});

describe("formatTimeLabel", () => {
  it("formats a morning time", () => {
    expect(formatTimeLabel("09:05")).toBe("9:05 AM");
  });

  it("formats noon as 12 PM", () => {
    expect(formatTimeLabel("12:00")).toBe("12:00 PM");
  });

  it("formats midnight as 12 AM", () => {
    expect(formatTimeLabel("00:30")).toBe("12:30 AM");
  });

  it("formats an afternoon time", () => {
    expect(formatTimeLabel("14:30")).toBe("2:30 PM");
  });
});

describe("dayPartForTime", () => {
  it("treats before noon as morning", () => {
    expect(dayPartForTime("09:00")).toBe("morning");
    expect(dayPartForTime("11:59")).toBe("morning");
  });

  it("treats noon through 4pm as afternoon", () => {
    expect(dayPartForTime("12:00")).toBe("afternoon");
    expect(dayPartForTime("16:59")).toBe("afternoon");
  });

  it("treats 5pm and later as evening", () => {
    expect(dayPartForTime("17:00")).toBe("evening");
    expect(dayPartForTime("20:00")).toBe("evening");
  });
});

describe("sortByTime", () => {
  it("orders appointments chronologically without mutating the input", () => {
    const input = [appointment({ id: "b", time: "14:00" }), appointment({ id: "a", time: "09:00" })];
    const sorted = sortByTime(input);
    expect(sorted.map((a) => a.id)).toEqual(["a", "b"]);
    expect(input.map((a) => a.id)).toEqual(["b", "a"]);
  });
});

describe("appointmentsOnDate", () => {
  it("filters to one date and sorts by time", () => {
    const appointments = [
      appointment({ id: "a", date: "2026-06-01", time: "14:00" }),
      appointment({ id: "b", date: "2026-06-02", time: "09:00" }),
      appointment({ id: "c", date: "2026-06-01", time: "09:00" }),
    ];
    expect(appointmentsOnDate(appointments, "2026-06-01").map((a) => a.id)).toEqual(["c", "a"]);
  });
});

describe("buildDayChapters", () => {
  it("groups into morning/afternoon/evening and drops empty chapters", () => {
    const dayAppointments = [
      appointment({ id: "a", time: "09:00" }),
      appointment({ id: "b", time: "13:00" }),
      appointment({ id: "c", time: "10:00" }),
    ];
    const chapters = buildDayChapters(dayAppointments);
    expect(chapters.map((c) => c.key)).toEqual(["morning", "afternoon"]);
    expect(chapters[0].appointments.map((a) => a.id)).toEqual(["a", "c"]);
    expect(chapters[1].appointments.map((a) => a.id)).toEqual(["b"]);
  });

  it("returns an empty array for a day with no appointments", () => {
    expect(buildDayChapters([])).toEqual([]);
  });
});

describe("buildDayStrip", () => {
  it("spans the requested range and marks today", () => {
    const strip = buildDayStrip([], "2026-06-15", "2026-06-15", 2, 2);
    expect(strip.map((d) => d.iso)).toEqual([
      "2026-06-13",
      "2026-06-14",
      "2026-06-15",
      "2026-06-16",
      "2026-06-17",
    ]);
    expect(strip.find((d) => d.iso === "2026-06-15")?.isToday).toBe(true);
    expect(strip.filter((d) => d.isToday)).toHaveLength(1);
  });

  it("counts appointments per day", () => {
    const appointments = [
      appointment({ id: "a", date: "2026-06-15" }),
      appointment({ id: "b", date: "2026-06-15" }),
      appointment({ id: "c", date: "2026-06-16" }),
    ];
    const strip = buildDayStrip(appointments, "2026-06-15", "2026-06-15", 0, 1);
    expect(strip.find((d) => d.iso === "2026-06-15")?.count).toBe(2);
    expect(strip.find((d) => d.iso === "2026-06-16")?.count).toBe(1);
  });

  it("always includes the selected day even if it's outside the default range", () => {
    const strip = buildDayStrip([], "2026-06-15", "2026-07-01", 1, 1);
    expect(strip.some((d) => d.iso === "2026-07-01")).toBe(true);
  });
});

describe("statusLabel", () => {
  it("returns a human label for every status", () => {
    expect(statusLabel("pending")).toBe("Awaiting confirmation");
    expect(statusLabel("confirmed")).toBe("Confirmed");
    expect(statusLabel("completed")).toBe("Completed");
    expect(statusLabel("cancelled")).toBe("Cancelled");
    expect(statusLabel("contacted")).toBe("Contacted");
  });
});

describe("buildDaySummaryLine", () => {
  it("reports no appointments for an empty day", () => {
    expect(buildDaySummaryLine([])).toBe("No appointments scheduled");
  });

  it("reports a plain count when nothing is pending", () => {
    const dayAppointments = [appointment({ id: "a", status: "confirmed" }), appointment({ id: "b", status: "completed" })];
    expect(buildDaySummaryLine(dayAppointments)).toBe("2 appointments");
  });

  it("singularizes one appointment", () => {
    expect(buildDaySummaryLine([appointment({ status: "confirmed" })])).toBe("1 appointment");
  });

  it("calls out a single pending appointment as 'one'", () => {
    const dayAppointments = [appointment({ id: "a", status: "pending" }), appointment({ id: "b", status: "confirmed" })];
    expect(buildDaySummaryLine(dayAppointments)).toBe("2 appointments · one awaiting confirmation");
  });

  it("calls out multiple pending appointments by number", () => {
    const dayAppointments = [
      appointment({ id: "a", status: "pending" }),
      appointment({ id: "b", status: "pending" }),
      appointment({ id: "c", status: "confirmed" }),
    ];
    expect(buildDaySummaryLine(dayAppointments)).toBe("3 appointments · 2 awaiting confirmation");
  });
});
