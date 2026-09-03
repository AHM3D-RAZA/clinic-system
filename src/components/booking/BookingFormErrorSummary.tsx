import type { Ref } from "react";
import type { BookingFormErrors } from "@/types/booking";
import styles from "./BookingForm.module.css";

interface BookingFormErrorSummaryProps {
  errors: BookingFormErrors;
  serverMessage: string | null;
  summaryRef: Ref<HTMLDivElement>;
}

export function BookingFormErrorSummary({ errors, serverMessage, summaryRef }: BookingFormErrorSummaryProps) {
  const errorCount = Object.keys(errors).length;

  return (
    <>
      {errorCount > 0 && (
        <div ref={summaryRef} className={styles.errorSummary} role="alert" tabIndex={-1}>
          <strong>{errorCount === 1 ? "One thing needs a look:" : `${errorCount} things need a look:`}</strong>
          <ul>
            {Object.values(errors).map((message, i) => (
              <li key={i}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      {serverMessage && (
        <div className={styles.errorSummary} role="alert">
          <strong>{serverMessage}</strong>
        </div>
      )}
    </>
  );
}
