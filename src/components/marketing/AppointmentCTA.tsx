import Link from "next/link";
import type { ClinicConfig } from "@/types/clinic";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { formatPhoneReadable } from "@/lib/utils";
import styles from "./AppointmentCTA.module.css";

interface AppointmentCTAProps {
  clinic: ClinicConfig;
  bookingHref?: string;
}


export function AppointmentCTA({ clinic, bookingHref = "/book" }: AppointmentCTAProps) {
  return (
    <RevealOnScroll as="section" id="contact" className={styles.booking}>
      <div className={styles.grid}>
        <div>
          <span className={styles.eyebrow}>step through</span>
          <h2>Let&apos;s get you in the chair — comfortably.</h2>
          <p>
            Pick a time that works and we&apos;ll handle the rest. First visits get an extra
            fifteen minutes, just to talk.
          </p>
          <div className={styles.info}>
            <a href={`tel:${clinic.contact.phone}`}>{formatPhoneReadable(clinic.contact.phone)}</a>
            <a href={`mailto:${clinic.contact.email}`}>{clinic.contact.email}</a>
            <span>
              {clinic.contact.address} &middot; {clinic.contact.hours}
            </span>
          </div>
        </div>

        <div className={styles.door}>
          <div className={`${styles.panel} ${styles.left}`} />
          <div className={`${styles.panel} ${styles.right}`} />
          <div className={styles.doorCta}>
            <p>open the door</p>
            <Link href={bookingHref} className="btnPrimary">
              Make an appointment
            </Link>
          </div>
        </div>
      </div>
    </RevealOnScroll>
  );
}
