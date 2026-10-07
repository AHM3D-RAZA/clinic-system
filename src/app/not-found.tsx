import { SiteNotFound } from "@/components/shared/NotFoundPanel/SiteNotFound";
import { notFoundMetadata } from "@/components/shared/NotFoundPanel/notFoundMetadata";

export const generateMetadata = notFoundMetadata;

/** Last-resort 404 for anything no nearer boundary handles (no site chrome). */
export default function RootNotFound() {
  return <SiteNotFound />;
}
