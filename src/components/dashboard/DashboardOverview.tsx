import type { GreetingPeriod } from "@/lib/dashboardOverview";
import type { DashboardOverviewSummary } from "@/types/dashboard";
import { OverviewGreeting } from "./OverviewGreeting";
import { ClinicActivityStream } from "./ClinicActivityStream";

interface DashboardOverviewProps {
  clinicShortName: string;
  period: GreetingPeriod;
  dateLabel: string;
  todayIso: string;
  summary: DashboardOverviewSummary;
  serviceNameById: Record<string, string>;
  doctorNameById: Record<string, string>;
}

/**
 * The dashboard's landing view: a masthead greeting followed by one
 * continuous "daybook" stream (see ClinicActivityStream) instead of a
 * grid of separate panels. Stays a thin wiring layer on purpose — all
 * the grouping/dedup logic lives in lib/activityStream.ts, and all the
 * presentation lives in the stream's own small components.
 */
export function DashboardOverview({
  clinicShortName,
  period,
  dateLabel,
  todayIso,
  summary,
  serviceNameById,
  doctorNameById,
}: DashboardOverviewProps) {
  return (
    <div>
      <OverviewGreeting
        clinicShortName={clinicShortName}
        period={period}
        dateLabel={dateLabel}
        pendingCount={summary.pending.length}
        todayCount={summary.today.length}
      />

      <ClinicActivityStream
        summary={summary}
        serviceNameById={serviceNameById}
        doctorNameById={doctorNameById}
        todayIso={todayIso}
      />
    </div>
  );
}
