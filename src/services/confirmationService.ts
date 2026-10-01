import { bookingService } from "@/services/bookingService";
import { appointmentService } from "@/services/appointmentService";
import { clinicService } from "@/services/clinicService";
import { deriveAppointmentFromBooking } from "@/lib/deriveAppointment";
import type { BookingRequest } from "@/types/booking";
import type { Appointment } from "@/types/appointment";

export type ConfirmBookingErrorCode = "not_found" | "invalid_state" | "invalid_doctor" | "persistence_error";

export type ConfirmBookingResult =
  | { ok: true; booking: BookingRequest; appointment: Appointment }
  | { ok: false; code: ConfirmBookingErrorCode; message: string };

const CONFIRMABLE_STATUSES: BookingRequest["status"][] = ["pending", "contacted"];

/**
 * The one place that knows confirming a booking means "create an
 * appointment, then mark the booking confirmed" — neither
 * `bookingService` nor `appointmentService` know about each other or
 * about this workflow.
 *
 * Not a database transaction (there's no real database here to give
 * one): the appointment is written first, and the booking is only
 * updated after that write succeeds. If the appointment write fails,
 * the booking is never touched — nothing to roll back. If the booking
 * update fails *after* the appointment was already created, this
 * returns an explicit error rather than reporting success; the
 * appointment does end up persisted with no matching confirmed
 * booking in that narrow failure window, and this function does not
 * attempt to undo it (see the final report's "known limitations" for
 * why: a delete-on-failure step is itself a write that can fail, and
 * un-doing a successful, valid appointment to paper over an unrelated
 * write failure trades one inconsistency for a different one).
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
  const doctor = clinicBundle?.doctors.find((d) => d.id === doctorId);
  if (!doctor) {
    return { ok: false, code: "invalid_doctor", message: "Choose a valid doctor for this clinic before confirming." };
  }

  const appointment = deriveAppointmentFromBooking(booking, doctorId);

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

  const updatedBooking = await bookingService.confirmWithDoctor(bookingId, doctorId).catch(() => undefined);
  if (!updatedBooking) {
    return {
      ok: false,
      code: "persistence_error",
      message:
        "The appointment was created, but updating the booking request failed. Check the appointments list — the appointment may already exist — and retry confirming this booking.",
    };
  }

  return { ok: true, booking: updatedBooking, appointment: createdAppointment };
}
