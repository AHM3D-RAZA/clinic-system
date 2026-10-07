import type { BookingPatientInfo, PatientType } from "@/types/booking";

/**
 * The canonical seed graph: the one place demo identities are defined.
 *
 * Patients, doctors and services are declared ONCE here, by id. The
 * seed sources for the booking store (`mockDb.ts`), the appointment
 * store (`appointmentMockData.ts`), the patient table
 * (`patientsMockDb.ts`) and the team roster (`team.ts`) all populate
 * themselves from these identities instead of repeating names and
 * emails — so the graph Patient → BookingRequest → Appointment →
 * Doctor → Service holds by construction rather than by matching
 * strings. This is seed data only: each store keeps its own file-backed
 * persistence, and nothing here is read at runtime once a store has
 * been initialised.
 */

export const SEED_CLINIC_ID = "aster";

/** Operational doctor identities. Same ids the public-site content and the team roster use. */
export const DOCTOR = {
  nadia: { id: "nadia-farooqi", name: "Dr. Nadia Farooqi" },
  rehan: { id: "rehan-khalid", name: "Dr. Rehan Khalid" },
  sana: { id: "sana-malik", name: "Dr. Sana Malik" },
} as const;

export const SERVICE = {
  checkups: "checkups-cleanings",
  fillings: "fillings-repairs",
  rootCanal: "root-canal",
  whitening: "cosmetic-whitening",
  ortho: "orthodontics-aligners",
  kids: "kids-dentistry",
} as const;

/**
 * `offset` days from today as a local-calendar `yyyy-mm-dd`. Local
 * (not UTC) on purpose: the dashboard's "today" is the clinic's local
 * date, and seeds must agree with it.
 */
