import type { Appointment } from "@/types/appointment";
import type { BookingStatus } from "@/types/booking";
import { formatTimeLabel, statusLabel } from "@/lib/appointments";
import styles from "./ActivityStreamEntry.module.css";

interface ActivityStreamAppointmentEntryProps {
  appointment: Appointment;
  serviceName: string;
  doctorName?: string;
  /** Position within the whole stream, used only to stagger the entrance animation. */
  index: number;
}

const DOT_TONE: Record<BookingStatus, string> = {
  pending: styles.dotPending,
  contacted: styles.dotContacted,
  confirmed: styles.dotConfirmed,
  completed: styles.dotCompleted,
  cancelled: styles.dotCancelled,
};

/**
 * One of today's real appointments in the daybook — same rail, dot and
 * typography as a booking entry (this is the same room), but the line
 * is the scheduled time and the doctor, not a requested time slot.
 */
export function ActivityStreamAppointmentEntry({
  appointment,
  serviceName,
  doctorName,
  index,
}: ActivityStreamAppointmentEntryProps) {
  const style = { "--i": index } as React.CSSProperties;
  return (
    <li className={styles.entry} style={style}>
      <span className={styles.rail} aria-hidden="true">
        <span className={`${styles.dot} ${DOT_TONE[appointment.status]}`} data-status={appointment.status} />
        <span className={styles.railLine} />
      </span>

      <div className={styles.content}>
        <p className={styles.who}>
          <span className={styles.name}>{appointment.patientName}</span>
          <span className={styles.service}> · {serviceName}</span>
        </p>
        <p className={styles.when}>
          <span className={styles.todayTag}>Today</span> · {formatTimeLabel(appointment.time)}
        </p>
        <p className={styles.note}>
          {doctorName ? `${statusLabel(appointment.status)} with ${doctorName}` : statusLabel(appointment.status)}
        </p>
      </div>
    </li>
  );
}
