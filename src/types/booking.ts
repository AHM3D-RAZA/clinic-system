/**
 * Lifecycle of a booking request. A submitted form is ALWAYS "pending" —
 * it only becomes "confirmed" once a human (or, later, automation)
 * assigns a time and doctor. A booking request and an appointment
 * remain conceptually different things (see `types/appointment.ts`),
 * but confirming a booking (see `lib/deriveAppointment.ts`) is the
 * step that turns one into the other.
 */
export type BookingStatus =
  | "pending"
  | "contacted"
  | "confirmed"
  | "cancelled"
  | "completed";

export type PatientType = "new" | "existing";

export type PreferredTimeSlot = "morning" | "afternoon" | "evening";

export interface BookingPatientInfo {
  fullName: string;
  email: string;
  phone: string;
  patientType: PatientType;
}

/** What the booking form collects and sends to the service layer. */
export interface CreateBookingInput {
  clinicId: string;
  patient: BookingPatientInfo;
  serviceId: string;
  preferredDate: string; // ISO date, yyyy-mm-dd
  preferredTime: PreferredTimeSlot;
  notes?: string;
}

/**
 * The persisted domain record. Deliberately structured so a future
 * clinic dashboard could list/filter/update these directly — this is
 * "real" data, not a form-submission echo.
 */
export interface BookingRequest extends CreateBookingInput {
  id: string;
  /**
   * The canonical `Patient.id` this request belongs to. Optional: a
   * request submitted through the public form carries no patient
   * identity until it's confirmed (see `services/confirmationService.ts`,
   * which resolves or creates the patient and records the id here), and
   * a request that never converts (e.g. cancelled) may never get one.
   * `patient` below stays as the snapshot of what the form collected.
   */
  patientId?: string;
  status: BookingStatus;
  assignedDoctorId?: string;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

/** Field-level validation errors, keyed by flattened form field name. */
export type BookingFormField =
  | "patient.fullName"
  | "patient.email"
  | "patient.phone"
  | "patient.patientType"
  | "serviceId"
  | "preferredDate"
  | "preferredTime"
  | "notes";

export type BookingFormErrors = Partial<Record<BookingFormField, string>>;
