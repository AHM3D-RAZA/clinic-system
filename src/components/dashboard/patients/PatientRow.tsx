import type { Patient } from "@/types/patient";
import type { PreferredTimeSlot } from "@/types/booking";
import type { SwatchKey } from "@/types/content";
import { formatDateForDisplay, formatPhoneReadable } from "@/lib/utils";
import { describeLastVisit } from "@/lib/patientDirectory";
import { swatchToCssVar } from "@/lib/theme";
import styles from "./PatientRow.module.css";

interface PatientRowProps {
  patient: Patient;
  doctorName: string;
  doctorSwatch: SwatchKey;
  todayIso: string;
}

const SHORT_TIME_LABEL: Record<PreferredTimeSlot, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

/**
 * One line of the register: who the patient is on the left, and the
 * doctor/schedule/attention picture on the right. No card border or
 * shadow — rows are separated by a single hairline, like entries in a
 * bound ledger rather than tiles in a grid.
 */
export function PatientRow({ patient, doctorName, doctorSwatch, todayIso }: PatientRowProps) {
  return (
    <li className={styles.row}>
      <div className={styles.who}>
        <p className={styles.name}>{patient.fullName}</p>
        <p className={styles.contact}>
          {patient.email} · {formatPhoneReadable(patient.phone)}
        </p>
      </div>

      <div className={styles.meta}>
        <p className={styles.doctor}>
          <span
            className={styles.doctorDot}
            style={{ background: swatchToCssVar(doctorSwatch) }}
            aria-hidden="true"
          />
          {doctorName}
        </p>

        {patient.nextAppointment ? (
          <p className={styles.schedule}>
            Next: {formatDateForDisplay(patient.nextAppointment.dateIso)} ·{" "}
            {SHORT_TIME_LABEL[patient.nextAppointment.time]}
          </p>
        ) : (
          <p className={styles.schedule}>{describeLastVisit(patient.lastVisit, todayIso)}</p>
        )}

        {patient.attentionNote && <p className={styles.attention}>{patient.attentionNote}</p>}
      </div>
    </li>
  );
}
