import { appointmentsTable } from "@/data/appointmentsTable";
import type { Appointment } from "@/types/appointment";

/**
 * Mirrors the shape of `services/bookingService.ts`: callers (the
 * appointments page, and now the booking-confirmation flow) only ever
 * talk to this service, never to `data/appointmentsTable.ts` directly.
 *
 * `create` is deliberately narrow: it takes a complete, already-built
 * `Appointment` (see `lib/deriveAppointment.ts`, which generates the id
 * and fills in every field) and just persists it — this is not a
 * general appointment CRUD surface.
 */
async function listByClinic(clinicId: string): Promise<Appointment[]> {
  return appointmentsTable.findByClinic(clinicId);
}

async function create(appointment: Appointment): Promise<Appointment> {
  return appointmentsTable.insert(appointment);
}

export const appointmentService = { listByClinic, create };
