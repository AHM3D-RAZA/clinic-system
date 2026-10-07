import type { ClinicContentBundle } from "@/types/content";
import { asterClinicConfig } from "./clinic";
import {
  asterDoctors,
  asterGallery,
  asterHeroCopy,
  asterIntroCopy,
  asterMarqueeItems,
  asterNav,
  asterServices,
  asterStats,
  asterTestimonial,
} from "./content";
import { asterAssistantFlow } from "./assistant-flow";
import { asterKnowledge } from "./knowledge";

export const asterContentBundle: ClinicContentBundle = {
  clinic: asterClinicConfig,
  nav: asterNav,
  heroCopy: asterHeroCopy,
  marqueeItems: asterMarqueeItems,
  introCopy: asterIntroCopy,
  services: asterServices,
  doctors: asterDoctors,
  gallery: asterGallery,
  testimonial: asterTestimonial,
  stats: asterStats,
  assistantFlow: asterAssistantFlow,
  clinicKnowledge: asterKnowledge,
};
