import type { Metadata } from "next";
import type { ReactNode } from "react";
import { clinicService } from "@/services/clinicService";
import { DEFAULT_CLINIC_ID } from "@/config/clinics";
import { themeToCssVariables } from "@/lib/theme";
import { ClinicNavigation } from "@/components/layout/ClinicNavigation";
import { Footer } from "@/components/layout/Footer";
import { GrainOverlay } from "@/components/shared/GrainOverlay";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { clinic } = await clinicService.getClinicContent(DEFAULT_CLINIC_ID);
  return {
    title: `${clinic.name} — ${clinic.tagline}`,
    description: clinic.description,
  };
}

/**
 * Everything rendered here is shared chrome across every surface
 * (public site, booking flow). It's the one place, per request, that
 * resolves "which clinic is this?" — every page and component below it
 * receives clinic data as props instead of looking it up itself.
 */
export default async function RootLayout({ children }: { children: ReactNode }) {
  const content = await clinicService.getClinicContent(DEFAULT_CLINIC_ID);
  const { clinic } = content;
  const themeVars = themeToCssVariables(clinic.theme);

  return (
    <html lang="en" data-scroll-behavior="smooth" style={themeVars as React.CSSProperties}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={clinic.theme.fonts.stylesheetHref} />
      </head>
      <body>
        <GrainOverlay />
        <ClinicNavigation clinic={clinic} nav={content.nav} />
        {children}
        <Footer clinic={clinic} nav={content.nav} />
      </body>
    </html>
  );
}
