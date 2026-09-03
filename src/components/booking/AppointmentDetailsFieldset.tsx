import type { BookingFormErrors, PreferredTimeSlot } from "@/types/booking";
import type { ServiceOffering } from "@/types/content";
import type { RawBookingFormValues } from "@/lib/validators";
import { BookingFormField } from "./BookingFormField";
import { RadioPillGroup } from "./RadioPillGroup";
import styles from "./BookingForm.module.css";

const TIME_SLOTS: { value: PreferredTimeSlot; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
];

const todayIso = () => new Date().toISOString().slice(0, 10);

interface AppointmentDetailsFieldsetProps {
  values: RawBookingFormValues;
  errors: BookingFormErrors;
  services: ServiceOffering[];
  fieldId: (name: string) => string;
  setField: <K extends keyof RawBookingFormValues>(key: K, value: string) => void;
}

export function AppointmentDetailsFieldset({ values, errors, services, fieldId, setField }: AppointmentDetailsFieldsetProps) {
  return (
    <fieldset className={styles.fieldset}>
      <legend>What do you need?</legend>

      <BookingFormField
        label="Treatment"
        htmlFor={fieldId("service")}
        error={errors.serviceId}
        errorId={fieldId("service-error")}
      >
        <select
          id={fieldId("service")}
          className={styles.control}
          value={values.serviceId}
          aria-required="true"
          onChange={(e) => setField("serviceId", e.target.value)}
          aria-invalid={Boolean(errors.serviceId)}
          aria-describedby={errors.serviceId ? fieldId("service-error") : undefined}
        >
          <option value="" disabled>
            Choose a treatment
          </option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
      </BookingFormField>

      <div className={styles.fieldRow}>
        <BookingFormField
          label="Preferred date"
          htmlFor={fieldId("date")}
          error={errors.preferredDate}
          errorId={fieldId("date-error")}
        >
          <input
            id={fieldId("date")}
            type="date"
            className={styles.control}
            min={todayIso()}
            aria-required="true"
            value={values.preferredDate}
            onChange={(e) => setField("preferredDate", e.target.value)}
            aria-invalid={Boolean(errors.preferredDate)}
            aria-describedby={errors.preferredDate ? fieldId("date-error") : undefined}
          />
        </BookingFormField>

        <RadioPillGroup
          name="preferredTime"
          ariaLabel="Preferred time of day"
          groupLabel="Preferred time"
          options={TIME_SLOTS}
          selected={values.preferredTime}
          onChange={(value) => setField("preferredTime", value)}
          error={errors.preferredTime}
        />
      </div>

      <BookingFormField
        label="Anything we should know? (optional)"
        htmlFor={fieldId("notes")}
        error={errors.notes}
        errorId={fieldId("notes-error")}
      >
        <textarea
          id={fieldId("notes")}
          rows={4}
          className={`${styles.control} ${styles.textarea}`}
          value={values.notes}
          onChange={(e) => setField("notes", e.target.value)}
          aria-invalid={Boolean(errors.notes)}
          aria-describedby={errors.notes ? fieldId("notes-error") : undefined}
          placeholder="A sensitive tooth, a specific concern, a preferred doctor — whatever's useful."
        />
      </BookingFormField>
    </fieldset>
  );
}
