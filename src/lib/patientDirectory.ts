import type { Patient } from "@/types/patient";
import type { Doctor } from "@/types/content";
import type { SwatchKey } from "@/types/content";

/** One alphabetical section of the patient register. */
export interface PatientGroup {
  letter: string;
  patients: Patient[];
}

/**
 * Maps each doctor id to their content swatch, so a patient row's
 * doctor dot can borrow the same color identity the doctor already has
 * on the public site — one visual system, not a second invented one.
 */
export function buildDoctorSwatchLookup(doctors: Doctor[]): Record<string, SwatchKey> {
  return Object.fromEntries(doctors.map((doctor) => [doctor.id, doctor.swatch]));
}

/**
 * Matches a search query against name, email, and phone — the three
 * fields the brief calls out. Phone matching strips non-digits from
 * both sides so "555-019" and "5550192231" both find the same record
 * regardless of how the query or the stored number is punctuated.
 */
export function filterPatients(patients: Patient[], query: string): Patient[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return patients;

  const digitsOnly = trimmed.replace(/\D/g, "");

  return patients.filter((patient) => {
    if (patient.fullName.toLowerCase().includes(trimmed)) return true;
    if (patient.email.toLowerCase().includes(trimmed)) return true;
    if (digitsOnly && patient.phone.replace(/\D/g, "").includes(digitsOnly)) return true;
    return false;
  });
}

/**
 * Groups patients alphabetically by first name of their first name —
 * a register/ledger reading order, not a priority queue. Each group's
 * patients are sorted alongside it so the whole result is ready to
 * render top to bottom.
 */
export function groupPatientsAlphabetically(patients: Patient[]): PatientGroup[] {
  const sorted = [...patients].sort((a, b) => a.fullName.localeCompare(b.fullName));

  const groups: PatientGroup[] = [];
  for (const patient of sorted) {
    const letter = patient.fullName.charAt(0).toUpperCase();
    const currentGroup = groups.at(-1);
    if (currentGroup?.letter === letter) {
      currentGroup.patients.push(patient);
    } else {
      groups.push({ letter, patients: [patient] });
    }
  }
  return groups;
}

/**
 * A quiet, relative description of a patient's last visit — "seen 3
 * weeks ago" reads more like a working register than a raw date would.
 * Takes `todayIso` as a parameter (rather than reading `Date.now()`
 * itself) so it stays a pure, deterministic function to test.
 */
export function describeLastVisit(lastVisit: string | undefined, todayIso: string): string {
  if (!lastVisit) return "No visits yet";

  const days = daysBetween(lastVisit, todayIso);
  if (days <= 0) return "Seen today";
  if (days === 1) return "Seen yesterday";
  if (days < 14) return `Seen ${days} days ago`;
  if (days < 60) return `Seen ${Math.round(days / 7)} weeks ago`;
  if (days < 365) return `Seen ${Math.round(days / 30)} months ago`;
  return "Seen over a year ago";
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(`${fromIso}T00:00:00`).getTime();
  const to = new Date(`${toIso}T00:00:00`).getTime();
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}
