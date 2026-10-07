import Link from "next/link";
import type { ReactNode } from "react";
import type { ClinicConfig } from "@/types/clinic";
import styles from "./LoginRoom.module.css";

/**
 * The page around the sign-in form: the clinic's name, a short line about
 * what's behind the door, and a way back to the public site. No card, no
 * marketing — just the entrance to the working room.
 */
export function LoginRoom({ clinic, children }: { clinic: ClinicConfig; children: ReactNode }) {
  return (
    <div className={styles.room}>
      <main className={styles.column}>
        <p className={styles.mark}>staff entrance</p>
        <h1 className={styles.headline}>{clinic.shortName} staff sign in</h1>
        <p className={styles.context}>Today&rsquo;s bookings, patients and appointments are waiting inside.</p>
        {children}
        <Link href="/" className={styles.back}>
          &larr; Back to the {clinic.shortName} website
        </Link>
      </main>
    </div>
  );
}
