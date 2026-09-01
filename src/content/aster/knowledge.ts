import type { ClinicKnowledgeEntry } from "@/types/assistant";

/**
 * Aster's knowledge base. Plain structured facts — hours, policies,
 * practical logistics — kept separate from both the conversation flow
 * (assistant-flow.ts) and any UI component. A future RAG-backed
 * assistant replaces how these get found (searchClinicKnowledge's
 * keyword match becomes a vector search) without this file, or
 * anything that reads it, needing to change shape.
 */
export const asterKnowledge: ClinicKnowledgeEntry[] = [
  {
    id: "parking",
    question: "Where do I park?",
    answer:
      "There's free street parking along Elm, and a small lot behind the building — enter from 4th. It fills up by 9am, so a little earlier is safer.",
    tags: ["parking", "car", "lot", "street"],
  },
  {
    id: "insurance",
    question: "Do you take insurance?",
    answer:
      "We work with most major providers and can check your coverage before your visit — just bring your insurance details when you book. We also welcome patients paying out of pocket.",
    tags: ["insurance", "coverage", "payment", "cost"],
  },
  {
    id: "first-visit",
    question: "What should I expect at my first visit?",
    answer:
      "Your first visit runs a little longer — about 45 minutes — so we can actually talk before anything else happens. Expect a full exam, some X-rays if needed, and a plain-language walkthrough of what we find.",
    tags: ["first", "new patient", "expect", "exam"],
  },
  {
    id: "whitening-prep",
    question: "How do I prepare for whitening?",
    answer:
      "Nothing special beforehand — just come with clean teeth. We'll go over sensitivity and aftercare in person, since it varies a lot person to person.",
    tags: ["whitening", "cosmetic", "prep", "prepare"],
  },
  {
    id: "cancellation-policy",
    question: "What's your cancellation policy?",
    answer: "We just ask for 24 hours' notice if you need to reschedule — life happens, we get it.",
    tags: ["cancel", "reschedule", "policy", "notice"],
  },
];
