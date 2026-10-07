import { clinicService } from "@/services/clinicService";
import { bookingService } from "@/services/bookingService";
import { appointmentService } from "@/services/appointmentService";
import { DEFAULT_CLINIC_ID } from "@/config/clinics";

/**
 * This page reads live booking requests — it must never be a
 * build-time snapshot. Without this, Next.js statically prerenders it
 * (no dynamic API is otherwise used) and every staff member would see
 * whatever the data looked like at `next build` time, forever.
 */
export const dynamic = "force-dynamic";
import {
  buildDoctorNameLookup,
  buildOverviewSummary,
  buildServiceNameLookup,
  greetingPeriod,
  todayIsoDate,
} from "@/lib/dashboardOverview";
import { formatDateForDisplay } from "@/lib/utils";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";

/**
 * Reads booking requests through `bookingService` and today's
 * schedule through `appointmentService` — the same two services the
 * Bookings and Appointments screens read — so the daybook's "today"
 * is the Appointments screen's today.
 */
export default async function DashboardOverviewPage() {
  const [{ clinic, services, doctors }, bookings, appointments] = await Promise.all([
    clinicService.getClinicContent(DEFAULT_CLINIC_ID),
    bookingService.listByClinic(DEFAULT_CLINIC_ID),
    appointmentService.listByClinic(DEFAULT_CLINIC_ID),
  ]);

  const now = new Date();
  const todayIso = todayIsoDate(now);
  const summary = buildOverviewSummary(bookings, appointments, todayIso);
  const serviceNameById = buildServiceNameLookup(services);
  const doctorNameById = buildDoctorNameLookup(doctors);

  return (
    <DashboardOverview
      clinicShortName={clinic.shortName}
      period={greetingPeriod(now)}
      dateLabel={formatDateForDisplay(todayIso)}
      todayIso={todayIso}
      summary={summary}
      serviceNameById={serviceNameById}
      doctorNameById={doctorNameById}
    />
  );
}
