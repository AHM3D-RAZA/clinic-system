import type { BookingRequest, BookingStatus } from "@/types/booking";
import { formatDateForDisplay, PREFERRED_TIME_LABELS } from "@/lib/utils";
import styles from "./BookingListItem.module.css";

interface BookingListItemProps {
  booking: BookingRequest;
  serviceName: string;
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  contacted: "Contacted",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};

export function BookingListItem({ booking, serviceName }: BookingListItemProps) {
  return (
    <li className={styles.row}>
      <div className={styles.who}>
        <span className={styles.name}>{booking.patient.fullName}</span>
        <span className={styles.service}>{serviceName}</span>
      </div>
      <div className={styles.when}>
        {formatDateForDisplay(booking.preferredDate)} · {PREFERRED_TIME_LABELS[booking.preferredTime]}
      </div>
      <span className={styles.status} data-status={booking.status}>
        {STATUS_LABELS[booking.status]}
      </span>
    </li>
  );
}
