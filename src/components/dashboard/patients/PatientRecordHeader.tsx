import Link from "next/link";
import type { Patient } from "@/types/patient";
import type { SwatchKey } from "@/types/content";
import { formatPhoneReadable } from "@/lib/utils";
import { swatchToCssVar } from "@/lib/theme";
import styles from "./PatientRecordHeader.module.css";

interface PatientRecordHeaderProps {
  patient: Patient;
  doctorName: string;
  doctorSwatch: SwatchKey;
}

/**
 * Mirrors `PatientsHeader`'s masthead tone (eyebrow mark, display
 * headline, hairline underneath) so opening a record still feels like
 * the same room as the register, just one page deeper.
 */
export function PatientRecordHeader({ patient, doctorName, doctorSwatch }: PatientRecordHeaderProps) {
  return (
    <div className={styles.masthead}>
      <Link href="/dashboard/patients" className={styles.back}>
        ← Back to the register
      </Link>

      <span className={styles.mark}>the record</span>
      <h1 className={styles.name}>{patient.fullName}</h1>
      <p className={styles.contact}>
        {patient.email} · {formatPhoneReadable(patient.phone)}
      </p>

      <div className={styles.metaRow}>
        <span className={styles.doctor}>
          <span
            className={styles.doctorDot}
            style={{ background: swatchToCssVar(doctorSwatch) }}
            aria-hidden="true"
          />
          {doctorName}
        </span>
        <span className={styles.since}>
          Patient since{" "}
          {new Date(`${patient.patientSince}T00:00:00`).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>

      {patient.attentionNote && <p className={styles.attention}>{patient.attentionNote}</p>}
    </div>
  );
}
