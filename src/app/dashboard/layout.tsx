import type { Metadata } from "next";
import type { ReactNode } from "react";
import { clinicService } from "@/services/clinicService";
import { DEFAULT_CLINIC_ID } from "@/config/clinics";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export async function generateMetadata(): Promise<Metadata> {
  const { clinic } = await clinicService.getClinicContent(DEFAULT_CLINIC_ID);
  return {
    title: `Dashboard — ${clinic.name}`,
    description: `Internal workspace for ${clinic.name} staff.`,
  };
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { clinic } = await clinicService.getClinicContent(DEFAULT_CLINIC_ID);
  return <DashboardShell clinic={clinic}>{children}</DashboardShell>;
}
