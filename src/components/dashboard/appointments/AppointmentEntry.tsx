import type { Appointment } from "@/types/appointment";
import type { BookingStatus } from "@/types/booking";
import type { Doctor } from "@/types/content";
import { formatTimeLabel, statusLabel } from "@/lib/appointments";
import { DoctorMark } from "./DoctorMark";
import { AppointmentDetailPanel } from "./AppointmentDetailPanel";
import styles from "./AppointmentEntry.module.css";

interface AppointmentEntryProps {
  appointment: Appointment;
  serviceName: string;
  doctorName: string;
  doctor: Doctor | undefined;
  dateLabel: string;
  /** Position within the whole day's list, used only to stagger the entrance animation. */
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (nextStatus: BookingStatus) => void;
}

const DOT_TONE: Record<BookingStatus, string> = {
  pending: styles.dotPending,
  contacted: styles.dotContacted,
  confirmed: styles.dotConfirmed,
  completed: styles.dotCompleted,
  cancelled: styles.dotCancelled,
};

export function AppointmentEntry({
  appointment,
  serviceName,
  doctorName,
  doctor,
  dateLabel,
  index,
  isExpanded,
  onToggle,
  onStatusChange,
}: AppointmentEntryProps) {
  const style = { "--i": index } as React.CSSProperties;

  return (
    <li className={styles.entry} style={style}>
      <button type="button" className={styles.trigger} onClick={onToggle} aria-expanded={isExpanded}>
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
            {doctorName}
            <span className={styles.metaDivider}>·</span>
            <span className={styles.status} data-status={appointment.status}>
              {statusLabel(appointment.status)}
            </span>
            <span className={styles.metaDivider}>·</span>
            <span className={styles.detailsHint}>{isExpanded ? "Hide" : "Details"}</span>
          </p>
        </div>
      </button>

      {/* Rendered as a sibling, not a child, of the toggle button above:
          it holds its own Confirm/Cancel buttons, and a <button> can't
          validly contain another <button>. */}
      {isExpanded && (
        <div className={styles.detailWrap}>
          <AppointmentDetailPanel
            appointment={appointment}
            serviceName={serviceName}
            doctorName={doctorName}
            dateLabel={dateLabel}
            onStatusChange={onStatusChange}
          />
        </div>
      )}
    </li>
  );
}
