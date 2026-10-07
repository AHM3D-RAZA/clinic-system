import { SiteNotFound } from "@/components/shared/NotFoundPanel/SiteNotFound";
import { notFoundMetadata } from "@/components/shared/NotFoundPanel/notFoundMetadata";

export const generateMetadata = notFoundMetadata;

/** 404 inside the public site, so it keeps the site's nav and footer. */
export default function SiteSectionNotFound() {
  return <SiteNotFound />;
}
