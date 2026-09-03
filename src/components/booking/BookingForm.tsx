"use client";

import { useSearchParams } from "next/navigation";
import type { ServiceOffering } from "@/types/content";
import type { BookingRequest } from "@/types/booking";
import { useBookingFormState } from "./useBookingFormState";
import { BookingFormErrorSummary } from "./BookingFormErrorSummary";
import { PatientDetailsFieldset } from "./PatientDetailsFieldset";
import { AppointmentDetailsFieldset } from "./AppointmentDetailsFieldset";
import styles from "./BookingForm.module.css";

interface BookingFormProps {
  clinicId: string;
  services: ServiceOffering[];
  onSuccess: (booking: BookingRequest) => void;
}

/**
 * The booking form itself, kept as a thin wiring layer: state and submit
 * logic live in useBookingFormState, the two fieldsets and the error
 * summary are their own small components. See those files for the
 * actual field markup and business logic.
 */
export function BookingForm({ clinicId, services, onSuccess }: BookingFormProps) {
  const searchParams = useSearchParams();
  const preselectedServiceId = searchParams.get("service") ?? "";
  const knownServiceIds = services.map((s) => s.id);

  const { values, setField, errors, status, serverMessage, errorSummaryRef, fieldId, handleSubmit } =
    useBookingFormState({ clinicId, knownServiceIds, preselectedServiceId, onSuccess });

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <BookingFormErrorSummary errors={errors} serverMessage={serverMessage} summaryRef={errorSummaryRef} />

      <PatientDetailsFieldset values={values} errors={errors} fieldId={fieldId} setField={setField} />
      <AppointmentDetailsFieldset values={values} errors={errors} services={services} fieldId={fieldId} setField={setField} />

      <button type="submit" className={styles.submit} disabled={status === "submitting"}>
        {status === "submitting" ? "Sending your request…" : "Request this appointment"}
      </button>
      <p className={styles.disclaimer}>
        This sends a request, not a confirmed booking — we&apos;ll follow up to lock in your time.
      </p>
    </form>
  );
}
