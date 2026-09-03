import { useId, useRef, useState, type FormEvent } from "react";
import type { BookingFormErrors, BookingRequest } from "@/types/booking";
import { validateBookingForm, type RawBookingFormValues } from "@/lib/validators";

export type SubmitStatus = "idle" | "submitting" | "error";

interface UseBookingFormStateArgs {
  clinicId: string;
  knownServiceIds: string[];
  preselectedServiceId: string;
  onSuccess: (booking: BookingRequest) => void;
}

/**
 * Everything the booking form needs that isn't JSX: field values,
 * validation errors, submit status, and the submit handler itself.
 * Pulled out of BookingForm so that component can stay focused on
 * layout, and so this logic reads top-to-bottom without markup
 * interrupting it.
 */
export function useBookingFormState({
  clinicId,
  knownServiceIds,
  preselectedServiceId,
  onSuccess,
}: UseBookingFormStateArgs) {
  const [values, setValues] = useState<RawBookingFormValues>({
    fullName: "",
    email: "",
    phone: "",
    patientType: "",
    serviceId: knownServiceIds.includes(preselectedServiceId) ? preselectedServiceId : "",
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

  const fieldId = (name: string) => `${formId}-${name}`;
  const focusErrorSummary = () => requestAnimationFrame(() => errorSummaryRef.current?.focus());

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
      focusErrorSummary();
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
          focusErrorSummary();
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

  return { values, setField, errors, status, serverMessage, errorSummaryRef, fieldId, handleSubmit };
}
