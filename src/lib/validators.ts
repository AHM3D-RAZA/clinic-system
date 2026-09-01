import type { BookingFormErrors, CreateBookingInput } from "@/types/booking";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+()\-.\s]{7,20}$/;
const VALID_TIME_SLOTS = new Set(["morning", "afternoon", "evening"]);

/**
 * The data shape we accept from an untrusted client before we know it's
 * a valid CreateBookingInput. Every field is optional/unknown-typed
 * because it's coming straight off a form or a JSON request body.
 */
export interface RawBookingFormValues {
  fullName?: string;
  email?: string;
  phone?: string;
  patientType?: string;
  serviceId?: string;
  preferredDate?: string;
  preferredTime?: string;
  notes?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: BookingFormErrors;
}

/**
 * Validates raw booking form values. Used by the client form for
 * inline/immediate feedback AND by the API route as the authoritative
 * check — same rules, no drift between the two.
 *
 * `knownServiceIds` is passed in (rather than imported) so this stays a
 * pure function that isn't coupled to which clinic's services exist.
 */
export function validateBookingForm(
  values: RawBookingFormValues,
  knownServiceIds: string[],
): ValidationResult {
  const errors: BookingFormErrors = {};

  const fullName = values.fullName?.trim() ?? "";
  if (!fullName) {
    errors["patient.fullName"] = "Let us know what to call you.";
  } else if (fullName.length < 2) {
    errors["patient.fullName"] = "That name looks a little short.";
  }

  const email = values.email?.trim() ?? "";
  if (!email) {
    errors["patient.email"] = "We'll need an email to confirm your visit.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors["patient.email"] = "That email doesn't look quite right.";
  }

  const phone = values.phone?.trim() ?? "";
  if (!phone) {
    errors["patient.phone"] = "A phone number helps us reach you quickly.";
  } else if (!PHONE_PATTERN.test(phone)) {
    errors["patient.phone"] = "That phone number doesn't look quite right.";
  }

  if (values.patientType !== "new" && values.patientType !== "existing") {
    errors["patient.patientType"] = "Let us know if you've visited before.";
  }

  const serviceId = values.serviceId?.trim() ?? "";
  if (!serviceId) {
    errors.serviceId = "Pick what you're coming in for.";
  } else if (!knownServiceIds.includes(serviceId)) {
    errors.serviceId = "Please choose one of the listed treatments.";
  }

  const preferredDate = values.preferredDate?.trim() ?? "";
  if (!preferredDate) {
    errors.preferredDate = "Choose a date that works for you.";
  } else {
    const chosen = new Date(`${preferredDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(chosen.getTime())) {
      errors.preferredDate = "That date doesn't look valid.";
    } else if (chosen < today) {
      errors.preferredDate = "Pick a date that hasn't passed yet.";
    }
  }

  if (!values.preferredTime || !VALID_TIME_SLOTS.has(values.preferredTime)) {
    errors.preferredTime = "Choose a time of day that suits you.";
  }

  if (values.notes && values.notes.length > 600) {
    errors.notes = "Let's keep this under 600 characters — we'll fill in the rest at your visit.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Narrows validated raw values into a proper CreateBookingInput. Only
 * call this after `validateBookingForm` reports `valid: true`.
 */
export function toCreateBookingInput(
  values: RawBookingFormValues,
  clinicId: string,
): CreateBookingInput {
  return {
    clinicId,
    patient: {
      fullName: values.fullName!.trim(),
      email: values.email!.trim(),
      phone: values.phone!.trim(),
      patientType: values.patientType as "new" | "existing",
    },
    serviceId: values.serviceId!.trim(),
    preferredDate: values.preferredDate!.trim(),
    preferredTime: values.preferredTime as CreateBookingInput["preferredTime"],
    notes: values.notes?.trim() || undefined,
  };
}
