"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import type { ServiceOffering } from "@/types/content";
import type { BookingFormErrors, BookingRequest, PreferredTimeSlot } from "@/types/booking";
import { validateBookingForm, type RawBookingFormValues } from "@/lib/validators";
import { cn } from "@/lib/utils";
import styles from "./BookingForm.module.css";

interface BookingFormProps {
  clinicId: string;
  services: ServiceOffering[];
  onSuccess: (booking: BookingRequest) => void;
}

type SubmitStatus = "idle" | "submitting" | "error";

const TIME_SLOTS: { value: PreferredTimeSlot; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
];

const todayIso = () => new Date().toISOString().slice(0, 10);

export function BookingForm({ clinicId, services, onSuccess }: BookingFormProps) {
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get("service") ?? "";

  const [values, setValues] = useState<RawBookingFormValues>({
    fullName: "",
    email: "",
    phone: "",
    patientType: "",
    serviceId: services.some((s) => s.id === preselectedService) ? preselectedService : "",
    preferredDate: "",
    preferredTime: "",
    notes: "",
  });
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const formId = useId();
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);

  const setField = <K extends keyof RawBookingFormValues>(key: K, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const knownServiceIds = services.map((s) => s.id);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Synchronous guard against double-submission: the disabled button
    // covers the common case, but a state update isn't synchronous, so
    // a very fast double-click/double-Enter could otherwise slip a
    // second submission in before the re-render disables the button.
    if (status === "submitting") return;
    setServerMessage(null);

    const { valid, errors: validationErrors } = validateBookingForm(values, knownServiceIds);
    setErrors(validationErrors);

    if (!valid) {
      // move focus to the error summary so keyboard/screen-reader users land on it
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinicId, ...values }),
      });
      const payload = await res.json();

      if (!res.ok) {
        if (payload.errors) {
          setErrors(payload.errors as BookingFormErrors);
          requestAnimationFrame(() => errorSummaryRef.current?.focus());
        } else {
          setServerMessage(payload.message ?? "Something went wrong on our end. Please try again.");
        }
        setStatus("idle");
        return;
      }

      setStatus("idle");
      onSuccess(payload.booking as BookingRequest);
    } catch {
      setServerMessage("We couldn't reach the server. Check your connection and try again.");
      setStatus("idle");
    }
  };

  const errorCount = Object.keys(errors).length;
  const fieldId = (name: string) => `${formId}-${name}`;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {errorCount > 0 && (
        <div
          ref={errorSummaryRef}
          className={styles.errorSummary}
          role="alert"
          tabIndex={-1}
        >
          <strong>
            {errorCount === 1 ? "One thing needs a look:" : `${errorCount} things need a look:`}
          </strong>
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

      <fieldset className={styles.fieldset}>
        <legend>Who are we booking for?</legend>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={fieldId("fullName")}>Full name</label>
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
          {errors["patient.fullName"] && (
            <span id={fieldId("fullName-error")} className={styles.fieldError}>
              {errors["patient.fullName"]}
            </span>
          )}
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={fieldId("email")}>Email</label>
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
            {errors["patient.email"] && (
              <span id={fieldId("email-error")} className={styles.fieldError}>
                {errors["patient.email"]}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={fieldId("phone")}>Phone</label>
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
            {errors["patient.phone"] && (
              <span id={fieldId("phone-error")} className={styles.fieldError}>
                {errors["patient.phone"]}
              </span>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.groupLabel}>Have you visited Aster before?</span>
          <div className={styles.radioRow} role="radiogroup" aria-label="Patient type" aria-required="true">
            {(["new", "existing"] as const).map((type) => (
              <label key={type} className={cn(styles.radioPill, values.patientType === type && styles.radioPillActive)}>
                <input
                  type="radio"
                  name="patientType"
                  value={type}
                  checked={values.patientType === type}
                  onChange={(e) => setField("patientType", e.target.value)}
                />
                {type === "new" ? "First visit" : "Been here before"}
              </label>
            ))}
          </div>
          {errors["patient.patientType"] && (
            <span className={styles.fieldError}>{errors["patient.patientType"]}</span>
          )}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>What do you need?</legend>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={fieldId("service")}>Treatment</label>
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
          {errors.serviceId && (
            <span id={fieldId("service-error")} className={styles.fieldError}>
              {errors.serviceId}
            </span>
          )}
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={fieldId("date")}>Preferred date</label>
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
            {errors.preferredDate && (
              <span id={fieldId("date-error")} className={styles.fieldError}>
                {errors.preferredDate}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <span className={styles.groupLabel}>Preferred time</span>
            <div className={styles.radioRow} role="radiogroup" aria-label="Preferred time of day" aria-required="true">
              {TIME_SLOTS.map((slot) => (
                <label
                  key={slot.value}
                  className={cn(styles.radioPill, values.preferredTime === slot.value && styles.radioPillActive)}
                >
                  <input
                    type="radio"
                    name="preferredTime"
                    value={slot.value}
                    checked={values.preferredTime === slot.value}
                    onChange={(e) => setField("preferredTime", e.target.value)}
                  />
                  {slot.label}
                </label>
              ))}
            </div>
            {errors.preferredTime && <span className={styles.fieldError}>{errors.preferredTime}</span>}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={fieldId("notes")}>Anything we should know? (optional)</label>
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
          {errors.notes && (
            <span id={fieldId("notes-error")} className={styles.fieldError}>
              {errors.notes}
            </span>
          )}
        </div>
      </fieldset>

      <button type="submit" className={styles.submit} disabled={status === "submitting"}>
        {status === "submitting" ? "Sending your request…" : "Request this appointment"}
      </button>
      <p className={styles.disclaimer}>
        This sends a request, not a confirmed booking — we&apos;ll follow up to lock in your time.
      </p>
    </form>
  );
}
