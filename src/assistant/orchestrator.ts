import type { AssistantFlow, AssistantStep, ClinicKnowledgeEntry } from "@/types/assistant";

/**
 * Everything about walking the deterministic conversation graph lives
 * here, not in the presentation component — the UI just renders
 * whatever step this returns and reports back which option the patient
 * picked. Framework-agnostic on purpose (no React) so it's testable in
 * isolation and reusable if the UI is ever rebuilt.
 */

const FALLBACK_STEP_KEY = "start";

export function getStep(flow: AssistantFlow, stepKey: string): AssistantStep {
  return flow[stepKey] ?? flow[FALLBACK_STEP_KEY];
}

/**
 * Resolves a step's displayed text. Steps author their own `text`
 * directly (greetings, branching questions) OR point at a
 * `knowledgeId` and let the clinic's knowledge base supply the answer
 * — the same separation the future RAG system is meant to slot into,
 * demonstrated with today's plain array instead of a vector store.
 */
export function resolveStepText(step: AssistantStep, knowledge: ClinicKnowledgeEntry[]): string {
  if (step.text) return step.text;
  if (step.knowledgeId) {
    const entry = knowledge.find((k) => k.id === step.knowledgeId);
    if (entry) return entry.answer;
  }
  return "Let me get someone from the team to help with that — try the contact details below.";
}

export type AssistantOptionOutcome =
  | { type: "navigate"; nextStepKey: string }
  | { type: "external"; href: string; isImmediate: boolean };

/**
 * Decides what should happen when a patient picks an option — pure
 * decision, no side effects. The caller (the UI component) is
 * responsible for actually navigating/redirecting; this just tells it
 * what kind of outcome it is; `isImmediate` flags tel:/mailto: links,
 * which should replace the page rather than go through client-side
 * routing.
 */
export function resolveOptionOutcome(option: { next?: string; href?: string }): AssistantOptionOutcome {
  if (option.href) {
    const isImmediate = option.href.startsWith("tel:") || option.href.startsWith("mailto:");
    return { type: "external", href: option.href, isImmediate };
  }
  return { type: "navigate", nextStepKey: option.next ?? FALLBACK_STEP_KEY };
}
