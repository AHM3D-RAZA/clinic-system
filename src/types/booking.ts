/**
 * Lifecycle of a booking request. A submitted form is ALWAYS "pending" —
 * it only becomes "confirmed" once a human (or, later, automation)
 * assigns a time and doctor. See the project brief: a booking request
 * and an appointment are conceptually different things, and we keep
 * that distinction even though the MVP doesn't yet build the step that
 * turns one into the other.
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
