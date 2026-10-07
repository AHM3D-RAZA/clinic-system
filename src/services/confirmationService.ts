import { bookingService } from "@/services/bookingService";
import { appointmentService } from "@/services/appointmentService";
import { clinicService } from "@/services/clinicService";
import { patientService } from "@/services/patientService";
import { deriveAppointmentFromBooking } from "@/lib/deriveAppointment";
import { todayIsoDate } from "@/lib/appointments";
import type { BookingRequest } from "@/types/booking";
import type { Appointment } from "@/types/appointment";
import type { Patient } from "@/types/patient";

export type ConfirmBookingErrorCode =
  | "not_found"
  | "invalid_state"
  | "invalid_doctor"
  | "invalid_service"
  | "invalid_patient"
  | "date_in_past"
  | "persistence_error";

export type ConfirmBookingResult =
  | { ok: true; booking: BookingRequest; appointment: Appointment; patient: Patient }
  | { ok: false; code: ConfirmBookingErrorCode; message: string };

const CONFIRMABLE_STATUSES: BookingRequest["status"][] = ["pending", "contacted"];

type PatientResolution =
  | { ok: true; patient: Patient; isNew: false }
  | { ok: true; patient: undefined; isNew: true }
  | { ok: false };

/**
 * Finds the patient this booking belongs to, without writing anything:
 * the booking's own `patientId` if it has one (which must still exist
 * in this clinic), otherwise an existing patient with the same email.
 * No match means this is a new patient and one will be created.
 */
async function resolvePatient(booking: BookingRequest): Promise<PatientResolution> {
  if (booking.patientId) {
    const patient = await patientService.getById(booking.patientId);
    return patient && patient.clinicId === booking.clinicId ? { ok: true, patient, isNew: false } : { ok: false };
  }
  const match = await patientService.findByEmail(booking.clinicId, booking.patient.email);
  return match ? { ok: true, patient: match, isNew: false } : { ok: true, patient: undefined, isNew: true };
}

/**
 * The one place that knows confirming a booking means "make sure the
 * patient exists, create an appointment, then mark the booking
 * confirmed" — and the one place that checks the booking is actually
 * confirmable: the patient resolves, the doctor and service exist for
 * this clinic, and the requested date hasn't already passed. (Doctor
 * overlap and opening hours are deliberately not checked here — they
 * belong to the scheduling workstream.)
 *
 * Not a database transaction (there's no real database here to give
 * one). All checks run before anything is written. Then, in order: a
 * new patient record (only if there's no existing one), the
 * appointment, and finally the booking update. If a later write fails,
 * earlier ones are not undone — a delete-on-failure step is itself a
 * write that can fail, and removing a valid record to paper over an
 * unrelated failure trades one inconsistency for another. The failure
 * is reported explicitly instead of as success.
 */
export async function confirmBooking(bookingId: string, doctorId: string): Promise<ConfirmBookingResult> {
  const booking = await bookingService.getById(bookingId);
  if (!booking) {
    return { ok: false, code: "not_found", message: "That booking request no longer exists." };
  }

  if (!CONFIRMABLE_STATUSES.includes(booking.status)) {
    return {
      ok: false,
      code: "invalid_state",
      message: `This request is already ${booking.status} and can't be confirmed again.`,
    };
  }

  const clinicBundle = await clinicService.getClinicContent(booking.clinicId).catch(() => undefined);
  if (!clinicBundle?.doctors.some((d) => d.id === doctorId)) {
    return { ok: false, code: "invalid_doctor", message: "Choose a valid doctor for this clinic before confirming." };
  }
  if (!clinicBundle.services.some((s) => s.id === booking.serviceId)) {
    return {
      ok: false,
      code: "invalid_service",
      message: "This request is for a treatment this clinic doesn't offer, so it can't be confirmed.",
    };
  }

  if (booking.preferredDate < todayIsoDate()) {
    return {
      ok: false,
      code: "date_in_past",
      message: "The date this patient asked for has already passed. Agree a new date with them before confirming.",
    };
  }

  const resolution = await resolvePatient(booking);
  if (!resolution.ok) {
    return {
      ok: false,
      code: "invalid_patient",
      message: "This request points to a patient record that no longer exists, so it can't be confirmed.",
    };
  }

  let patient: Patient;
  if (resolution.isNew) {
    try {
      patient = await patientService.create({
        clinicId: booking.clinicId,
        fullName: booking.patient.fullName,
        email: booking.patient.email,
        phone: booking.patient.phone,
        patientType: booking.patient.patientType,
        primaryDoctorId: doctorId,
        patientSince: todayIsoDate(),
      });
    } catch {
      return {
        ok: false,
        code: "persistence_error",
        message: "Couldn't create the patient record. The booking was left unconfirmed — nothing was changed.",
      };
    }
  } else {
    patient = resolution.patient;
  }

  const appointment = deriveAppointmentFromBooking(booking, doctorId, patient.id);

  let createdAppointment: Appointment;
  try {
    createdAppointment = await appointmentService.create(appointment);
  } catch {
    return {
      ok: false,
      code: "persistence_error",
      message: "Couldn't create the appointment. The booking was left unconfirmed — nothing was changed.",
    };
  }

  const updatedBooking = await bookingService.confirmWithDoctor(bookingId, doctorId, patient.id).catch(() => undefined);
  if (!updatedBooking) {
    return {
      ok: false,
      code: "persistence_error",
      message:
        "The appointment was created, but updating the booking request failed. Check the appointments list — the appointment may already exist — and retry confirming this booking.",
    };
  }

  return { ok: true, booking: updatedBooking, appointment: createdAppointment, patient };
}
