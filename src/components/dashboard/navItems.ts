import type { DashboardNavItem } from "@/types/dashboard";

/**
 * The dashboard's full intended navigation. Only Overview is real —
 * everything else is a structural placeholder for the next three
 * developers' modules (see project brief). `implemented: false` items
 * render as honest "soon" entries, never as links to routes that
 * don't exist.
 */
export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { id: "overview", label: "Overview", href: "/dashboard", icon: "overview", implemented: true },
  { id: "patients", label: "Patients", href: "/dashboard/patients", icon: "patients", implemented: false },
  { id: "bookings", label: "Bookings", href: "/dashboard/bookings", icon: "bookings", implemented: false },
  { id: "appointments", label: "Appointments", href: "/dashboard/appointments", icon: "appointments", implemented: false },
  { id: "team", label: "Team", href: "/dashboard/team", icon: "team", implemented: false },
  { id: "settings", label: "Settings", href: "/dashboard/settings", icon: "settings", implemented: false },
];
