import type { DashboardNavItem } from "@/types/dashboard";

/**
 * The dashboard's full intended navigation. Settings is the only item
 * left as a structural placeholder — `implemented: false` items render
 * as honest "soon" entries, never as links to routes that don't exist.
 */
export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { id: "overview", label: "Overview", href: "/dashboard", icon: "overview", implemented: true },
  { id: "patients", label: "Patients", href: "/dashboard/patients", icon: "patients", implemented: true },
  { id: "bookings", label: "Bookings", href: "/dashboard/bookings", icon: "bookings", implemented: true },
  { id: "appointments", label: "Appointments", href: "/dashboard/appointments", icon: "appointments", implemented: true },
  { id: "team", label: "Team", href: "/dashboard/team", icon: "team", implemented: true },
  { id: "settings", label: "Settings", href: "/dashboard/settings", icon: "settings", implemented: false },
];
