import type { BookingRequest, BookingStatus } from "@/types/booking";
import { formatDateForDisplay, PREFERRED_TIME_LABELS } from "@/lib/utils";
import styles from "./ActivityStreamEntry.module.css";

interface ActivityStreamEntryProps {
  booking: BookingRequest;
  serviceName: string;
  doctorName?: string;
  todayIso: string;
  /** Position within the whole stream, used only to stagger the entrance animation. */
  index: number;
}

/** One line of "what happens next" per status — the connective thread from booking → action. */
function statusNote(booking: BookingRequest, doctorName?: string): string {
  switch (booking.status) {
    case "pending":
      return "Reply to confirm a time";
    case "contacted":
      return "Waiting to hear back";
    case "confirmed":
      return doctorName ? `Confirmed with ${doctorName}` : "Confirmed — doctor to be assigned";
    case "completed":
      return "Seen and completed";
    case "cancelled":
      return "Cancelled";
  }
}

const DOT_TONE: Record<BookingStatus, string> = {
  pending: styles.dotPending,
  contacted: styles.dotContacted,
  confirmed: styles.dotConfirmed,
  completed: styles.dotCompleted,
  cancelled: styles.dotCancelled,
};

export function ActivityStreamEntry({ booking, serviceName, doctorName, todayIso, index }: ActivityStreamEntryProps) {
  const isPreferredToday = booking.preferredDate === todayIso;
  const style = { "--i": index } as React.CSSProperties;

  return (
    <li className={styles.entry} style={style}>
      <span className={styles.rail} aria-hidden="true">
        <span className={`${styles.dot} ${DOT_TONE[booking.status]}`} data-status={booking.status} />
        <span className={styles.railLine} />
      </span>

      <div className={styles.content}>
        <p className={styles.who}>
          <span className={styles.name}>{booking.patient.fullName}</span>
          <span className={styles.service}> · {serviceName}</span>
        </p>
        <p className={styles.when}>
          {isPreferredToday ? (
            <span className={styles.todayTag}>Today</span>
          ) : (
            formatDateForDisplay(booking.preferredDate)
          )}{" "}
          · {PREFERRED_TIME_LABELS[booking.preferredTime]}
        </p>
        <p className={styles.note}>{statusNote(booking, doctorName)}</p>
      </div>
    </li>
  );
}
