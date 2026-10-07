import type { BookingFormErrors } from "@/types/booking";
import type { RawBookingFormValues } from "@/lib/validators";
import { BookingFormField } from "./BookingFormField";
import { RadioPillGroup } from "./RadioPillGroup";
import styles from "./BookingForm.module.css";

const PATIENT_TYPE_OPTIONS = [
  { value: "new", label: "First visit" },
  { value: "existing", label: "Been here before" },
];

interface PatientDetailsFieldsetProps {
  values: RawBookingFormValues;
  errors: BookingFormErrors;
  fieldId: (name: string) => string;
  setField: <K extends keyof RawBookingFormValues>(key: K, value: string) => void;
}

export function PatientDetailsFieldset({ values, errors, fieldId, setField }: PatientDetailsFieldsetProps) {
  return (
    <fieldset className={styles.fieldset}>
      <legend>Who are we booking for?</legend>

      <BookingFormField
        label="Full name"
        htmlFor={fieldId("fullName")}
        error={errors["patient.fullName"]}
        errorId={fieldId("fullName-error")}
      >
        <input
          id={fieldId("fullName")}
          type="text"
          className={styles.control}
          autoComplete="name"
          aria-required="true"
          value={values.fullName}
          onChange={(e) => setField("fullName", e.target.value)}
          aria-invalid={Boolean(errors["patient.fullName"])}
          aria-describedby={errors["patient.fullName"] ? fieldId("fullName-error") : undefined}
        />
      </BookingFormField>

      <div className={styles.fieldRow}>
        <BookingFormField
          label="Email"
          htmlFor={fieldId("email")}
          error={errors["patient.email"]}
          errorId={fieldId("email-error")}
        >
          <input
            id={fieldId("email")}
            type="email"
            className={styles.control}
            autoComplete="email"
            aria-required="true"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            aria-invalid={Boolean(errors["patient.email"])}
            aria-describedby={errors["patient.email"] ? fieldId("email-error") : undefined}
          />
        </BookingFormField>

        <BookingFormField
          label="Phone"
          htmlFor={fieldId("phone")}
          error={errors["patient.phone"]}
          errorId={fieldId("phone-error")}
        >
          <input
            id={fieldId("phone")}
            type="tel"
            className={styles.control}
            autoComplete="tel"
            aria-required="true"
            value={values.phone}
            onChange={(e) => setField("phone", e.target.value)}
            aria-invalid={Boolean(errors["patient.phone"])}
            aria-describedby={errors["patient.phone"] ? fieldId("phone-error") : undefined}
          />
        </BookingFormField>
      </div>

      <RadioPillGroup
        name="patientType"
        ariaLabel="Patient type"
        groupLabel="Have you visited Aster before?"
        options={PATIENT_TYPE_OPTIONS}
        selected={values.patientType}
        onChange={(value) => setField("patientType", value)}
        error={errors["patient.patientType"]}
      />
    </fieldset>
  );
}
