import type { Patient } from "@/types/patient";
import type { Appointment } from "@/types/appointment";
import type { BookingRequest } from "@/types/booking";
import type { SwatchKey } from "@/types/content";
import { PatientRecordHeader } from "./PatientRecordHeader";
import { PatientRecordSchedule } from "./PatientRecordSchedule";
import { PatientRecordBookingContext } from "./PatientRecordBookingContext";
import styles from "./PatientRecordWorkspace.module.css";

interface PatientRecordWorkspaceProps {
  patient: Patient;
  doctorName: string;
  doctorSwatch: SwatchKey;
  appointments: Appointment[];
  bookings: BookingRequest[];
  serviceNameById: Record<string, string>;
  todayIso: string;
}

/**
 * The "working record" a selected patient opens into — one step
 * deeper than the register, still the same room. Entirely server-
 * rendered: nothing here needs client-side state, so it stays as
 * light as the page it lives on.
 */
export function PatientRecordWorkspace({
  patient,
  doctorName,
  doctorSwatch,
  appointments,
  bookings,
  serviceNameById,
  todayIso,
}: PatientRecordWorkspaceProps) {
  return (
    <div className={styles.record}>
      <PatientRecordHeader patient={patient} doctorName={doctorName} doctorSwatch={doctorSwatch} />
      <PatientRecordSchedule
        patient={patient}
        appointments={appointments}
        serviceNameById={serviceNameById}
        todayIso={todayIso}
      />
      <PatientRecordBookingContext bookings={bookings} serviceNameById={serviceNameById} />
    </div>
  );
}
