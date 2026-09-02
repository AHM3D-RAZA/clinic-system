import type { DashboardNavIconKey } from "@/types/dashboard";

interface NavIconProps {
  icon: DashboardNavIconKey;
}

/**
 * One small hand-drawn-feeling glyph per nav destination. Deliberately
 * simple line icons (matches the site's line-art tooth mark in
 * ClinicNavigation) rather than a generic icon-font/library — keeps
 * the dashboard visually part of the same product.
 */
export function NavIcon({ icon }: NavIconProps) {
  const path = ICON_PATHS[icon];
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICON_PATHS: Record<DashboardNavIconKey, string> = {
  overview: "M4 12 12 5l8 7M6 10v9h12v-9M10 19v-5h4v5",
  patients: "M9 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3 19c.6-3 2.8-5 6-5s5.4 2 6 5M15 19c.4-2 1.6-3.4 3.5-3.8",
  bookings: "M5 5h14v15H5V5Zm0 5h14M9 3v4M15 3v4M8 14h3M8 17h6",
  appointments: "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
  team: "M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 19c.6-2.8 2.7-4.6 6-4.6s5.4 1.8 6 4.6M14 19c.5-2.3 2.2-3.8 4.8-3.8s4.3 1.5 4.8 3.8",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8.4-3a7.9 7.9 0 0 0-.2-1.8l2-1.5-2-3.4-2.3 1a8 8 0 0 0-3.1-1.8L14.4 2H9.6l-.4 2.5a8 8 0 0 0-3.1 1.8l-2.3-1-2 3.4 2 1.5A7.9 7.9 0 0 0 3.6 12c0 .6.1 1.2.2 1.8l-2 1.5 2 3.4 2.3-1a8 8 0 0 0 3.1 1.8l.4 2.5h4.8l.4-2.5a8 8 0 0 0 3.1-1.8l2.3 1 2-3.4-2-1.5c.1-.6.2-1.2.2-1.8Z",
};
