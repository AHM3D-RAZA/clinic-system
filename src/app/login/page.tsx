import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { clinicService } from "@/services/clinicService";
import { DEFAULT_CLINIC_ID } from "@/config/clinics";
import { getCurrentStaff } from "@/lib/auth/currentStaff";
import { safeNextPath } from "@/lib/auth/safeNextPath";
import { LoginRoom } from "@/components/auth/LoginRoom";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Staff sign in", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const { next: rawNext } = await searchParams;
  const next = safeNextPath(Array.isArray(rawNext) ? rawNext[0] : rawNext);

  // Already signed in → straight to where they were going.
  if (await getCurrentStaff()) redirect(next);

  const { clinic } = await clinicService.getClinicContent(DEFAULT_CLINIC_ID);
  return (
    <LoginRoom clinic={clinic}>
      <LoginForm next={next} />
    </LoginRoom>
  );
}
