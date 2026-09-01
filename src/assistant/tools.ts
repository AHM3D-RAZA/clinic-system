import type { ClinicConfig } from "@/types/clinic";
import type { ClinicKnowledgeEntry, AssistantBookingRules } from "@/types/assistant";
import type { ServiceOffering } from "@/types/content";
import type { BookingRequest, CreateBookingInput } from "@/types/booking";
import { bookingService } from "@/services/bookingService";

/**
 * The assistant's entire "reach" into the application — deliberately
 * small and named like an API a future AI agent would call, not like
 * internal implementation details it could reach around. A model
 * should never get direct access to services/bookingService or raw
 * clinic config; it gets these functions, and nothing else.
 *
 * Every function here is real and tested — not a stub — even though
 * the current UI (AsterReceptionist) only calls a couple of them
 * directly today. That's the point: the tool boundary is ready before
 * the caller that needs the rest of it exists.
 */

export function getClinicInformation(clinic: ClinicConfig) {
  return {
    name: clinic.name,
    phone: clinic.contact.phone,
    email: clinic.contact.email,
    address: clinic.contact.address,
    hours: clinic.contact.hours,
  };
}

export function getBookingRules(clinic: ClinicConfig): AssistantBookingRules {
  return {
    feeMode: clinic.bookingSettings.feeMode,
    automationMode: clinic.bookingSettings.automationMode,
    // Static for now — a real rules engine would live here once a
    // clinic can configure this, not in the assistant.
    cancellationNotice: "24 hours' notice appreciated",
  };
}

/**
 * Best-effort keyword match from free text to one known service. Simple
 * on purpose: this is the kind of lookup a real agent would still want
 * as a controlled tool (rather than inventing a service name), even
 * once it's smart enough to parse messier input than this does.
 */
export function findService(services: ServiceOffering[], query: string): ServiceOffering | undefined {
  const needle = query.trim().toLowerCase();
  if (!needle) return undefined;
  return services.find((service) =>
    [service.name, service.tag, service.accentWord].some((field) => field.toLowerCase().includes(needle)),
  );
}

export function getServiceInformation(services: ServiceOffering[], serviceId: string): ServiceOffering | undefined {
  return services.find((service) => service.id === serviceId);
}

/**
 * Keyword search over a clinic's knowledge base. Scores by number of
 * matched terms so "parking" and "where do I park" both find the same
 * entry. This is the exact function a future RAG implementation would
 * replace with a real vector search — everything that calls it only
 * needs a ranked list of entries back, not to know how the ranking
 * happened.
 */
export function searchClinicKnowledge(
  entries: ClinicKnowledgeEntry[],
  query: string,
): ClinicKnowledgeEntry[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);
  if (terms.length === 0) return [];

  const scored = entries
    .map((entry) => {
      const haystack = [entry.question, entry.answer, ...entry.tags].join(" ").toLowerCase();
      const score = terms.filter((term) => haystack.includes(term)).length;
      return { entry, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((s) => s.entry);
}

/**
 * Creates a real BookingRequest through the real service layer — the
 * assistant never touches bookingService or the mock data table
 * directly. Not called by the current deterministic flow (which hands
 * off to the full booking form instead, so a human always reviews
 * fee/consent/etc. before anything is created) but implemented and
 * tested now so a future flow branch — or a real agent — can create a
 * booking request without any new plumbing.
 */
export async function createBookingRequestTool(input: CreateBookingInput): Promise<BookingRequest> {
  return bookingService.create(input);
}
