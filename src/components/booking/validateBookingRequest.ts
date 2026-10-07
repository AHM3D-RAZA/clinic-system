import type { BookingFormErrors } from "@/types/booking";
import { validateBookingForm, type RawBookingFormValues } from "@/lib/validators";
import { closedDayError } from "@/lib/bookingDays";

/**
 * The form's full check: the shared field rules plus the "open days
 * only" rule. Past-date and every other existing rule still come from
 * validateBookingForm unchanged; a closed day only adds an error when
 * the date has no other problem.
 */
export function validateBookingRequest(values: RawBookingFormValues, knownServiceIds: string[]) {
  const { errors } = validateBookingForm(values, knownServiceIds);
  const closedDay = closedDayError(values.preferredDate);
  const merged: BookingFormErrors =
    closedDay && !errors.preferredDate ? { ...errors, preferredDate: closedDay } : errors;
  return { valid: Object.keys(merged).length === 0, errors: merged };
}
