import { clinicService } from "@/services/clinicService";
import { DEFAULT_CLINIC_ID } from "@/config/clinics";
import { Hero } from "@/components/marketing/Hero";
import { MarqueeStrip } from "@/components/marketing/MarqueeStrip";
import { IntroSection } from "@/components/marketing/IntroSection";
import { ServiceExplorer } from "@/components/marketing/ServiceExplorer";
import { DoctorSection } from "@/components/marketing/DoctorSection";
import { ClinicGallery } from "@/components/marketing/ClinicGallery";
import { QuoteBand } from "@/components/marketing/QuoteBand";
import { AppointmentCTA } from "@/components/marketing/AppointmentCTA";
import { AsterReceptionist } from "@/components/assistant/AsterReceptionist";

export default async function HomePage() {
  const content = await clinicService.getClinicContent(DEFAULT_CLINIC_ID);

  return (
    <>
      <Hero eyebrow={content.clinic.eyebrow} copy={content.heroCopy} />
      <MarqueeStrip items={content.marqueeItems} />
      <IntroSection
        headline="We built the studio we'd want to visit."
        copy={content.introCopy}
        stats={content.stats}
      />
      <ServiceExplorer services={content.services} />
      <DoctorSection doctors={content.doctors} />
      <ClinicGallery items={content.gallery} />
      <QuoteBand testimonial={content.testimonial} />
      <AppointmentCTA clinic={content.clinic} />
      <AsterReceptionist
        flow={content.assistantFlow}
        knowledge={content.clinicKnowledge}
        clinicShortName={content.clinic.shortName}
      />
    </>
  );
}
