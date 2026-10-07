import type { ReactNode } from "react";
import styles from "./BookingForm.module.css";

interface BookingFormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  errorId?: string;
  /** quiet helper text shown under the control, before any error */
  hint?: string;
  hintId?: string;
  children: ReactNode;
}

/**
 * The label + control + error-message shell repeated by every text,
 * select, and textarea field in the booking form. Pulling it out once
 * means each field only has to supply its `<input>`/`<select>`/etc. and
 * not re-type the label/error markup each time.
 */
export function BookingFormField({ label, htmlFor, error, errorId, hint, hintId, children }: BookingFormFieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && (
        <span id={hintId} className={styles.fieldHint}>
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className={styles.fieldError}>
          {error}
        </span>
      )}
    </div>
  );
}
