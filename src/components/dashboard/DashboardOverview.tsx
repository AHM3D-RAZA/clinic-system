import type { GreetingPeriod } from "@/lib/dashboardOverview";
import type { DashboardOverviewSummary } from "@/types/dashboard";
import { OverviewGreeting } from "./OverviewGreeting";
import { AttentionPanel } from "./AttentionPanel";
import { TodayPanel } from "./TodayPanel";
import { RecentActivityList } from "./RecentActivityList";
import styles from "./DashboardOverview.module.css";

interface DashboardOverviewProps {
  clinicShortName: string;
  period: GreetingPeriod;
  dateLabel: string;
  summary: DashboardOverviewSummary;
  serviceNameById: Record<string, string>;
}

export function DashboardOverview({
  clinicShortName,
  period,
  dateLabel,
  summary,
  serviceNameById,
}: DashboardOverviewProps) {
  return (
    <div>
      <OverviewGreeting
        clinicShortName={clinicShortName}
        period={period}
        dateLabel={dateLabel}
        pendingCount={summary.pending.length}
      />

      <div className={styles.pair}>
        <AttentionPanel bookings={summary.pending} serviceNameById={serviceNameById} />
        <TodayPanel bookings={summary.today} serviceNameById={serviceNameById} />
      </div>

      <div className={styles.full}>
        <RecentActivityList bookings={summary.recent} serviceNameById={serviceNameById} />
      </div>
    </div>
  );
}
