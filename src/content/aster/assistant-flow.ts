import type { AssistantFlow } from "@/types/assistant";

/**
 * Aster's assistant conversation graph. Every "next" option advances to
 * another step here; every "href" option hands off to a real action
 * (the booking page, tel:, mailto:). Steps that answer a factual
 * question point at a `knowledgeId` instead of writing the answer
 * inline — see content/aster/knowledge.ts — so the same fact isn't
 * maintained in two places.
 */
export const asterAssistantFlow: AssistantFlow = {
  start: {
    text: "Hi! Not sure what you need? Tell me what's going on and I'll point you the right way.",
    options: [
      { label: "Just a check-up", next: "checkup" },
      { label: "Something hurts", next: "pain" },
      { label: "A cleaning", next: "cleaning" },
      { label: "Cosmetic question", next: "cosmetic" },
      { label: "Practical questions", next: "practical" },
    ],
  },
  checkup: {
    text: "Easy. Check-ups run about 30 minutes, and we can usually see you within the week.",
    options: [
      { label: "Book a check-up", href: "/book?service=checkups-cleanings" },
      { label: "Ask something else", next: "start" },
    ],
  },
  pain: {
    text: "Sorry to hear that. Tooth pain gets a same-day or next-day slot with us — no need to wait it out.",
    options: [
      { label: "Get an urgent slot", href: "/book?service=fillings-repairs" },
      { label: "Call the studio instead", href: "tel:+15551234567" },
      { label: "Ask something else", next: "start" },
    ],
  },
  cleaning: {
    text: "Most patients come in every six months. If it's been longer than that, no judgment — we'll just take it slow.",
    options: [
      { label: "Book a cleaning", href: "/book?service=checkups-cleanings" },
      { label: "Ask something else", next: "start" },
    ],
  },
  cosmetic: {
    text: "We start every cosmetic question with a real conversation, not a sales pitch — whitening, alignment, whatever's on your mind.",
    options: [
      { label: "How do I prepare for whitening?", next: "whitening-prep" },
      { label: "Book a consult", href: "/book?service=cosmetic-whitening" },
      { label: "Ask something else", next: "start" },
    ],
  },
  practical: {
    text: "Sure — what do you need to know?",
    options: [
      { label: "Where do I park?", next: "parking" },
      { label: "Do you take insurance?", next: "insurance" },
      { label: "What's your cancellation policy?", next: "cancellation-policy" },
      { label: "What happens at my first visit?", next: "first-visit" },
      { label: "Ask something else", next: "start" },
    ],
  },
  parking: {
    knowledgeId: "parking",
    options: [
      { label: "Back to practical questions", next: "practical" },
      { label: "Ask something else", next: "start" },
    ],
  },
  insurance: {
    knowledgeId: "insurance",
    options: [
      { label: "Back to practical questions", next: "practical" },
      { label: "Ask something else", next: "start" },
    ],
  },
  "cancellation-policy": {
    knowledgeId: "cancellation-policy",
    options: [
      { label: "Back to practical questions", next: "practical" },
      { label: "Ask something else", next: "start" },
    ],
  },
  "first-visit": {
    knowledgeId: "first-visit",
    options: [
      { label: "Book a first visit", href: "/book" },
      { label: "Back to practical questions", next: "practical" },
      { label: "Ask something else", next: "start" },
    ],
  },
  "whitening-prep": {
    knowledgeId: "whitening-prep",
    options: [
      { label: "Book a consult", href: "/book?service=cosmetic-whitening" },
      { label: "Ask something else", next: "start" },
    ],
  },
};
