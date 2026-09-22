import type { Appointment } from "@/types/appointment";
import type { BookingStatus } from "@/types/booking";
import { statusLabel } from "@/lib/appointments";
import { availableStatusActions, describeAppointment } from "@/lib/appointmentDetails";
import styles from "./AppointmentDetailPanel.module.css";

interface AppointmentDetailPanelProps {
  appointment: Appointment;
  serviceName: string;
  doctorName: string;
  dateLabel: string;
  onStatusChange: (nextStatus: BookingStatus) => void;
}

/**
 * Opens in place, below the row it belongs to — never a modal or a
 * card. Reads as one paragraph of context (see
 * lib/appointmentDetails.ts#describeAppointment) rather than a labelled
 * field grid, so it stays "more of the schedule," not a second app.
 */
export function AppointmentDetailPanel({ appointment, serviceName, doctorName, dateLabel, onStatusChange }: AppointmentDetailPanelProps) {
  const actions = availableStatusActions(appointment.status);

  return (
    <div className={styles.panel}>
      <p className={styles.sentence}>{describeAppointment(appointment, serviceName, doctorName, dateLabel)}</p>

      {appointment.notes && <p className={styles.notes}>&ldquo;{appointment.notes}&rdquo;</p>}

      <p className={styles.statusLine}>
        <span className={styles.statusWord} data-status={appointment.status}>
          {statusLabel(appointment.status)}
        </span>
        {actions.map((action) => (
          <button key={action.nextStatus} type="button" className={styles.action} onClick={() => onStatusChange(action.nextStatus)}>
            {action.label}
          </button>
        ))}
      </p>
    </div>
  );
}
