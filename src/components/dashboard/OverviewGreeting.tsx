import type { GreetingPeriod } from "@/lib/dashboardOverview";
import { greetingLabel } from "@/lib/dashboardOverview";
import styles from "./OverviewGreeting.module.css";

interface OverviewGreetingProps {
  clinicShortName: string;
  period: GreetingPeriod;
  dateLabel: string;
  pendingCount: number;
  todayCount: number;
}

/**
 * The daybook's masthead. Deliberately does NOT sit next to a row of
 * stat cards — the waiting/today counts are woven into one sentence
 * here instead, so "what's happening" reads as a greeting rather than
 * a dashboard KPI strip. See DashboardOverview for the stream below it.
 */
export function OverviewGreeting({ clinicShortName, period, dateLabel, pendingCount, todayCount }: OverviewGreetingProps) {
  return (
    <div className={styles.masthead}>
      <span className={styles.mark}>{dateLabel}</span>
      <h1 className={styles.headline}>
        {greetingLabel(period)}, {clinicShortName}.
      </h1>
      <p className={styles.context}>{contextLine(pendingCount, todayCount)}</p>
    </div>
  );
}

function contextLine(pendingCount: number, todayCount: number): string {
  const waiting =
    pendingCount === 0
      ? "Nothing's waiting on you"
      : pendingCount === 1
        ? "One request is waiting on you"
        : `${pendingCount} requests are waiting on you`;

  if (todayCount === 0) {
    return `${waiting}, and the day ahead is quiet so far.`;
  }
  const booked = todayCount === 1 ? "one person is booked in today" : `${todayCount} people are booked in today`;
  return `${waiting}, and ${booked}.`;
}
