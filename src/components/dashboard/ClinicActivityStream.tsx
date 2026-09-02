import type { DashboardOverviewSummary } from "@/types/dashboard";
import { buildActivityStreamNodes } from "@/lib/activityStream";
import { ActivityStreamChapterLabel } from "./ActivityStreamChapterLabel";
import { ActivityStreamEntry } from "./ActivityStreamEntry";
import { ActivityStreamEmptyNote } from "./ActivityStreamEmptyNote";
import styles from "./ClinicActivityStream.module.css";

interface ClinicActivityStreamProps {
  summary: DashboardOverviewSummary;
  serviceNameById: Record<string, string>;
  doctorNameById: Record<string, string>;
  todayIso: string;
}

export function ClinicActivityStream({ summary, serviceNameById, doctorNameById, todayIso }: ClinicActivityStreamProps) {
  if (summary.totalCount === 0) {
    return (
      <div className={styles.quiet}>
        <p className={styles.quietTitle}>It&apos;s quiet in here.</p>
        <p className={styles.quietBody}>
          Once patients start requesting appointments through the site, they&apos;ll show up here as they come in.
        </p>
      </div>
    );
  }

  const nodes = buildActivityStreamNodes(summary);

  return (
    <ul className={styles.stream}>
      {nodes.map((node, index) => {
        if (node.type === "chapterLabel") {
          return <ActivityStreamChapterLabel key={node.key} label={node.label} note={node.note} />;
        }
        if (node.type === "emptyNote") {
          return <ActivityStreamEmptyNote key={node.key} message={node.message} />;
        }
        return (
          <ActivityStreamEntry
            key={node.key}
            index={index}
            booking={node.booking}
            serviceName={serviceNameById[node.booking.serviceId] ?? "Unspecified treatment"}
            doctorName={node.booking.assignedDoctorId ? doctorNameById[node.booking.assignedDoctorId] : undefined}
            todayIso={todayIso}
          />
        );
      })}
    </ul>
  );
}
