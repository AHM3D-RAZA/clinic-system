import type { ClinicConfig } from "./clinic";

/**
 * A single FAQ-style fact about a clinic — hours, parking, policies,
 * prep/aftercare instructions, etc. Kept as plain structured data,
 * completely separate from both the conversation flow (below) and the
 * UI, so a future RAG/vector-search implementation can replace "look
 * this up in an array" with "look this up in a knowledge base" without
 * touching the flow graph or the component that renders it.
 */
export interface ClinicKnowledgeEntry {
  id: string;
  question: string;
  answer: string;
  tags: string[];
}

export interface AssistantOption {
  label: string;
  /** Advances to another step in the same AssistantFlow. */
  next?: string;
  /** Hands off to a real action — booking page, tel:, mailto:. */
  href?: string;
}

export interface AssistantStep {
  /** Inline text for steps authored directly in the flow (greetings, branching prompts). */
  text?: string;
  /** For steps that ARE a knowledge answer — resolved at render time via lib/knowledge lookup, not duplicated here. */
  knowledgeId?: string;
  options: AssistantOption[];
}

/**
 * A deterministic conversation graph, keyed by step id. This is the
 * entire "brain" of the current assistant: no model, no inference —
 * just a fixed set of steps a patient clicks through. It's exactly the
 * shape an actual LLM-backed agent's *scripted fallback* would keep
 * using for questions that don't need reasoning.
 */
export type AssistantFlow = Record<string, AssistantStep>;

/**
 * A minimal, deterministic summary of what a clinic allows the
 * assistant to promise a patient — used by getBookingRules() so the
 * assistant never states booking policy that isn't actually configured.
 */
export interface AssistantBookingRules {
  feeMode: ClinicConfig["bookingSettings"]["feeMode"];
  automationMode: ClinicConfig["bookingSettings"]["automationMode"];
  cancellationNotice: string;
}

/**
 * NOT IMPLEMENTED. This is the seam a real LLM-backed agent would plug
 * into later: given the conversation so far and the deterministic tools
 * in assistant/tools.ts, it would decide what to say and which tool(s)
 * to call, instead of a human having authored every branch by hand.
 * Declaring the shape now (without an implementation) means the
 * orchestrator and UI can eventually be handed a real provider without
 * a rewrite — only this interface needs a concrete implementation.
 */
export interface AssistantProvider {
  generateReply(input: {
    history: { role: "patient" | "assistant"; text: string }[];
    knowledge: ClinicKnowledgeEntry[];
  }): Promise<{
    text: string;
    toolCalls?: { name: string; args: unknown }[];
  }>;
}
