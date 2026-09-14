import type { Patient } from "@/types/patient";

/**
 * A stand-in for a future "patients" database table. Deliberately
 * separate from `mockDb.ts`'s booking-requests table: a booking
 * request only captures what someone typed into the booking form at
 * one moment, while this is the clinic's standing patient directory —
 * the thing the Patients workspace actually works from.
 *
 * Phase 1 is read-only (list/search only), so this stays a plain
 * static table rather than the file-backed store `mockDb.ts` uses for
 * bookings — there's nothing to persist yet. When create/edit lands,
 * swapping this file's internals for a real database/ORM is the only
 * change needed: `patientService.ts` and everything above it stays
 * the same either way.
 */

const CLINIC_ID = "aster";

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function daysAheadIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const PATIENTS: Patient[] = [
  {
    id: "pat_maya-chen",
    clinicId: CLINIC_ID,
    fullName: "Maya Chen",
    email: "maya.chen@example.com",
    phone: "+15550192231",
    patientType: "existing",
    primaryDoctorId: "nadia-farooqi",
    patientSince: daysAgoIso(620),
    lastVisit: daysAgoIso(5),
    nextAppointment: { dateIso: daysAheadIso(3), time: "morning", serviceId: "checkups-cleanings" },
  },
  {
    id: "pat_owen-bricks",
    clinicId: CLINIC_ID,
    fullName: "Owen Bricks",
    email: "owen.b@example.com",
    phone: "+15550487710",
    patientType: "new",
    primaryDoctorId: "nadia-farooqi",
    patientSince: daysAgoIso(1),
    nextAppointment: { dateIso: daysAheadIso(6), time: "afternoon", serviceId: "cosmetic-whitening" },
    attentionNote: "First visit not yet confirmed",
  },
  {
    id: "pat_zara-hussain",
    clinicId: CLINIC_ID,
    fullName: "Zara Hussain",
    email: "zara.hussain@example.com",
    phone: "+15550113345",
    patientType: "existing",
    primaryDoctorId: "sana-malik",
    patientSince: daysAgoIso(980),
    lastVisit: daysAgoIso(40),
  },
  {
    id: "pat_daniel-osei",
    clinicId: CLINIC_ID,
    fullName: "Daniel Osei",
    email: "daniel.osei@example.com",
    phone: "+15550298871",
    patientType: "existing",
    primaryDoctorId: "rehan-khalid",
    patientSince: daysAgoIso(410),
    lastVisit: daysAgoIso(260),
    attentionNote: "Hasn't booked a follow-up",
  },
  {
    id: "pat_priya-nair",
    clinicId: CLINIC_ID,
    fullName: "Priya Nair",
    email: "priya.nair@example.com",
    phone: "+15550376642",
    patientType: "existing",
    primaryDoctorId: "nadia-farooqi",
    patientSince: daysAgoIso(210),
    lastVisit: daysAgoIso(14),
    nextAppointment: { dateIso: daysAheadIso(21), time: "morning", serviceId: "orthodontics-aligners" },
  },
  {
    id: "pat_liam-fitzgerald",
    clinicId: CLINIC_ID,
    fullName: "Liam Fitzgerald",
    email: "liam.fitz@example.com",
    phone: "+15550561298",
    patientType: "existing",
    primaryDoctorId: "rehan-khalid",
    patientSince: daysAgoIso(150),
    lastVisit: daysAgoIso(2),
  },
  {
    id: "pat_amara-okafor",
    clinicId: CLINIC_ID,
    fullName: "Amara Okafor",
    email: "amara.okafor@example.com",
    phone: "+15550649912",
    patientType: "new",
    primaryDoctorId: "sana-malik",
    patientSince: daysAgoIso(3),
    nextAppointment: { dateIso: daysAheadIso(1), time: "afternoon", serviceId: "kids-dentistry" },
  },
  {
    id: "pat_hassan-raza",
    clinicId: CLINIC_ID,
    fullName: "Hassan Raza",
    email: "hassan.raza@example.com",
    phone: "+15550722187",
    patientType: "existing",
    primaryDoctorId: "nadia-farooqi",
    patientSince: daysAgoIso(730),
    lastVisit: daysAgoIso(310),
    attentionNote: "Insurance on file expires this month",
  },
  {
    id: "pat_ines-moreira",
    clinicId: CLINIC_ID,
    fullName: "Ines Moreira",
    email: "ines.moreira@example.com",
    phone: "+15550834456",
    patientType: "existing",
    primaryDoctorId: "rehan-khalid",
    patientSince: daysAgoIso(95),
    lastVisit: daysAgoIso(20),
    nextAppointment: { dateIso: daysAheadIso(45), time: "evening", serviceId: "root-canal" },
  },
  {
    id: "pat_noah-bennett",
    clinicId: CLINIC_ID,
    fullName: "Noah Bennett",
    email: "noah.bennett@example.com",
    phone: "+15550915523",
    patientType: "existing",
    primaryDoctorId: "sana-malik",
    patientSince: daysAgoIso(340),
    lastVisit: daysAgoIso(90),
  },
  {
    id: "pat_farah-siddiqui",
    clinicId: CLINIC_ID,
    fullName: "Farah Siddiqui",
    email: "farah.siddiqui@example.com",
    phone: "+15551027761",
    patientType: "existing",
    primaryDoctorId: "nadia-farooqi",
    patientSince: daysAgoIso(1200),
    lastVisit: daysAgoIso(8),
    nextAppointment: { dateIso: daysAheadIso(2), time: "morning", serviceId: "checkups-cleanings" },
  },
  {
    id: "pat_ethan-walsh",
    clinicId: CLINIC_ID,
    fullName: "Ethan Walsh",
    email: "ethan.walsh@example.com",
    phone: "+15551148832",
    patientType: "existing",
    primaryDoctorId: "rehan-khalid",
    patientSince: daysAgoIso(60),
    lastVisit: daysAgoIso(60),
    attentionNote: "Missed last appointment",
  },
  {
    id: "pat_layla-ahmed",
    clinicId: CLINIC_ID,
    fullName: "Layla Ahmed",
    email: "layla.ahmed@example.com",
    phone: "+15551253398",
    patientType: "existing",
    primaryDoctorId: "sana-malik",
    patientSince: daysAgoIso(500),
    lastVisit: daysAgoIso(120),
    nextAppointment: { dateIso: daysAheadIso(10), time: "afternoon", serviceId: "kids-dentistry" },
  },
  {
    id: "pat_marcus-webb",
    clinicId: CLINIC_ID,
    fullName: "Marcus Webb",
    email: "marcus.webb@example.com",
    phone: "+15551369914",
    patientType: "existing",
    primaryDoctorId: "nadia-farooqi",
    patientSince: daysAgoIso(880),
    lastVisit: daysAgoIso(180),
  },
  {
    id: "pat_sofia-almeida",
    clinicId: CLINIC_ID,
    fullName: "Sofia Almeida",
    email: "sofia.almeida@example.com",
    phone: "+15551477765",
    patientType: "new",
    primaryDoctorId: "rehan-khalid",
    patientSince: daysAgoIso(7),
    nextAppointment: { dateIso: daysAheadIso(4), time: "morning", serviceId: "fillings-repairs" },
  },
  {
    id: "pat_ryan-obrien",
    clinicId: CLINIC_ID,
    fullName: "Ryan O'Brien",
    email: "ryan.obrien@example.com",
    phone: "+15551582231",
    patientType: "existing",
    primaryDoctorId: "sana-malik",
    patientSince: daysAgoIso(260),
    lastVisit: daysAgoIso(50),
  },
  {
    id: "pat_grace-lindqvist",
    clinicId: CLINIC_ID,
    fullName: "Grace Lindqvist",
    email: "grace.lindqvist@example.com",
    phone: "+15551698847",
    patientType: "existing",
    primaryDoctorId: "nadia-farooqi",
    patientSince: daysAgoIso(45),
    lastVisit: daysAgoIso(45),
    nextAppointment: { dateIso: daysAheadIso(14), time: "evening", serviceId: "cosmetic-whitening" },
  },
  {
    id: "pat_tariq-mahmood",
    clinicId: CLINIC_ID,
    fullName: "Tariq Mahmood",
    email: "tariq.mahmood@example.com",
    phone: "+15551703312",
    patientType: "existing",
    primaryDoctorId: "rehan-khalid",
    patientSince: daysAgoIso(700),
    lastVisit: daysAgoIso(400),
    attentionNote: "Hasn't been seen in over a year",
  },
  {
    id: "pat_isabelle-marchand",
    clinicId: CLINIC_ID,
    fullName: "Isabelle Marchand",
    email: "isabelle.marchand@example.com",
    phone: "+15551814476",
    patientType: "existing",
    primaryDoctorId: "sana-malik",
    patientSince: daysAgoIso(320),
    lastVisit: daysAgoIso(30),
    nextAppointment: { dateIso: daysAheadIso(28), time: "afternoon", serviceId: "orthodontics-aligners" },
  },
  {
    id: "pat_victor-nakamura",
    clinicId: CLINIC_ID,
    fullName: "Victor Nakamura",
    email: "victor.nakamura@example.com",
    phone: "+15551925591",
    patientType: "existing",
    primaryDoctorId: "nadia-farooqi",
    patientSince: daysAgoIso(190),
    lastVisit: daysAgoIso(190),
  },
];

export const patientsTable = {
  findAll(): Patient[] {
    return [...PATIENTS];
  },
  findByClinic(clinicId: string): Patient[] {
    return PATIENTS.filter((p) => p.clinicId === clinicId);
  },
  findById(id: string): Patient | undefined {
    return PATIENTS.find((p) => p.id === id);
  },
};
