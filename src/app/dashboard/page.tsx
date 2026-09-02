import { clinicService } from "@/services/clinicService";
import { bookingService } from "@/services/bookingService";
import { DEFAULT_CLINIC_ID } from "@/config/clinics";

/**
 * This page reads live booking requests — it must never be a
 * build-time snapshot. Without this, Next.js statically prerenders it
 * (no dynamic API is otherwise used) and every staff member would see
 * whatever the data looked like at `next build` time, forever.
 */
export const dynamic = "force-dynamic";
import {
  buildOverviewSummary,
  buildServiceNameLookup,
  greetingPeriod,
  todayIsoDate,
} from "@/lib/dashboardOverview";
import { formatDateForDisplay } from "@/lib/utils";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";

/**
 * Reads booking data through the same `bookingService` the public
 * booking flow writes through — this is the real persisted table
 * (`.data/bookings.json`), not a second/duplicated data source. When
 * the patient/booking modules land, they'll read through this same
 * service.
 */
export default async function DashboardOverviewPage() {
  const [{ clinic, services }, bookings] = await Promise.all([
    clinicService.getClinicContent(DEFAULT_CLINIC_ID),
    bookingService.listByClinic(DEFAULT_CLINIC_ID),
  ]);

  const now = new Date();
  const summary = buildOverviewSummary(bookings, todayIsoDate(now));
  const serviceNameById = buildServiceNameLookup(services);

  return (
    <DashboardOverview
      clinicShortName={clinic.shortName}
      period={greetingPeriod(now)}
      dateLabel={formatDateForDisplay(todayIsoDate(now))}
      summary={summary}
      serviceNameById={serviceNameById}
    />
  );
}
