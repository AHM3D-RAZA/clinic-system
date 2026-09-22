import type { BookingRequest } from "@/types/booking";
import { formatDateForDisplay, PREFERRED_TIME_LABELS } from "@/lib/utils";
import { statusLabel } from "@/lib/appointments";
import styles from "./PatientRecordBookingContext.module.css";

interface PatientRecordBookingContextProps {
  bookings: BookingRequest[];
  serviceNameById: Record<string, string>;
}

/**
 * Only ever rendered when there's something to show — not every
 * patient arrived through a tracked booking request, and an empty
 * "Booking history" section would just be dead space. Kept to the
 * request-level facts (what was asked for, when, its status), not a
 * full booking-management view.
 */
export function PatientRecordBookingContext({ bookings, serviceNameById }: PatientRecordBookingContextProps) {
  if (bookings.length === 0) return null;

  return (
    <section>
      <h2 className={styles.eyebrow}>Booking history</h2>
      <ul className={styles.list}>
        {bookings.map((booking) => (
          <li key={booking.id} className={styles.item}>
            <p className={styles.itemPrimary}>
              Requested {serviceNameById[booking.serviceId] ?? "a service"} for{" "}
              {formatDateForDisplay(booking.preferredDate)}, {PREFERRED_TIME_LABELS[booking.preferredTime]}
            </p>
            <p className={styles.itemSecondary}>
              {statusLabel(booking.status)} · submitted {formatDateForDisplay(booking.createdAt.slice(0, 10))}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
