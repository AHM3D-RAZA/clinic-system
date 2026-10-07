import { NotFoundPanel } from "@/components/shared/NotFoundPanel";
import { DASHBOARD_NOT_FOUND } from "@/components/shared/NotFoundPanel/notFoundCopy";
import { notFoundMetadata } from "@/components/shared/NotFoundPanel/notFoundMetadata";

export const generateMetadata = notFoundMetadata;

/** 404 inside the dashboard: rendered within DashboardShell, nav intact. */
export default function DashboardNotFound() {
  return <NotFoundPanel {...DASHBOARD_NOT_FOUND} tone="dashboard" />;
}