export function seedDate(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

/** An ISO timestamp `days` ago. */
export function seedTimestamp(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

export interface SeedPatient {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  patientType: PatientType;
  primaryDoctorId: string;
  patientSinceDaysAgo: number;
  /** Omitted = never seen. Real completed appointments take precedence at read time. */
  lastVisitDaysAgo?: number;
  attentionNote?: string;
}

export const PATIENT_ID = {
  mayaChen: "pat_maya-chen",
  owenBricks: "pat_owen-bricks",
  zaraHussain: "pat_zara-hussain",
  danielOsei: "pat_daniel-osei",
  priyaNair: "pat_priya-nair",
  liamFitzgerald: "pat_liam-fitzgerald",
  amaraOkafor: "pat_amara-okafor",
  hassanRaza: "pat_hassan-raza",
  inesMoreira: "pat_ines-moreira",
  noahBennett: "pat_noah-bennett",
  farahSiddiqui: "pat_farah-siddiqui",
  ethanWalsh: "pat_ethan-walsh",
  laylaAhmed: "pat_layla-ahmed",
  marcusWebb: "pat_marcus-webb",
  sofiaAlmeida: "pat_sofia-almeida",
  ryanObrien: "pat_ryan-obrien",
  graceLindqvist: "pat_grace-lindqvist",
  tariqMahmood: "pat_tariq-mahmood",
  isabelleMarchand: "pat_isabelle-marchand",
  victorNakamura: "pat_victor-nakamura",
  imranQureshi: "pat_imran-qureshi",
  ayeshaNoor: "pat_ayesha-noor",
  bilalRashid: "pat_bilal-rashid",
  farhanIqbal: "pat_farhan-iqbal",
  zoyaSheikh: "pat_zoya-sheikh",
  daniyalSheikh: "pat_daniyal-sheikh",
  kiranAziz: "pat_kiran-aziz",
  alexandriaWhitfieldMontgomery: "pat_alexandria-whitfield-montgomery",
  anumFatima: "pat_anum-fatima",
} as const;

export const SEED_PATIENTS: SeedPatient[] = [
  { id: "pat_maya-chen", fullName: "Maya Chen", email: "maya.chen@example.com", phone: "+15550192231", patientType: "existing", primaryDoctorId: DOCTOR.nadia.id, patientSinceDaysAgo: 620, lastVisitDaysAgo: 5 },
  { id: "pat_owen-bricks", fullName: "Owen Bricks", email: "owen.b@example.com", phone: "+15550487710", patientType: "new", primaryDoctorId: DOCTOR.nadia.id, patientSinceDaysAgo: 1, attentionNote: "First visit not yet confirmed" },
  { id: "pat_zara-hussain", fullName: "Zara Hussain", email: "zara.hussain@example.com", phone: "+15550113345", patientType: "existing", primaryDoctorId: DOCTOR.sana.id, patientSinceDaysAgo: 980, lastVisitDaysAgo: 40 },
  { id: "pat_daniel-osei", fullName: "Daniel Osei", email: "daniel.osei@example.com", phone: "+15550298871", patientType: "existing", primaryDoctorId: DOCTOR.rehan.id, patientSinceDaysAgo: 410, lastVisitDaysAgo: 260, attentionNote: "Hasn't booked a follow-up" },
  { id: "pat_priya-nair", fullName: "Priya Nair", email: "priya.nair@example.com", phone: "+15550376642", patientType: "existing", primaryDoctorId: DOCTOR.nadia.id, patientSinceDaysAgo: 210, lastVisitDaysAgo: 14 },
  { id: "pat_liam-fitzgerald", fullName: "Liam Fitzgerald", email: "liam.fitz@example.com", phone: "+15550561298", patientType: "existing", primaryDoctorId: DOCTOR.rehan.id, patientSinceDaysAgo: 150, lastVisitDaysAgo: 2 },
  { id: "pat_amara-okafor", fullName: "Amara Okafor", email: "amara.okafor@example.com", phone: "+15550649912", patientType: "new", primaryDoctorId: DOCTOR.sana.id, patientSinceDaysAgo: 3 },
  { id: "pat_hassan-raza", fullName: "Hassan Raza", email: "hassan.raza@example.com", phone: "+15550722187", patientType: "existing", primaryDoctorId: DOCTOR.nadia.id, patientSinceDaysAgo: 730, lastVisitDaysAgo: 310, attentionNote: "Insurance on file expires this month" },
  { id: "pat_ines-moreira", fullName: "Ines Moreira", email: "ines.moreira@example.com", phone: "+15550834456", patientType: "existing", primaryDoctorId: DOCTOR.rehan.id, patientSinceDaysAgo: 95, lastVisitDaysAgo: 20 },
  { id: "pat_noah-bennett", fullName: "Noah Bennett", email: "noah.bennett@example.com", phone: "+15550915523", patientType: "existing", primaryDoctorId: DOCTOR.sana.id, patientSinceDaysAgo: 340, lastVisitDaysAgo: 90 },
  { id: "pat_farah-siddiqui", fullName: "Farah Siddiqui", email: "farah.siddiqui@example.com", phone: "+15551027761", patientType: "existing", primaryDoctorId: DOCTOR.nadia.id, patientSinceDaysAgo: 1200, lastVisitDaysAgo: 8 },
  { id: "pat_ethan-walsh", fullName: "Ethan Walsh", email: "ethan.walsh@example.com", phone: "+15551148832", patientType: "existing", primaryDoctorId: DOCTOR.rehan.id, patientSinceDaysAgo: 60, lastVisitDaysAgo: 60, attentionNote: "Missed last appointment" },
  { id: "pat_layla-ahmed", fullName: "Layla Ahmed", email: "layla.ahmed@example.com", phone: "+15551253398", patientType: "existing", primaryDoctorId: DOCTOR.sana.id, patientSinceDaysAgo: 500, lastVisitDaysAgo: 120 },
  { id: "pat_marcus-webb", fullName: "Marcus Webb", email: "marcus.webb@example.com", phone: "+15551369914", patientType: "existing", primaryDoctorId: DOCTOR.nadia.id, patientSinceDaysAgo: 880, lastVisitDaysAgo: 180 },
  { id: "pat_sofia-almeida", fullName: "Sofia Almeida", email: "sofia.almeida@example.com", phone: "+15551477765", patientType: "new", primaryDoctorId: DOCTOR.rehan.id, patientSinceDaysAgo: 7 },
  { id: "pat_ryan-obrien", fullName: "Ryan O'Brien", email: "ryan.obrien@example.com", phone: "+15551582231", patientType: "existing", primaryDoctorId: DOCTOR.sana.id, patientSinceDaysAgo: 260, lastVisitDaysAgo: 50 },
  { id: "pat_grace-lindqvist", fullName: "Grace Lindqvist", email: "grace.lindqvist@example.com", phone: "+15551698847", patientType: "existing", primaryDoctorId: DOCTOR.nadia.id, patientSinceDaysAgo: 45, lastVisitDaysAgo: 45 },
  { id: "pat_tariq-mahmood", fullName: "Tariq Mahmood", email: "tariq.mahmood@example.com", phone: "+15551703312", patientType: "existing", primaryDoctorId: DOCTOR.rehan.id, patientSinceDaysAgo: 700, lastVisitDaysAgo: 400, attentionNote: "Hasn't been seen in over a year" },
  { id: "pat_isabelle-marchand", fullName: "Isabelle Marchand", email: "isabelle.marchand@example.com", phone: "+15551814476", patientType: "existing", primaryDoctorId: DOCTOR.sana.id, patientSinceDaysAgo: 320, lastVisitDaysAgo: 30 },
  { id: "pat_victor-nakamura", fullName: "Victor Nakamura", email: "victor.nakamura@example.com", phone: "+15551925591", patientType: "existing", primaryDoctorId: DOCTOR.nadia.id, patientSinceDaysAgo: 190, lastVisitDaysAgo: 190 },
  { id: "pat_imran-qureshi", fullName: "Imran Qureshi", email: "imran.qureshi@example.com", phone: "+15552031147", patientType: "existing", primaryDoctorId: DOCTOR.nadia.id, patientSinceDaysAgo: 400, lastVisitDaysAgo: 120 },
  { id: "pat_ayesha-noor", fullName: "Ayesha Noor", email: "ayesha.noor@example.com", phone: "+15552044518", patientType: "new", primaryDoctorId: DOCTOR.sana.id, patientSinceDaysAgo: 2 },
  { id: "pat_bilal-rashid", fullName: "Bilal Rashid", email: "bilal.rashid@example.com", phone: "+15552057734", patientType: "existing", primaryDoctorId: DOCTOR.rehan.id, patientSinceDaysAgo: 300, lastVisitDaysAgo: 200 },
  { id: "pat_farhan-iqbal", fullName: "Farhan Iqbal", email: "farhan.iqbal@example.com", phone: "+15552062209", patientType: "existing", primaryDoctorId: DOCTOR.rehan.id, patientSinceDaysAgo: 500, lastVisitDaysAgo: 90 },
  { id: "pat_zoya-sheikh", fullName: "Zoya Sheikh", email: "zoya.sheikh@example.com", phone: "+15552078863", patientType: "new", primaryDoctorId: DOCTOR.sana.id, patientSinceDaysAgo: 1 },
  { id: "pat_daniyal-sheikh", fullName: "Daniyal Sheikh", email: "daniyal.sheikh@example.com", phone: "+15552085591", patientType: "existing", primaryDoctorId: DOCTOR.rehan.id, patientSinceDaysAgo: 250, lastVisitDaysAgo: 21 },
  { id: "pat_kiran-aziz", fullName: "Kiran Aziz", email: "kiran.aziz@example.com", phone: "+15552093346", patientType: "new", primaryDoctorId: DOCTOR.nadia.id, patientSinceDaysAgo: 2 },
  { id: "pat_alexandria-whitfield-montgomery", fullName: "Alexandria Whitfield-Montgomery", email: "alexandria.whitfield@example.com", phone: "+15552106675", patientType: "existing", primaryDoctorId: DOCTOR.sana.id, patientSinceDaysAgo: 700, lastVisitDaysAgo: 100 },
  { id: "pat_anum-fatima", fullName: "Anum Fatima", email: "anum.fatima@example.com", phone: "+15552114428", patientType: "new", primaryDoctorId: DOCTOR.rehan.id, patientSinceDaysAgo: 3 },
];

export function seedPatient(id: string): SeedPatient {
  const found = SEED_PATIENTS.find((p) => p.id === id);
  if (!found) throw new Error(`Unknown seed patient id: "${id}"`);
  return found;
}

/** Identity fields for an `Appointment` seed — id plus the name/type snapshot. */
export function appointmentPatient(id: string): { patientId: string; patientName: string; patientType: PatientType } {
  const p = seedPatient(id);
  return { patientId: p.id, patientName: p.fullName, patientType: p.patientType };
}

/** Identity fields for a `BookingRequest` seed — id plus the form-style snapshot. */
export function bookingPatient(id: string): { patientId: string; patient: BookingPatientInfo } {
  const p = seedPatient(id);
  return {
    patientId: p.id,
    patient: { fullName: p.fullName, email: p.email, phone: p.phone, patientType: p.patientType },
  };
}
