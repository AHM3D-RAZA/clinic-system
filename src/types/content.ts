/**
 * A treatment/service a clinic offers. Named `ServiceOffering` (not
 * `Service`) to avoid colliding with the application "service layer"
 * (bookingService, clinicService, etc.) elsewhere in the codebase.
 */
export interface ServiceOffering {
  id: string;
  name: string;
  tag: string;
  description: string;
  /** short hover-peek word, e.g. "fresh start" */
  accentWord: string;
  /** key into the swatch palette used for the hover-peek card / index number tint */
  swatch: SwatchKey;
}

export interface Doctor {
  id: string;
  name: string;
  role: string;
  bio: string;
  initials: string;
  swatch: SwatchKey;
}

export interface GalleryItem {
  id: string;
  label: string;
  swatch: SwatchKey;
}

export interface Testimonial {
  quote: string;
  attribution: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface StatItem {
  value: string;
  label: string;
}

/** Structured hero copy so components never have to parse/split a tagline string. */
export interface HeroCopy {
  headlineLines: string[];
  /** short emphasized closing word/phrase, rendered in italic accent color */
  emphasis: string;
  lede: string;
  /** small rotating badge text, e.g. "Open Tue–Sat" */
  badge: string;
}

/**
 * Named palette slots a clinic's theme provides values for. Content
 * (services, doctors, gallery tiles) reference these by name instead of
 * hardcoding colors, so re-theming a clinic re-colors its content too.
 */
export type SwatchKey =
  | "primary"
  | "secondary"
  | "accent"
  | "accentSurface"
  | "ink";

/** Everything a clinic's public site + booking flow needs to render. */
export interface ClinicContentBundle {
  clinic: import("./clinic").ClinicConfig;
  nav: NavLink[];
  heroCopy: HeroCopy;
  marqueeItems: string[];
  introCopy: string;
  services: ServiceOffering[];
  doctors: Doctor[];
  gallery: GalleryItem[];
  testimonial: Testimonial;
  stats: StatItem[];
  assistantFlow: import("./assistant").AssistantFlow;
  clinicKnowledge: import("./assistant").ClinicKnowledgeEntry[];
}
