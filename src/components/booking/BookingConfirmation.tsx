import type { BookingRequest } from "@/types/booking";
import type { ServiceOffering } from "@/types/content";
import { formatDateForDisplay, formatPhoneReadable, PREFERRED_TIME_LABELS } from "@/lib/utils";
import styles from "./BookingConfirmation.module.css";

interface BookingConfirmationProps {
  booking: BookingRequest;
  service: ServiceOffering | undefined;
  clinicPhone: string;
  onStartOver: () => void;
}

export function BookingConfirmation({
  booking,
  service,
  clinicPhone,
  onStartOver,
}: BookingConfirmationProps) {
  return (
    <div className={styles.confirmation} role="status">
      <span className={styles.badge}>request received</span>
      <h2>You&apos;re on our list, {firstName(booking.patient.fullName)}.</h2>
      <p className={styles.lede}>
        We don&apos;t auto-confirm times yet — a real person on our team will call or email you
        within one business day to lock in your visit.
      </p>

      <dl className={styles.summary}>
        <div>
          <dt>Treatment</dt>
          <dd>{service?.name ?? booking.serviceId}</dd>
        </div>
        <div>
          <dt>Preferred date</dt>
          <dd>{formatDateForDisplay(booking.preferredDate)}</dd>
        </div>
        <div>
          <dt>Preferred time</dt>
          <dd>{PREFERRED_TIME_LABELS[booking.preferredTime]}</dd>
        </div>
        <div>
          <dt>We&apos;ll reach you at</dt>
          <dd>
            {booking.patient.email}
            <br />
            {booking.patient.phone}
          </dd>
        </div>
      </dl>

      <div className={styles.next}>
        <h3>What happens next</h3>
        <ol>
          <li>Someone from Aster reviews your request (usually same-day).</li>
          <li>We call or email to confirm a specific time with a doctor.</li>
          <li>You get a reminder the day before your visit.</li>
        </ol>
        <p className={styles.urgent}>
          Something urgent? Call us directly at{" "}
          <a href={`tel:${clinicPhone}`}>{formatPhoneReadable(clinicPhone)}</a>.
        </p>
      </div>

      <button type="button" className={styles.again} onClick={onStartOver}>
        Submit another request
      </button>
    </div>
  );
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

