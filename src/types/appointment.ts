import type { BookingStatus, PatientType } from "./booking";

/**
 * A scheduled clinic appointment: the next stage after a booking
 * request has a specific time and doctor attached to it. Deliberately
 * reuses `BookingStatus`/`PatientType` from `./booking` rather than
 * defining parallel enums — an appointment's status is the same
 * lifecycle concept as a booking's, just further along.
 *
 * Distinct from `BookingRequest` (see `./booking`) because a request
 * only carries a *preferred* date and a loose time-of-day slot; an
 * appointment carries a specific date, a specific clock time, and a
 * required (not optional) doctor — it represents a slot that's
 * actually on the schedule.
 */
export interface Appointment {
  id: string;
  clinicId: string;
  patientName: string;
  patientType: PatientType;
  doctorId: string;
  serviceId: string;
  /** ISO date, yyyy-mm-dd */
  date: string;
  /** 24-hour clock, HH:mm */
  time: string;
  durationMinutes: number;
  status: BookingStatus;
}
