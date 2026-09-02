import type { ReactNode } from "react";
import { clinicService } from "@/services/clinicService";
import { DEFAULT_CLINIC_ID } from "@/config/clinics";
import { ClinicNavigation } from "@/components/layout/ClinicNavigation";
import { Footer } from "@/components/layout/Footer";

/**
 * Chrome for the PUBLIC site only (marketing home + booking flow). The
 * dashboard lives outside this route group (`src/app/dashboard/`) and
 * has its own shell — it should never inherit the public nav/footer.
 * Kept as a thin wrapper: it only resolves clinic content and hands it
 * to the two chrome components, same as the rest of the app.
 */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const content = await clinicService.getClinicContent(DEFAULT_CLINIC_ID);
  const { clinic } = content;

  return (
    <>
      <ClinicNavigation clinic={clinic} nav={content.nav} />
      {children}
      <Footer clinic={clinic} nav={content.nav} />
    </>
  );
}
