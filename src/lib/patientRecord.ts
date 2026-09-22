import type { Patient } from "@/types/patient";
import type { Appointment } from "@/types/appointment";
import type { BookingRequest } from "@/types/booking";

/**
 * Appointments have no `patientId` yet (see `types/appointment.ts`) —
 * they're matched to a patient by name, the same loose join the rest
 * of the mock data uses. Good enough for a read-only Phase 2; a real
 * schema would carry a foreign key instead.
 */
export function findPatientAppointments(appointments: Appointment[], patient: Patient): Appointment[] {
  const name = patient.fullName.trim().toLowerCase();
  return appointments.filter((appointment) => appointment.patientName.trim().toLowerCase() === name);
}

/** Booking requests carry an email, so those can be matched exactly. */
export function findPatientBookingRequests(bookings: BookingRequest[], patient: Patient): BookingRequest[] {
  const email = patient.email.trim().toLowerCase();
  return bookings.filter((booking) => booking.patient.email.trim().toLowerCase() === email);
}

export interface PatientSchedule {
  upcoming: Appointment[];
  recent: Appointment[];
}

/**
 * Splits a patient's matched appointments into what's ahead and what's
 * already happened, most-relevant first in each direction. `recent` is
 * capped so a long-standing patient's record stays a quick read, not a
 * full visit log.
 */
export function splitPatientSchedule(appointments: Appointment[], todayIso: string, recentLimit = 3): PatientSchedule {
  const upcoming = appointments
    .filter((a) => a.date >= todayIso)
    .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)));

  const recent = appointments
    .filter((a) => a.date < todayIso)
    .sort((a, b) => (a.date === b.date ? b.time.localeCompare(a.time) : b.date.localeCompare(a.date)))
    .slice(0, recentLimit);

  return { upcoming, recent };
}
