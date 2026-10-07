import type { BookingRequest } from "./booking";

/**
 * A dashboard nav destination. `implemented: false` renders as an
 * honest "coming soon" placeholder — not a link to a route that
 * doesn't exist, and not a fake-functional control. Only Overview is
 * `implemented` in this milestone; Patients/Bookings/Appointments/
 * Team/Settings are structural placeholders for the developers who
 * build those modules next.
 */
export interface DashboardNavItem {
  id: string;
  label: string;
  href: string;
  icon: DashboardNavIconKey;
  implemented: boolean;
}

export type DashboardNavIconKey =
  | "overview"
  | "patients"
  | "bookings"
  | "appointments"
  | "team"
  | "settings";

/** Booking requests grouped the way the overview page needs to present them. */
export interface DashboardOverviewSummary {
  pending: BookingRequest[];
  today: BookingRequest[];
  recent: BookingRequest[];
  totalCount: number;
}
