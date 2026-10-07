import type { Appointment } from "@/types/appointment";
import type { BookingStatus } from "@/types/booking";
import type { Doctor } from "@/types/content";
import { formatTimeLabel, statusLabel } from "@/lib/appointments";
import { DoctorMark } from "./DoctorMark";
import styles from "./AppointmentEntry.module.css";

interface AppointmentEntryProps {
  appointment: Appointment;
  serviceName: string;
  doctor: Doctor | undefined;
  /** Position within the whole day's list, used only to stagger the entrance animation. */
  index: number;
}

const DOT_TONE: Record<BookingStatus, string> = {
  pending: styles.dotPending,
  contacted: styles.dotContacted,
  confirmed: styles.dotConfirmed,
  completed: styles.dotCompleted,
  cancelled: styles.dotCancelled,
};

export function AppointmentEntry({ appointment, serviceName, doctor, index }: AppointmentEntryProps) {
  const style = { "--i": index } as React.CSSProperties;

  return (
    <li className={styles.entry} style={style}>
      <div className={styles.time}>
        <span className={styles.timeLabel}>{formatTimeLabel(appointment.time)}</span>
        <span className={styles.duration}>{appointment.durationMinutes} min</span>
      </div>

      <span className={styles.rail} aria-hidden="true">
        <span className={`${styles.dot} ${DOT_TONE[appointment.status]}`} data-status={appointment.status} />
        <span className={styles.railLine} />
      </span>

      <DoctorMark doctor={doctor} />

      <div className={styles.content}>
        <p className={styles.who}>
          <span className={styles.name}>{appointment.patientName}</span>
          <span className={styles.service}> · {serviceName}</span>
        </p>
        <p className={styles.meta}>
          {doctor ? doctor.name : "Doctor to be assigned"}
          <span className={styles.metaDivider}>·</span>
          <span className={styles.status} data-status={appointment.status}>
            {statusLabel(appointment.status)}
          </span>
        </p>
      </div>
    </li>
  );
}
