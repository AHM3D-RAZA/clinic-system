import type { Appointment } from "@/types/appointment";
import type { BookingStatus } from "@/types/booking";
import { formatTimeLabel } from "./appointments";

/**
 * The closest honest read of "booking origin" available from the
 * current domain: `Appointment` has no foreign key back to a specific
 * `BookingRequest` (see types/appointment.ts — that link was
 * deliberately never built), so this reads `patientType` instead of
 * inventing a cross-domain reference that doesn't exist in the data.
 */
export function patientOriginPhrase(patientType: Appointment["patientType"]): string {
  return patientType === "new" ? "a new patient, on their first visit" : "a returning patient";
}

/**
 * The sentence shown in the detail panel — one line of prose rather
 * than a field-by-field form, in keeping with the daybook's editorial
 * voice. `dateLabel` is the caller's already-formatted display date
 * (see `formatDateForDisplay` in lib/utils.ts).
 */
export function describeAppointment(
  appointment: Appointment,
  serviceName: string,
  doctorName: string,
  dateLabel: string,
): string {
  const origin = patientOriginPhrase(appointment.patientType);
  const time = formatTimeLabel(appointment.time);
  return `${appointment.patientName} is ${origin}, booked in for ${serviceName} with ${doctorName} — ${dateLabel} at ${time} (${appointment.durationMinutes} min).`;
}

export interface StatusAction {
  label: string;
  nextStatus: BookingStatus;
}

/**
 * The restrained set of next-state moves available from a given
 * status — not a general state machine, just the two operationally
 * useful transitions the brief asks for. Terminal states
 * (completed/cancelled) offer nothing: reopening a finished or
 * cancelled appointment isn't a "small operational action."
 */
export function availableStatusActions(status: BookingStatus): StatusAction[] {
  switch (status) {
    case "pending":
    case "contacted":
      return [
        { label: "Confirm appointment", nextStatus: "confirmed" },
        { label: "Cancel appointment", nextStatus: "cancelled" },
      ];
    case "confirmed":
      return [{ label: "Cancel appointment", nextStatus: "cancelled" }];
    case "completed":
    case "cancelled":
      return [];
  }
}
