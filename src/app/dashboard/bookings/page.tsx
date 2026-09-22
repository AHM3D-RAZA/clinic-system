import { clinicService } from "@/services/clinicService";
import { bookingService } from "@/services/bookingService";
import { DEFAULT_CLINIC_ID } from "@/config/clinics";
import { buildDoctorNameLookup, buildServiceNameLookup, todayIsoDate } from "@/lib/dashboardOverview";
import { BookingsWorkspace } from "@/components/dashboard/bookings/BookingsWorkspace";

/**
 * Reads the live booking-request table — must never be a build-time
 * snapshot, same reasoning as every other dashboard page here.
 */
export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const [{ services, doctors }, bookings] = await Promise.all([
    clinicService.getClinicContent(DEFAULT_CLINIC_ID),
    bookingService.listByClinic(DEFAULT_CLINIC_ID),
  ]);

  const now = new Date();

  return (
    <BookingsWorkspace
      bookings={bookings}
      serviceNameById={buildServiceNameLookup(services)}
      doctorNameById={buildDoctorNameLookup(doctors)}
      todayIso={todayIsoDate(now)}
      nowIso={now.toISOString()}
    />
  );
}
