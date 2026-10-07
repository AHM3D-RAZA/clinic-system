import type { BookingRequest } from "./booking";
import type { Appointment } from "./appointment";

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

/**
 * What the overview page presents. `pending` and `recent` come from
 * booking requests; `today` comes from the appointment schedule — the
 * same source the Appointments timeline uses — so "today" can't differ
 * between the two screens.
 */
export interface DashboardOverviewSummary {
  pending: BookingRequest[];
  today: Appointment[];
  recent: BookingRequest[];
  totalCount: number;
}
