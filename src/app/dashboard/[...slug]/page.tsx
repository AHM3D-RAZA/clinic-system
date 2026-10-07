import { notFound } from "next/navigation";

/**
 * Unmatched /dashboard/... URLs land here so the 404 renders inside the
 * dashboard shell (nav intact). See ../not-found.tsx.
 */
export default function DashboardUnknownRoute() {
  notFound();
}
