import type { BookingRequest, BookingStatus } from "@/types/booking";
import type { Doctor } from "@/types/content";
import { formatDateForDisplay, formatPhoneReadable, PREFERRED_TIME_LABELS } from "@/lib/utils";
import { describeReceivedAt, isOverdue } from "@/lib/bookingRequests";
import { BookingDetailPanel } from "./BookingDetailPanel";
import styles from "./BookingRow.module.css";

interface BookingRowProps {
  booking: BookingRequest;
  serviceName: string;
  doctorName?: string;
  doctors: Doctor[];
  todayIso: string;
  nowIso: string;
  isExpanded: boolean;
  onToggle: () => void;
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

/** A pending/contacted request can be opened to assign a doctor and confirm it — every other status is read-only. */
const CONFIRMABLE_STATUSES: BookingStatus[] = ["pending", "contacted"];

/**
 * One line of the front desk's register. Deliberately not a card — a
 * hairline-separated row, like the patient register next door, but
 * with a different shape of information (what was requested and when
 * it came in, rather than who the patient is over time).
 *
 * For a pending/contacted request, the row doubles as a toggle button
 * that opens `BookingDetailPanel` below it — the same progressive-
 * disclosure shape as `AppointmentEntry`, reused rather than invented
 * fresh. Every other status stays a plain, non-interactive row.
 */
export function BookingRow({ booking, serviceName, doctorName, doctors, todayIso, nowIso, isExpanded, onToggle }: BookingRowProps) {
  const overdue = isOverdue(booking, todayIso);
  const isConfirmable = CONFIRMABLE_STATUSES.includes(booking.status);

  const rowContent = (
    <>
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
        <p className={styles.received}>
          Received {describeReceivedAt(booking.createdAt, nowIso)}
          {isConfirmable && (
            <>
              <span className={styles.metaDivider}>·</span>
              <span className={styles.detailsHint}>{isExpanded ? "Hide" : "Review"}</span>
            </>
          )}
        </p>
      </div>
    </>
  );

  return (
    <li className={styles.row}>
      {isConfirmable ? (
        <button type="button" className={styles.trigger} onClick={onToggle} aria-expanded={isExpanded}>
          {rowContent}
        </button>
      ) : (
        <div className={styles.staticRow}>{rowContent}</div>
      )}

      {isConfirmable && isExpanded && (
        <div className={styles.detailWrap}>
          <BookingDetailPanel booking={booking} serviceName={serviceName} doctors={doctors} />
        </div>
      )}
    </li>
  );
}
