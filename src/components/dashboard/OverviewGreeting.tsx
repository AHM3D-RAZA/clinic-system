import type { GreetingPeriod } from "@/lib/dashboardOverview";
import { greetingLabel } from "@/lib/dashboardOverview";
import styles from "./OverviewGreeting.module.css";

interface OverviewGreetingProps {
  clinicShortName: string;
  period: GreetingPeriod;
  dateLabel: string;
  pendingCount: number;
}

export function OverviewGreeting({ clinicShortName, period, dateLabel, pendingCount }: OverviewGreetingProps) {
  return (
    <div className={styles.masthead}>
      <span className={styles.mark}>{dateLabel}</span>
      <h1 className={styles.headline}>
        {greetingLabel(period)}, {clinicShortName}.
      </h1>
      <p className={styles.context}>{contextLine(pendingCount)}</p>
    </div>
  );
}

function contextLine(pendingCount: number): string {
  if (pendingCount === 0) return "No requests are waiting on you right now.";
  if (pendingCount === 1) return "One request is waiting on you.";
  return `${pendingCount} requests are waiting on you.`;
}
