import { APPOINTMENTS } from "@/data/appointmentMockData";
import type { Appointment } from "@/types/appointment";

/**
 * Mirrors the shape of `services/bookingService.ts`: callers (today,
 * the appointments page) only ever talk to this service, never to
 * `data/appointmentMockData.ts` directly. Swapping the mock array for
 * a real database/API means changing the one function body below.
 *
 * Read-only for this phase — appointments aren't created or edited
 * here yet, only listed.
 */
async function listByClinic(clinicId: string): Promise<Appointment[]> {
  return APPOINTMENTS.filter((appointment) => appointment.clinicId === clinicId);
}

export const appointmentService = { listByClinic };
