import type { Appointment } from "@/types/appointment";

/**
 * A stand-in for a real appointments table. Deliberately separate from
 * `data/mockDb.ts` (the booking-request store): appointments are a
 * different domain concept (see `types/appointment.ts`) and this phase
 * only needs to *read* a realistic spread of them, not persist writes.
 * Swapping this for a real backend later means replacing this file and
 * `services/appointmentService.ts` — nothing above the service layer
 * needs to change.
 */

/** `n` days from today, as `yyyy-mm-dd`. Negative `n` is in the past. */
function daysFromTodayIso(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const DOCTOR = {
  nadia: "nadia-farooqi",
  rehan: "rehan-khalid",
  sana: "sana-malik",
} as const;

const SERVICE = {
  checkups: "checkups-cleanings",
  fillings: "fillings-repairs",
  rootCanal: "root-canal",
  whitening: "cosmetic-whitening",
  ortho: "orthodontics-aligners",
  kids: "kids-dentistry",
} as const;

/**
 * ~20 records spanning two days in the past through three days ahead,
 * across all three doctors and all six services, with a realistic
 * status mix (completed in the past, confirmed/pending around today,
 * a couple of cancellations). Times sit within the clinic's posted
 * hours (Tue–Sat, 9am–6pm).
 */
export const APPOINTMENTS: Appointment[] = [
  // Two days ago
  { id: "apt_0001", clinicId: "aster", patientName: "Imran Qureshi", patientType: "existing", doctorId: DOCTOR.nadia, serviceId: SERVICE.checkups, date: daysFromTodayIso(-2), time: "09:00", durationMinutes: 30, status: "completed" },
  { id: "apt_0002", clinicId: "aster", patientName: "Ayesha Noor", patientType: "new", doctorId: DOCTOR.sana, serviceId: SERVICE.kids, date: daysFromTodayIso(-2), time: "11:30", durationMinutes: 30, status: "completed", notes: "First dental visit — parent asked for a slow, narrated walkthrough before any instruments." },
  { id: "apt_0003", clinicId: "aster", patientName: "Bilal Rashid", patientType: "existing", doctorId: DOCTOR.rehan, serviceId: SERVICE.rootCanal, date: daysFromTodayIso(-2), time: "15:00", durationMinutes: 60, status: "cancelled", notes: "Patient called to cancel — flu symptoms. Wants to rebook once recovered." },

  // Yesterday
  { id: "apt_0004", clinicId: "aster", patientName: "Hassan Raza", patientType: "existing", doctorId: DOCTOR.nadia, serviceId: SERVICE.fillings, date: daysFromTodayIso(-1), time: "09:30", durationMinutes: 45, status: "completed" },
  { id: "apt_0005", clinicId: "aster", patientName: "Farhan Iqbal", patientType: "existing", doctorId: DOCTOR.rehan, serviceId: SERVICE.rootCanal, date: daysFromTodayIso(-1), time: "10:30", durationMinutes: 60, status: "completed", notes: "Local anaesthetic only — patient has a documented reaction to epinephrine." },
  { id: "apt_0006", clinicId: "aster", patientName: "Zoya Sheikh", patientType: "new", doctorId: DOCTOR.sana, serviceId: SERVICE.kids, date: daysFromTodayIso(-1), time: "14:00", durationMinutes: 30, status: "completed" },
  { id: "apt_0007", clinicId: "aster", patientName: "Farah Siddiqui", patientType: "existing", doctorId: DOCTOR.nadia, serviceId: SERVICE.whitening, date: daysFromTodayIso(-1), time: "16:15", durationMinutes: 45, status: "cancelled" },

  // Today
  { id: "apt_0008", clinicId: "aster", patientName: "Owen Bricks", patientType: "new", doctorId: DOCTOR.nadia, serviceId: SERVICE.checkups, date: daysFromTodayIso(0), time: "09:00", durationMinutes: 30, status: "confirmed" },
  { id: "apt_0009", clinicId: "aster", patientName: "Maya Chen", patientType: "existing", doctorId: DOCTOR.sana, serviceId: SERVICE.kids, date: daysFromTodayIso(0), time: "09:45", durationMinutes: 30, status: "confirmed" },
  { id: "apt_0010", clinicId: "aster", patientName: "Daniyal Sheikh", patientType: "existing", doctorId: DOCTOR.rehan, serviceId: SERVICE.rootCanal, date: daysFromTodayIso(0), time: "10:30", durationMinutes: 60, status: "confirmed", notes: "Second session of a two-part root canal — crown impression is already on file." },
  { id: "apt_0011", clinicId: "aster", patientName: "Kiran Aziz", patientType: "new", doctorId: DOCTOR.nadia, serviceId: SERVICE.fillings, date: daysFromTodayIso(0), time: "12:00", durationMinutes: 45, status: "pending" },
  {
    id: "apt_0012",
    clinicId: "aster",
    patientName: "Alexandria Whitfield-Montgomery",
    patientType: "existing",
    doctorId: DOCTOR.sana,
    serviceId: SERVICE.checkups,
    date: daysFromTodayIso(0),
    time: "13:30",
    durationMinutes: 30,
    status: "confirmed",
  },
  { id: "apt_0013", clinicId: "aster", patientName: "Anum Fatima", patientType: "new", doctorId: DOCTOR.rehan, serviceId: SERVICE.ortho, date: daysFromTodayIso(0), time: "15:00", durationMinutes: 45, status: "pending", notes: "Wants to discuss clear aligners specifically — has a wedding in six weeks." },
  { id: "apt_0014", clinicId: "aster", patientName: "Grace Lindqvist", patientType: "existing", doctorId: DOCTOR.nadia, serviceId: SERVICE.whitening, date: daysFromTodayIso(0), time: "16:30", durationMinutes: 45, status: "confirmed", notes: "Mentioned mild sensitivity to whitening gel last visit — check before starting." },

  // Tomorrow
  { id: "apt_0015", clinicId: "aster", patientName: "Tariq Mahmood", patientType: "existing", doctorId: DOCTOR.rehan, serviceId: SERVICE.rootCanal, date: daysFromTodayIso(1), time: "09:00", durationMinutes: 60, status: "confirmed" },
  { id: "apt_0016", clinicId: "aster", patientName: "Layla Ahmed", patientType: "existing", doctorId: DOCTOR.sana, serviceId: SERVICE.kids, date: daysFromTodayIso(1), time: "10:15", durationMinutes: 30, status: "pending" },
  { id: "apt_0017", clinicId: "aster", patientName: "Victor Nakamura", patientType: "existing", doctorId: DOCTOR.nadia, serviceId: SERVICE.checkups, date: daysFromTodayIso(1), time: "13:00", durationMinutes: 30, status: "confirmed" },

  // Two days ahead
  { id: "apt_0018", clinicId: "aster", patientName: "Amara Okafor", patientType: "new", doctorId: DOCTOR.sana, serviceId: SERVICE.kids, date: daysFromTodayIso(2), time: "09:30", durationMinutes: 30, status: "confirmed" },
  { id: "apt_0019", clinicId: "aster", patientName: "Ines Moreira", patientType: "existing", doctorId: DOCTOR.rehan, serviceId: SERVICE.fillings, date: daysFromTodayIso(2), time: "11:00", durationMinutes: 45, status: "pending" },

  // Three days ahead
  { id: "apt_0020", clinicId: "aster", patientName: "Marcus Webb", patientType: "existing", doctorId: DOCTOR.nadia, serviceId: SERVICE.ortho, date: daysFromTodayIso(3), time: "14:00", durationMinutes: 45, status: "confirmed" },
];
