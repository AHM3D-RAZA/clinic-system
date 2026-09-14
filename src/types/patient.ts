import type { PatientType, PreferredTimeSlot } from "./booking";

/**
 * The dashboard's patient record. Deliberately its own type, not the
 * `patient` object embedded in a `BookingRequest` — a booking request
 * only captures what someone typed into the booking form at that
 * moment, while this is the clinic's actual, standing record of who a
 * patient is. `patientService`/`patientsMockDb` are the only places
 * that read or write this shape today.
 */
export interface Patient {
  id: string;
  clinicId: string;
  fullName: string;
  email: string;
  phone: string;
  patientType: PatientType;
  /** References a `Doctor.id` from the clinic's content bundle. */
  primaryDoctorId: string;
  /** ISO date the patient first joined the practice. */
  patientSince: string;
  /** ISO date of their most recent visit. Absent = never been seen yet. */
  lastVisit?: string;
  nextAppointment?: PatientAppointmentPreview;
  /**
   * A short, front-desk-relevant reason this patient needs attention —
   * administrative (insurance, scheduling, follow-up), never a
   * clinical/medical note. Absent when nothing needs attention.
   */
  attentionNote?: string;
}

export interface PatientAppointmentPreview {
  dateIso: string;
  time: PreferredTimeSlot;
  serviceId: string;
}
