import type { Appointment } from "@/types/appointment";
import { appointmentPatient, DOCTOR, PATIENT_ID, SEED_CLINIC_ID, SERVICE, seedDate } from "./seedGraph";

/**
 * Seed data for `data/appointmentsTable.ts` (the file-backed store) —
 * loaded once, on that store's first initialization, exactly like
 * `mockDb.ts`'s `SEED_BOOKING_REQUESTS`. This array itself is never
 * read anywhere else at runtime; it exists so the demo starts with a
 * realistic spread of appointments instead of an empty schedule.
 */

/**
 * ~23 records spanning two days in the past through three days ahead,
 * across all three doctors and all six services, with a realistic
 * status mix (completed in the past, confirmed/pending around today,
 * a couple of cancellations). Times sit within the clinic's posted
 * hours (Tue–Sat, 9am–6pm).
 */
export const APPOINTMENTS: Appointment[] = [
  // Two days ago
  { id: "apt_0001", clinicId: SEED_CLINIC_ID, ...appointmentPatient(PATIENT_ID.imranQureshi), doctorId: DOCTOR.nadia.id, serviceId: SERVICE.checkups, date: seedDate(-2), time: "09:00", durationMinutes: 30, status: "completed" },
  { id: "apt_0002", clinicId: SEED_CLINIC_ID, ...appointmentPatient(PATIENT_ID.ayeshaNoor), doctorId: DOCTOR.sana.id, serviceId: SERVICE.kids, date: seedDate(-2), time: "11:30", durationMinutes: 30, status: "completed", notes: "First dental visit — parent asked for a slow, narrated walkthrough before any instruments." },
  { id: "apt_0003", clinicId: SEED_CLINIC_ID, ...appointmentPatient(PATIENT_ID.bilalRashid), doctorId: DOCTOR.rehan.id, serviceId: SERVICE.rootCanal, date: seedDate(-2), time: "15:00", durationMinutes: 60, status: "cancelled", notes: "Patient called to cancel — flu symptoms. Wants to rebook once recovered." },

  // Yesterday
  { id: "apt_0004", clinicId: SEED_CLINIC_ID, ...appointmentPatient(PATIENT_ID.hassanRaza), doctorId: DOCTOR.nadia.id, serviceId: SERVICE.fillings, date: seedDate(-1), time: "09:30", durationMinutes: 45, status: "completed" },
  { id: "apt_0005", clinicId: SEED_CLINIC_ID, ...appointmentPatient(PATIENT_ID.farhanIqbal), doctorId: DOCTOR.rehan.id, serviceId: SERVICE.rootCanal, date: seedDate(-1), time: "10:30", durationMinutes: 60, status: "completed", notes: "Local anaesthetic only — patient has a documented reaction to epinephrine." },
  { id: "apt_0006", clinicId: SEED_CLINIC_ID, ...appointmentPatient(PATIENT_ID.zoyaSheikh), doctorId: DOCTOR.sana.id, serviceId: SERVICE.kids, date: seedDate(-1), time: "14:00", durationMinutes: 30, status: "completed" },
  { id: "apt_0007", clinicId: SEED_CLINIC_ID, ...appointmentPatient(PATIENT_ID.farahSiddiqui), doctorId: DOCTOR.nadia.id, serviceId: SERVICE.whitening, date: seedDate(-1), time: "16:15", durationMinutes: 45, status: "cancelled" },

  // Today
  { id: "apt_0008", clinicId: SEED_CLINIC_ID, ...appointmentPatient(PATIENT_ID.owenBricks), doctorId: DOCTOR.nadia.id, serviceId: SERVICE.checkups, date: seedDate(0), time: "09:00", durationMinutes: 30, status: "confirmed" },
  { id: "apt_0009", clinicId: SEED_CLINIC_ID, ...appointmentPatient(PATIENT_ID.mayaChen), doctorId: DOCTOR.sana.id, serviceId: SERVICE.kids, date: seedDate(0), time: "09:45", durationMinutes: 30, status: "confirmed" },
  { id: "apt_0010", clinicId: SEED_CLINIC_ID, ...appointmentPatient(PATIENT_ID.daniyalSheikh), doctorId: DOCTOR.rehan.id, serviceId: SERVICE.rootCanal, date: seedDate(0), time: "10:30", durationMinutes: 60, status: "confirmed", notes: "Second session of a two-part root canal — crown impression is already on file." },
  { id: "apt_0011", clinicId: SEED_CLINIC_ID, ...appointmentPatient(PATIENT_ID.kiranAziz), doctorId: DOCTOR.nadia.id, serviceId: SERVICE.fillings, date: seedDate(0), time: "12:00", durationMinutes: 45, status: "pending" },
  {
    id: "apt_0012",
    clinicId: SEED_CLINIC_ID,
    ...appointmentPatient(PATIENT_ID.alexandriaWhitfieldMontgomery),
    doctorId: DOCTOR.sana.id,
    serviceId: SERVICE.checkups,
    date: seedDate(0),
    time: "13:30",
    durationMinutes: 30,
    status: "confirmed",
  },
  { id: "apt_0013", clinicId: SEED_CLINIC_ID, ...appointmentPatient(PATIENT_ID.anumFatima), doctorId: DOCTOR.rehan.id, serviceId: SERVICE.ortho, date: seedDate(0), time: "15:00", durationMinutes: 45, status: "pending", notes: "Wants to discuss clear aligners specifically — has a wedding in six weeks." },
  { id: "apt_0014", clinicId: SEED_CLINIC_ID, ...appointmentPatient(PATIENT_ID.graceLindqvist), doctorId: DOCTOR.nadia.id, serviceId: SERVICE.whitening, date: seedDate(0), time: "16:30", durationMinutes: 45, status: "confirmed", notes: "Mentioned mild sensitivity to whitening gel last visit — check before starting." },

  // Tomorrow
  { id: "apt_0015", clinicId: SEED_CLINIC_ID, ...appointmentPatient(PATIENT_ID.tariqMahmood), doctorId: DOCTOR.rehan.id, serviceId: SERVICE.rootCanal, date: seedDate(1), time: "09:00", durationMinutes: 60, status: "confirmed" },
  { id: "apt_0016", clinicId: SEED_CLINIC_ID, ...appointmentPatient(PATIENT_ID.laylaAhmed), doctorId: DOCTOR.sana.id, serviceId: SERVICE.kids, date: seedDate(1), time: "10:15", durationMinutes: 30, status: "pending" },
  { id: "apt_0017", clinicId: SEED_CLINIC_ID, ...appointmentPatient(PATIENT_ID.victorNakamura), doctorId: DOCTOR.nadia.id, serviceId: SERVICE.checkups, date: seedDate(1), time: "13:00", durationMinutes: 30, status: "confirmed" },

  // Two days ahead
  { id: "apt_0018", clinicId: SEED_CLINIC_ID, ...appointmentPatient(PATIENT_ID.amaraOkafor), doctorId: DOCTOR.sana.id, serviceId: SERVICE.kids, date: seedDate(2), time: "09:30", durationMinutes: 30, status: "confirmed" },
  { id: "apt_0019", clinicId: SEED_CLINIC_ID, ...appointmentPatient(PATIENT_ID.inesMoreira), doctorId: DOCTOR.rehan.id, serviceId: SERVICE.fillings, date: seedDate(2), time: "11:00", durationMinutes: 45, status: "pending" },

  // Three days ahead
  { id: "apt_0020", clinicId: SEED_CLINIC_ID, ...appointmentPatient(PATIENT_ID.marcusWebb), doctorId: DOCTOR.nadia.id, serviceId: SERVICE.ortho, date: seedDate(3), time: "14:00", durationMinutes: 45, status: "confirmed" },

  // Appointments that belong to the seeded booking requests which are
  // already confirmed/completed — a confirmed booking always has one.
  { id: "apt_0021", clinicId: SEED_CLINIC_ID, ...appointmentPatient(PATIENT_ID.mayaChen), doctorId: DOCTOR.nadia.id, serviceId: SERVICE.checkups, date: seedDate(3), time: "09:00", durationMinutes: 30, status: "confirmed", sourceBookingId: "bkg_seed0001" },
  { id: "apt_0022", clinicId: SEED_CLINIC_ID, ...appointmentPatient(PATIENT_ID.ethanWalsh), doctorId: DOCTOR.rehan.id, serviceId: SERVICE.kids, date: seedDate(5), time: "09:00", durationMinutes: 30, status: "confirmed", sourceBookingId: "bkg_seed0006" },
  { id: "apt_0023", clinicId: SEED_CLINIC_ID, ...appointmentPatient(PATIENT_ID.isabelleMarchand), doctorId: DOCTOR.sana.id, serviceId: SERVICE.checkups, date: seedDate(-10), time: "13:00", durationMinutes: 30, status: "completed", sourceBookingId: "bkg_seed0007" },
];
