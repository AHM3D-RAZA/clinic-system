import { describe, it, expect } from "vitest";
import {
  buildOverviewSummary,
  buildServiceNameLookup,
  greetingLabel,
  greetingPeriod,
  todayIsoDate,
} from "./dashboardOverview";
import { appointmentsOnDate, todayIsoDate as appointmentsTodayIsoDate } from "./appointments";
import type { BookingRequest } from "@/types/booking";
import type { Appointment } from "@/types/appointment";

function appointment(overrides: Partial<Appointment>): Appointment {
  return {
    id: "apt_1",
    clinicId: "aster",
    patientId: "pat_1",
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
    const summary = buildOverviewSummary([], [], "2026-06-01");
    expect(summary).toEqual({ pending: [], today: [], recent: [], totalCount: 0 });
  });

  it("filters pending requests regardless of other statuses present", () => {
    const bookings = [
      booking({ id: "a", status: "pending" }),
      booking({ id: "b", status: "confirmed" }),
      booking({ id: "c", status: "cancelled" }),
    ];
    const summary = buildOverviewSummary(bookings, [], "2026-06-01");
    expect(summary.pending.map((b) => b.id)).toEqual(["a"]);
  });

  it("takes today from real appointments, not from a booking's preferred date", () => {
    const bookings = [booking({ id: "a", preferredDate: "2026-06-01" })];
    const appointments = [
      appointment({ id: "late", time: "15:00" }),
      appointment({ id: "early", time: "09:00" }),
      appointment({ id: "other-day", date: "2026-06-02" }),
    ];
    const summary = buildOverviewSummary(bookings, appointments, "2026-06-01");
    expect(summary.today.map((x) => x.id)).toEqual(["early", "late"]);
  });

  it("leaves cancelled appointments off today's books", () => {
    const appointments = [appointment({ id: "kept" }), appointment({ id: "gone", status: "cancelled" })];
    expect(buildOverviewSummary([], appointments, "2026-06-01").today.map((x) => x.id)).toEqual(["kept"]);
  });

  it("agrees with the Appointments screen about who is booked today", () => {
    const appointments = [
      appointment({ id: "a" }),
      appointment({ id: "b", time: "11:00", status: "pending" }),
      appointment({ id: "c", date: "2026-06-03" }),
    ];
    const todayIso = "2026-06-01";
    const overviewToday = buildOverviewSummary([], appointments, todayIso).today;
    expect(overviewToday).toEqual(appointmentsOnDate(appointments, todayIso));
  });

  it("orders recent bookings newest-created first", () => {
    const bookings = [
      booking({ id: "old", createdAt: "2026-01-01T00:00:00.000Z" }),
      booking({ id: "new", createdAt: "2026-06-01T00:00:00.000Z" }),
      booking({ id: "mid", createdAt: "2026-03-01T00:00:00.000Z" }),
    ];
    const summary = buildOverviewSummary(bookings, [], "2026-06-01");
    expect(summary.recent.map((b) => b.id)).toEqual(["new", "mid", "old"]);
  });

  it("caps the recent pool at 20 even with more on file", () => {
    const bookings = Array.from({ length: 25 }, (_, i) =>
      booking({ id: `b${i}`, createdAt: `2026-01-${String(i + 1).padStart(2, "0")}T00:00:00.000Z` }),
    );
    const summary = buildOverviewSummary(bookings, [], "2026-06-01");
    expect(summary.recent).toHaveLength(20);
    expect(summary.totalCount).toBe(25);
  });

  it("does not mutate the input array", () => {
    const bookings = [booking({ id: "a" }), booking({ id: "b" })];
    const copy = [...bookings];
    buildOverviewSummary(bookings, [], "2026-06-01");
    expect(bookings).toEqual(copy);
  });
});

describe("todayIsoDate", () => {
  it("formats a date as yyyy-mm-dd", () => {
    expect(todayIsoDate(new Date(2026, 2, 14, 8))).toBe("2026-03-14");
  });

  it("is the same local-date function the Appointments screen uses", () => {
    // Late evening local time: a UTC-based date could already be "tomorrow".
    const lateEvening = new Date(2026, 2, 14, 23, 30);
    expect(todayIsoDate(lateEvening)).toBe(appointmentsTodayIsoDate(lateEvening));
    expect(todayIsoDate(lateEvening)).toBe("2026-03-14");
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
