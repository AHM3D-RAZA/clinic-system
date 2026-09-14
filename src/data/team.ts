import type { TeamMember } from "@/types/team";

/**
 * Aster's current roster. A clean, standalone mock data layer — not a
 * reuse of the public-site `Doctor` type in src/content/aster/content.ts,
 * because that type only carries marketing copy (a bio for the website)
 * and has no notion of availability, responsibility, or contact info.
 * The three doctors here share ids/names with that file on purpose, so
 * the two stay recognizably "the same people".
 *
 * Swapping this for a real backend later is a matter of replacing this
 * file's export with a fetch — nothing that imports `teamService`
 * (see src/services/teamService.ts) needs to change.
 */
export const asterTeam: TeamMember[] = [
  {
    id: "nadia-farooqi",
    name: "Dr. Nadia Farooqi",
    initials: "NF",
    group: "doctors",
    role: "Founder · General & Cosmetic",
    responsibility: "Runs the studio and still takes every new-patient consult herself.",
    availability: "inToday",
    swatch: "primary",
  },
  {
    id: "rehan-khalid",
    name: "Dr. Rehan Khalid",
    initials: "RK",
    group: "doctors",
    role: "Endodontics",
    responsibility: "Handles anything past the nerve — root canals made calm, not scary.",
    availability: "offToday",
    availabilityNote: "back Thursday",
    swatch: "secondary",
  },
  {
    id: "sana-malik",
    name: "Dr. Sana Malik",
    initials: "SM",
    group: "doctors",
    role: "Pediatric Care",
    responsibility: "Makes first visits easy for kids who'd rather be anywhere else.",
    availability: "inToday",
    swatch: "accent",
  },
  {
    id: "amara-siddiqui",
    name: "Amara Siddiqui",
    initials: "AS",
    group: "careTeam",
    role: "Dental Hygienist",
    responsibility: "Cleanings and scaling — the thirty minutes patients actually look forward to.",
    availability: "inToday",
    swatch: "secondary",
  },
  {
    id: "bilal-aslam",
    name: "Bilal Aslam",
    initials: "BA",
    group: "careTeam",
    role: "Dental Assistant",
    responsibility: "Preps every room and stands beside Dr. Khalid on the tricky procedures.",
    availability: "inToday",
    swatch: "primary",
  },
  {
    id: "fatima-noor",
    name: "Fatima Noor",
    initials: "FN",
    group: "careTeam",
    role: "Dental Hygienist",
    responsibility: "Usually chairside on the hygiene side; out on leave for now.",
    availability: "onLeave",
    availabilityNote: "back in a few weeks",
    swatch: "accent",
  },
  {
    id: "usman-tariq",
    name: "Usman Tariq",
    initials: "UT",
    group: "careTeam",
    role: "Dental Assistant · Sterilization Lead",
    responsibility: "Keeps every instrument sterile and every tray ready before you sit down.",
    availability: "offToday",
    availabilityNote: "back tomorrow",
    swatch: "secondary",
  },
  {
    id: "zoya-ahmed",
    name: "Zoya Ahmed",
    initials: "ZA",
    group: "frontOfHouse",
    role: "Front Desk Coordinator",
    responsibility: "First voice on the phone and first face you see walking in.",
    availability: "inToday",
    contact: { label: "Ext. 101", href: "tel:+15551234567" },
    swatch: "primary",
  },
  {
    id: "hamza-riaz",
    name: "Hamza Riaz",
    initials: "HR",
    group: "frontOfHouse",
    role: "Office Manager",
    responsibility: "Keeps the lights on — scheduling, billing, and ordering supplies.",
    availability: "inToday",
    contact: { label: "Ext. 102", href: "tel:+15551234567" },
    swatch: "accent",
  },
  {
    id: "mariam-yousaf",
    name: "Mariam Yousaf",
    initials: "MY",
    group: "frontOfHouse",
    role: "Patient Care Coordinator",
    responsibility: "Follows up after visits and helps patients navigate insurance questions.",
    availability: "offToday",
    availabilityNote: "back Monday",
    contact: { label: "hello@asterdental.studio", href: "mailto:hello@asterdental.studio" },
    swatch: "secondary",
  },
];
