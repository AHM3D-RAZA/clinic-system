import { describe, expect, it } from "vitest";
import { CLOSED_DAY_MESSAGE } from "@/lib/bookingDays";
import { validateBookingRequest } from "./validateBookingRequest";

const SERVICES = ["checkups-cleanings"];

function valuesFor(preferredDate: string) {
  return {
    fullName: "Imran Qureshi",
    email: "imran@example.com",
    phone: "+1 555 201 9988",
    patientType: "new",
    serviceId: "checkups-cleanings",
    preferredDate,
    preferredTime: "morning",
    notes: "",
  };
}

describe("validateBookingRequest", () => {
  it("rejects a Sunday far enough in the future to otherwise be valid", () => {
    const { valid, errors } = validateBookingRequest(valuesFor("2099-05-03"), SERVICES); // Sunday
    expect(valid).toBe(false);
    expect(errors.preferredDate).toBe(CLOSED_DAY_MESSAGE);
  });

  it("accepts a future Monday–Saturday date", () => {
    const { valid, errors } = validateBookingRequest(valuesFor("2099-05-05"), SERVICES); // Tuesday
    expect(valid).toBe(true);
    expect(errors).toEqual({});
  });

  it("still reports a past date as past, not as a closed day", () => {
    const { valid, errors } = validateBookingRequest(valuesFor("2020-01-05"), SERVICES); // a Sunday, long gone
    expect(valid).toBe(false);
    expect(errors.preferredDate).toBe("Pick a date that hasn't passed yet.");
  });
});
