import type { Patient } from "@/types/patient";
import type { Appointment } from "@/types/appointment";
import type { BookingRequest } from "@/types/booking";

/** Every appointment that belongs to this patient, by `patientId`. */
export function findPatientAppointments(appointments: Appointment[], patient: Patient): Appointment[] {
  return appointments.filter((appointment) => appointment.patientId === patient.id);
}

/** Every booking request that belongs to this patient, by `patientId`. */
export function findPatientBookingRequests(bookings: BookingRequest[], patient: Patient): BookingRequest[] {
  return bookings.filter((booking) => booking.patientId === patient.id);
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

/**
 * Returns the patient with `nextAppointment` and `lastVisit` taken from
 * real appointments, so the register and the record can never disagree
 * with the schedule:
 *
 * - `nextAppointment`: the earliest pending/confirmed appointment from
 *   today onwards. Nothing is stored on the patient, so with no such
 *   appointment there is no next appointment.
 * - `lastVisit`: the later of the stored value and the most recent
 *   completed appointment (a completed visit can only move it forward).
 */
export function withDerivedSchedule(patient: Patient, appointments: Appointment[], todayIso: string): Patient {
  const mine = findPatientAppointments(appointments, patient);

  const next = mine
    .filter((a) => a.date >= todayIso && (a.status === "pending" || a.status === "confirmed"))
    .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)))[0];

  const lastCompleted = mine
    .filter((a) => a.status === "completed" && a.date <= todayIso)
    .map((a) => a.date)
    .sort()
    .at(-1);

  const lastVisit = [patient.lastVisit, lastCompleted].filter((d): d is string => !!d).sort().at(-1);

  const { nextAppointment: _stale, ...rest } = patient;
  void _stale;
  return {
    ...rest,
    ...(lastVisit ? { lastVisit } : {}),
    ...(next
      ? { nextAppointment: { appointmentId: next.id, dateIso: next.date, time: next.time, serviceId: next.serviceId } }
      : {}),
  };
}
