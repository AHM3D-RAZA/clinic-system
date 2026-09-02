import type { Metadata } from "next";
import type { ReactNode } from "react";
import { clinicService } from "@/services/clinicService";
import { DEFAULT_CLINIC_ID } from "@/config/clinics";
import { themeToCssVariables } from "@/lib/theme";
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
 * Shared across EVERY surface — public site and dashboard alike: the
 * html/body shell, the active clinic's theme as CSS vars, fonts, and
 * the grain texture. Deliberately does NOT render nav/footer chrome —
 * the public site's chrome lives in `(site)/layout.tsx`, the
 * dashboard's in `dashboard/layout.tsx`, since the two surfaces need
 * different chrome around the same theme.
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
        {children}
      </body>
    </html>
  );
}
