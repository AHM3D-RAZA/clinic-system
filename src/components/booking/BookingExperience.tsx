"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import type { ClinicConfig } from "@/types/clinic";
import type { ServiceOffering } from "@/types/content";
import type { BookingRequest } from "@/types/booking";
import { BookingForm } from "./BookingForm";
import { BookingConfirmation } from "./BookingConfirmation";
import styles from "./BookingExperience.module.css";

interface BookingExperienceProps {
  clinic: ClinicConfig;
  services: ServiceOffering[];
}

/**
 * "The next room of the same clinic" — same typography and color
 * language as the marketing site, but calmer: no diorama, no marquee,
 * a single focused task.
 */
export function BookingExperience({ clinic, services }: BookingExperienceProps) {
  const [booking, setBooking] = useState<BookingRequest | null>(null);

  const bookedService = booking ? services.find((s) => s.id === booking.serviceId) : undefined;

  return (
    <main className={styles.page}>
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.header}>
          <Link href="/" className={styles.back}>
            &larr; back to {clinic.shortName}
          </Link>
          <span className="eyebrow">step through</span>
          <h1>Let&apos;s get you in the chair.</h1>
          <p>
            Tell us a bit about what you need — we&apos;ll follow up to confirm a specific time.
            No payment, no account, just a real conversation to start.
          </p>
        </div>

        {booking ? (
          <BookingConfirmation
            booking={booking}
            service={bookedService}
            clinicPhone={clinic.contact.phone}
            onStartOver={() => setBooking(null)}
          />
        ) : (
          <Suspense fallback={<div className={styles.formSkeleton} aria-hidden="true" />}>
            <BookingForm clinicId={clinic.id} services={services} onSuccess={setBooking} />
          </Suspense>
        )}
      </div>
    </main>
  );
}
