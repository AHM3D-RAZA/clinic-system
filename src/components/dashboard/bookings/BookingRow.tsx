import type { BookingRequest, BookingStatus } from "@/types/booking";
import { formatDateForDisplay, formatPhoneReadable, PREFERRED_TIME_LABELS } from "@/lib/utils";
import { describeReceivedAt, isOverdue } from "@/lib/bookingRequests";
import styles from "./BookingRow.module.css";

interface BookingRowProps {
  booking: BookingRequest;
  serviceName: string;
  doctorName?: string;
  todayIso: string;
  nowIso: string;
}

const STATUS_DOT: Record<BookingStatus, string> = {
  pending: styles.dotPending,
  contacted: styles.dotContacted,
  confirmed: styles.dotConfirmed,
  completed: styles.dotCompleted,
  cancelled: styles.dotCancelled,
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Needs a reply",
  contacted: "Contacted",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

/**
 * One line of the front desk's register. Deliberately not a card — a
 * hairline-separated row, like the patient register next door, but
 * with a different shape of information (what was requested and when
 * it came in, rather than who the patient is over time).
 */
export function BookingRow({ booking, serviceName, doctorName, todayIso, nowIso }: BookingRowProps) {
  const overdue = isOverdue(booking, todayIso);

  return (
    <li className={styles.row}>
      <div className={styles.main}>
        <p className={styles.who}>
          <span className={`${styles.dot} ${STATUS_DOT[booking.status]}`} aria-hidden="true" />
          <span className={styles.name}>{booking.patient.fullName}</span>
          <span className={styles.service}> · {serviceName}</span>
        </p>
        <p className={styles.contact}>
          {booking.patient.email} · {formatPhoneReadable(booking.patient.phone)}
        </p>
        {booking.notes && <p className={styles.notes}>&ldquo;{booking.notes}&rdquo;</p>}
      </div>

      <div className={styles.meta}>
        <p className={overdue ? styles.whenOverdue : styles.when}>
          {overdue ? "Overdue since " : ""}
          {formatDateForDisplay(booking.preferredDate)} · {PREFERRED_TIME_LABELS[booking.preferredTime]}
        </p>
        <p className={styles.status}>
          {STATUS_LABEL[booking.status]}
          {booking.status === "confirmed" && doctorName ? ` with ${doctorName}` : ""}
        </p>
        <p className={styles.received}>Received {describeReceivedAt(booking.createdAt, nowIso)}</p>
      </div>
    </li>
  );
}
