import { describe, expect, it } from "vitest";
import { toCreateBookingInput, validateBookingForm } from "@/lib/validators";

const KNOWN_SERVICES = ["checkups-cleanings", "cosmetic-whitening"];

const VALID_VALUES = {
  fullName: "Imran Qureshi",
  email: "imran@example.com",
  phone: "+1 (555) 201-9988",
  patientType: "new",
  serviceId: "checkups-cleanings",
  preferredDate: "2099-01-01",
  preferredTime: "morning",
  notes: "First visit, a little nervous.",
};

describe("validateBookingForm", () => {
  it("accepts a fully valid submission", () => {
    const { valid, errors } = validateBookingForm(VALID_VALUES, KNOWN_SERVICES);
    expect(valid).toBe(true);
    expect(errors).toEqual({});
  });

  it("rejects a completely empty submission with one error per required field", () => {
    const { valid, errors } = validateBookingForm({}, KNOWN_SERVICES);
    expect(valid).toBe(false);
    expect(Object.keys(errors)).toEqual(
      expect.arrayContaining([
        "patient.fullName",
        "patient.email",
        "patient.phone",
        "patient.patientType",
        "serviceId",
        "preferredDate",
        "preferredTime",
      ]),
    );
    // notes is optional — no error for an absent optional field
    expect(errors.notes).toBeUndefined();
  });

  it.each([
    ["plainaddress", false],
    ["missing-at-sign.com", false],
    ["two@@at.com", false],
    ["a@b.co", true],
    ["person.name+tag@sub.domain.com", true],
  ])("treats %s as valid email = %s", (email, shouldBeValid) => {
    const { errors } = validateBookingForm({ ...VALID_VALUES, email }, KNOWN_SERVICES);
    expect(errors["patient.email"] === undefined).toBe(shouldBeValid);
  });

  it.each([
    ["abc", false], // too short / not phone-shaped
    ["555", false],
    ["+1 555 201 9988", true],
    ["(555) 201-9988", true],
    ["5552019988", true],
  ])("treats %s as valid phone = %s", (phone, shouldBeValid) => {
    const { errors } = validateBookingForm({ ...VALID_VALUES, phone }, KNOWN_SERVICES);
    expect(errors["patient.phone"] === undefined).toBe(shouldBeValid);
  });

  it("rejects a serviceId that isn't in the clinic's known services", () => {
    const { valid, errors } = validateBookingForm(
      { ...VALID_VALUES, serviceId: "not-a-real-service" },
      KNOWN_SERVICES,
    );
    expect(valid).toBe(false);
    expect(errors.serviceId).toBeDefined();
  });

  it("rejects a preferredDate in the past", () => {
    const { valid, errors } = validateBookingForm(
      { ...VALID_VALUES, preferredDate: "2000-01-01" },
      KNOWN_SERVICES,
    );
    expect(valid).toBe(false);
    expect(errors.preferredDate).toBeDefined();
  });

  it("rejects an invalid preferredTime value", () => {
    const { valid, errors } = validateBookingForm(
      { ...VALID_VALUES, preferredTime: "midnight" },
      KNOWN_SERVICES,
    );
    expect(valid).toBe(false);
    expect(errors.preferredTime).toBeDefined();
  });

  it("rejects a patientType outside the new/existing enum", () => {
    const { valid, errors } = validateBookingForm(
      { ...VALID_VALUES, patientType: "returning-alien" },
      KNOWN_SERVICES,
    );
    expect(valid).toBe(false);
    expect(errors["patient.patientType"]).toBeDefined();
  });

  it("rejects notes over the length limit", () => {
    const { valid, errors } = validateBookingForm(
      { ...VALID_VALUES, notes: "a".repeat(601) },
      KNOWN_SERVICES,
    );
    expect(valid).toBe(false);
    expect(errors.notes).toBeDefined();
  });

  it("accepts notes right at the length limit", () => {
    const { valid } = validateBookingForm({ ...VALID_VALUES, notes: "a".repeat(600) }, KNOWN_SERVICES);
    expect(valid).toBe(true);
  });
});

describe("toCreateBookingInput", () => {
  it("narrows validated raw values into a well-typed CreateBookingInput", () => {
    const input = toCreateBookingInput(VALID_VALUES, "aster");
    expect(input).toEqual({
      clinicId: "aster",
      patient: {
        fullName: "Imran Qureshi",
        email: "imran@example.com",
        phone: "+1 (555) 201-9988",
        patientType: "new",
      },
      serviceId: "checkups-cleanings",
      preferredDate: "2099-01-01",
      preferredTime: "morning",
      notes: "First visit, a little nervous.",
    });
  });

  it("trims whitespace and omits an empty notes field", () => {
    const input = toCreateBookingInput({ ...VALID_VALUES, fullName: "  Spaced Name  ", notes: "   " }, "aster");
    expect(input.patient.fullName).toBe("Spaced Name");
    expect(input.notes).toBeUndefined();
  });
});
