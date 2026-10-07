import type { Metadata } from "next";
import { clinicService } from "@/services/clinicService";
import { DEFAULT_CLINIC_ID } from "@/config/clinics";

/** Tab title for every not-found page: "Page not found — <clinic>". */
export async function notFoundMetadata(): Promise<Metadata> {
  const { clinic } = await clinicService.getClinicContent(DEFAULT_CLINIC_ID);
  return { title: `Page not found — ${clinic.name}` };
}
