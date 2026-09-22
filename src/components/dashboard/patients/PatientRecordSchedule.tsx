import type { Patient } from "@/types/patient";
import type { Appointment } from "@/types/appointment";
import { formatDateForDisplay } from "@/lib/utils";
import { formatTimeLabel, statusLabel } from "@/lib/appointments";
import { describeLastVisit, SHORT_TIME_LABEL } from "@/lib/patientDirectory";
import { splitPatientSchedule } from "@/lib/patientRecord";
import styles from "./PatientRecordSchedule.module.css";

interface PatientRecordScheduleProps {
  patient: Patient;
  appointments: Appointment[];
  serviceNameById: Record<string, string>;
  todayIso: string;
}

/**
 * "Upcoming" and "Recently seen", side by side on wider screens. Uses
 * a patient's real matched appointments when they exist (richer:
 * status, exact time); falls back to the lighter-weight preview
 * fields already on the `Patient` record itself so this section never
 * renders empty just because the appointments mock data doesn't cover
 * every seeded patient.
 */
export function PatientRecordSchedule({ patient, appointments, serviceNameById, todayIso }: PatientRecordScheduleProps) {
  const { upcoming, recent } = splitPatientSchedule(appointments, todayIso);

  return (
    <div className={styles.grid}>
      <section>
        <h2 className={styles.eyebrow}>Upcoming</h2>
        {upcoming.length > 0 ? (
          <ul className={styles.list}>
            {upcoming.map((appointment) => (
              <li key={appointment.id} className={styles.item}>
                <p className={styles.itemPrimary}>
                  {formatDateForDisplay(appointment.date)} · {formatTimeLabel(appointment.time)}
                </p>
                <p className={styles.itemSecondary}>
                  {serviceNameById[appointment.serviceId] ?? "Service"} · {statusLabel(appointment.status)}
                </p>
              </li>
            ))}
          </ul>
        ) : patient.nextAppointment ? (
          <p className={styles.fallback}>
            {formatDateForDisplay(patient.nextAppointment.dateIso)} ·{" "}
            {SHORT_TIME_LABEL[patient.nextAppointment.time]} ·{" "}
            {serviceNameById[patient.nextAppointment.serviceId] ?? "Service"}
          </p>
        ) : (
          <p className={styles.fallback}>Nothing scheduled.</p>
        )}
      </section>

      <section>
        <h2 className={styles.eyebrow}>Recently seen</h2>
        {recent.length > 0 ? (
          <ul className={styles.list}>
            {recent.map((appointment) => (
              <li key={appointment.id} className={styles.item}>
                <p className={styles.itemPrimary}>{formatDateForDisplay(appointment.date)}</p>
                <p className={styles.itemSecondary}>
                  {serviceNameById[appointment.serviceId] ?? "Service"} · {statusLabel(appointment.status)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.fallback}>{describeLastVisit(patient.lastVisit, todayIso)}</p>
        )}
      </section>
    </div>
  );
}
