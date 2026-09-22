import type { Metadata } from "next";
import { clinicService } from "@/services/clinicService";
import { appointmentService } from "@/services/appointmentService";
import { DEFAULT_CLINIC_ID } from "@/config/clinics";
import { todayIsoDate } from "@/lib/appointments";
import { AppointmentsWorkspace } from "@/components/dashboard/appointments/AppointmentsWorkspace";

/**
 * Mirrors dashboard/page.tsx: this reads live appointment data, so it
 * must never be a build-time snapshot.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Appointments — Dashboard",
  description: "The clinic's working schedule, day by day.",
};

/**
 * Reads appointment data through `appointmentService` (the appointment
 * equivalent of `bookingService`) — never through
 * `data/appointmentMockData.ts` directly — and clinic content through
 * the same `clinicService` every other dashboard page uses.
 */
export default async function AppointmentsPage() {
  const [{ services, doctors }, appointments] = await Promise.all([
    clinicService.getClinicContent(DEFAULT_CLINIC_ID),
    appointmentService.listByClinic(DEFAULT_CLINIC_ID),
  ]);

  return (
    <AppointmentsWorkspace
      appointments={appointments}
      services={services}
      doctors={doctors}
      todayIso={todayIsoDate()}
    />
  );
}
