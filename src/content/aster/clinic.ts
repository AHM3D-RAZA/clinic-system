import type { ClinicConfig } from "@/types/clinic";

/**
 * Aster Dental Studio — demonstration tenant #1.
 *
 * This is the ONLY place Aster's name, contact details, and color/font
 * choices are defined. Components never hardcode "Aster" or a hex code;
 * they receive this object (or pieces of it) as props. A second clinic
 * is a second file shaped exactly like this one.
 */
export const asterClinicConfig: ClinicConfig = {
  id: "aster",
  name: "Aster Dental Studio",
  shortName: "Aster",
  tagline: "Dentistry that feels like you.",
  eyebrow: "a little studio on Elm & 4th",
  description:
    "Aster is an independent dental studio built around unhurried care, honest conversations, and a room that doesn't feel like a hospital.",
  contact: {
    phone: "+15551234567",
    email: "hello@asterdental.studio",
    address: "412 Elm Street, Suite B",
    hours: "Tue–Sat, 9am–6pm",
  },
  theme: {
    colors: {
      cream: "#FBEEDD",
      creamDeep: "#F6E0C4",
      paper: "#FFFBF5",
      ink: "#2A2118",
      inkSoft: "#5B4E40",
      primary: "#E8543A",
      primaryDeep: "#BC3B26",
      secondary: "#2F6B57",
      secondaryDeep: "#204A3C",
      accent: "#EDA328",
      accentSurface: "#F3C6B0",
      line: "rgba(42,33,24,0.14)",
    },
    fonts: {
      display: '"Fraunces", serif',
      body: '"Plus Jakarta Sans", sans-serif',
      mark: '"Caveat", cursive',
      stylesheetHref:
        "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Caveat:wght@500;700&display=swap",
    },
    radii: {
      lg: "28px",
      md: "18px",
      sm: "10px",
    },
  },
  bookingSettings: {
    // Future-facing values (see ClinicBookingSettings) — MVP always runs
    // free bookings handled manually by staff.
    feeMode: "free",
    automationMode: "manual",
  },
};
