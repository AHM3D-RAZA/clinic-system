import type { BookingRequest, PreferredTimeSlot } from "@/types/booking";
import type { Appointment } from "@/types/appointment";
import { generateId } from "@/lib/utils";

/**
 * A booking request only ever carries a loose time-of-day preference,
 * never a specific clock time — so turning one into an appointment
 * needs *some* deterministic default. This is that default: one fixed
 * clock time per bucket, not a scheduling engine that looks at doctor
 * availability, other appointments, or clinic hours. Good enough for
 * an MVP demo; a real scheduling system would replace this function's
 * body, not its signature.
 */
const DEFAULT_TIME_BY_SLOT: Record<PreferredTimeSlot, string> = {
  morning: "09:00",
  afternoon: "13:00",
  evening: "17:00",
};

/**
 * Every derived appointment gets this duration. There's no
 * service→duration lookup anywhere in the app to reuse (the seeded
 * appointment data just hardcodes a duration per record), so rather
 * than invent one, this uses the shortest, most common value already
 * present in that seed data — a deliberately simple constant, not a
 * scheduling rule.
 */
const DEFAULT_DURATION_MINUTES = 30;

/**
 * Converts a booking request into a complete `Appointment`, once a
 * doctor has been chosen for it. Pure — no persistence, no id lookups
 * beyond generating a new one, no clinic/doctor validation (that's the
 * caller's job, see `services/confirmationService.ts`). Given the same
 * inputs, always produces the same shape.
 *
 * `time` lets a caller override the derived-from-preferredTime default
 * (e.g. a future UI that lets staff pick an exact slot); omitted, it
 * falls back to `DEFAULT_TIME_BY_SLOT[booking.preferredTime]`.
 */
export function deriveAppointmentFromBooking(booking: BookingRequest, doctorId: string, time?: string): Appointment {
  return {
    id: generateId("apt"),
    clinicId: booking.clinicId,
    patientName: booking.patient.fullName,
    patientType: booking.patient.patientType,
    doctorId,
    serviceId: booking.serviceId,
    date: booking.preferredDate,
    time: time ?? DEFAULT_TIME_BY_SLOT[booking.preferredTime],
    durationMinutes: DEFAULT_DURATION_MINUTES,
    status: "confirmed",
    sourceBookingId: booking.id,
  };
}
