/**
 * A clinic's brand/theme tokens. These become CSS custom properties at
 * runtime (see lib/theme.ts), so every component can reference
 * `var(--color-primary)` etc. without knowing which clinic is active.
 *
 * IMPORTANT: keep this role-based (primary/secondary/accent), not
 * Aster-specific (coral/moss/gold) — a future clinic's "primary" color
 * might be blue, but it's still "primary" to every component.
 */
export interface ClinicThemeTokens {
  colors: {
    cream: string;
    creamDeep: string;
    paper: string;
    ink: string;
    inkSoft: string;
    primary: string;
    primaryDeep: string;
    secondary: string;
    secondaryDeep: string;
    accent: string;
    accentSurface: string;
    line: string;
  };
  fonts: {
    /** CSS font-family value, e.g. `"Fraunces", serif` */
    display: string;
    body: string;
    /** used sparingly for hand-marked annotations */
    mark: string;
    /** <link> href(s) to load the above, comma-free single URL is fine */
    stylesheetHref: string;
  };
  radii: {
    lg: string;
    md: string;
    sm: string;
  };
}

export interface ClinicContact {
  phone: string;
  email: string;
  address: string;
  hours: string;
}

/**
 * Booking behavior a clinic can configure. The MVP only ever runs
 * `feeMode: "free"` and `automationMode: "manual"`, but the shape exists
 * now so the booking service/UI never has to change when those become
 * real choices later.
 */
export interface ClinicBookingSettings {
  feeMode: "free" | "deposit" | "fullPayment";
  automationMode: "automated" | "manual";
}

export interface ClinicConfig {
  /** stable identifier — every domain record (bookings, doctors...) is scoped to this */
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  eyebrow: string;
  description: string;
  contact: ClinicContact;
  theme: ClinicThemeTokens;
  bookingSettings: ClinicBookingSettings;
}
