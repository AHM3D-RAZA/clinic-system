import type { Metadata } from "next";
import { clinicService } from "@/services/clinicService";
import { DEFAULT_CLINIC_ID } from "@/config/clinics";
import { BookingExperience } from "@/components/booking/BookingExperience";

export async function generateMetadata(): Promise<Metadata> {
  const { clinic } = await clinicService.getClinicContent(DEFAULT_CLINIC_ID);
  return {
    title: `Book a visit — ${clinic.name}`,
    description: `Request an appointment at ${clinic.name}.`,
  };
}

export default async function BookPage() {
  const content = await clinicService.getClinicContent(DEFAULT_CLINIC_ID);

  return <BookingExperience clinic={content.clinic} services={content.services} />;
}
