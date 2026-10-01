"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BookingRequest } from "@/types/booking";
import type { Doctor } from "@/types/content";
import { formatDateForDisplay, PREFERRED_TIME_LABELS } from "@/lib/utils";
import styles from "./BookingDetailPanel.module.css";

interface BookingDetailPanelProps {
  booking: BookingRequest;
  serviceName: string;
  doctors: Doctor[];
}

type SubmitStatus = "idle" | "submitting" | "error";

/**
 * Opens in place below a pending/contacted row — never a modal, never
 * a drawer. One sentence of context, a doctor picker, one Confirm
 * button. On success this calls `router.refresh()` so the row reflects
 * real, persisted server state rather than a locally-faked one; there
 * is no local "optimistic" copy of the booking here.
 */
export function BookingDetailPanel({ booking, serviceName, doctors }: BookingDetailPanelProps) {
  const router = useRouter();
  const [doctorId, setDoctorId] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasDoctors = doctors.length > 0;

  async function handleConfirm() {
    if (!doctorId || status === "submitting") return;
    setStatus("submitting");
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/bookings/${booking.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId }),
      });
      const payload = await res.json();

      if (!res.ok) {
        setErrorMessage(payload.message ?? "Something went wrong on our end. Please try again.");
        setStatus("error");
        return;
      }

      // Re-fetch the server-rendered bookings (and, on next visit,
      // appointments) — the row un-expands on its own once this
      // booking is no longer pending/contacted.
      router.refresh();
    } catch {
      setErrorMessage("We couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <div className={styles.panel}>
      <p className={styles.sentence}>
        Confirming will create an appointment for {serviceName} on {formatDateForDisplay(booking.preferredDate)}
        {" · "}
        {PREFERRED_TIME_LABELS[booking.preferredTime]}, with the doctor you choose below.
      </p>

      {hasDoctors ? (
        <div className={styles.controls}>
          <select
            className={styles.select}
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            aria-label="Assign a doctor"
            disabled={status === "submitting"}
          >
            <option value="">Choose a doctor…</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>

          <button type="button" className={styles.confirm} onClick={handleConfirm} disabled={!doctorId || status === "submitting"}>
            {status === "submitting" ? "Confirming…" : "Confirm appointment"}
          </button>
        </div>
      ) : (
        <p className={styles.unavailable}>No doctors are set up for this clinic yet, so this request can&apos;t be confirmed.</p>
      )}

      {status === "error" && errorMessage && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
