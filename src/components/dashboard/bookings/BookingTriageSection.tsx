import { cn } from "@/lib/utils";
import type { TriageGroup } from "@/lib/bookingRequests";
import { BookingRow } from "./BookingRow";
import styles from "./BookingTriageSection.module.css";

interface BookingTriageSectionProps {
  group: TriageGroup;
  serviceNameById: Record<string, string>;
  doctorNameById: Record<string, string>;
  todayIso: string;
  nowIso: string;
}

export function BookingTriageSection({ group, serviceNameById, doctorNameById, todayIso, nowIso }: BookingTriageSectionProps) {
  return (
    <section className={styles.section} data-group={group.key}>
      <div className={styles.heading}>
        <h2 className={cn("eyebrow", styles.label)}>{group.label}</h2>
        <span className={styles.note}>{group.note}</span>
        <span className={styles.count}>{group.bookings.length}</span>
      </div>
      <ul className={styles.rows}>
        {group.bookings.map((booking) => (
          <BookingRow
            key={booking.id}
            booking={booking}
            serviceName={serviceNameById[booking.serviceId] ?? "Unspecified treatment"}
            doctorName={booking.assignedDoctorId ? doctorNameById[booking.assignedDoctorId] : undefined}
            todayIso={todayIso}
            nowIso={nowIso}
          />
        ))}
      </ul>
    </section>
  );
}
