import { notFound } from "next/navigation";

/**
 * Unmatched public URLs land here so the 404 renders inside the site
 * layout (nav + footer) instead of as a bare page. See ../not-found.tsx.
 */
export default function SiteUnknownRoute() {
  notFound();
}
