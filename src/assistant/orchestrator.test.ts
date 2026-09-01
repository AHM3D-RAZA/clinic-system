import { describe, expect, it } from "vitest";
import { getStep, resolveOptionOutcome, resolveStepText } from "@/assistant/orchestrator";
import type { AssistantFlow, ClinicKnowledgeEntry } from "@/types/assistant";

const FLOW: AssistantFlow = {
  start: {
    text: "Hi there.",
    options: [{ label: "Parking", next: "parking" }],
  },
  parking: {
    knowledgeId: "parking",
    options: [{ label: "Back", next: "start" }],
  },
  "no-answer": {
    knowledgeId: "missing-entry",
    options: [],
  },
};

const KNOWLEDGE: ClinicKnowledgeEntry[] = [
  { id: "parking", question: "Where do I park?", answer: "Behind the building.", tags: ["parking"] },
];

describe("getStep", () => {
  it("returns the step for a known key", () => {
    expect(getStep(FLOW, "parking")).toBe(FLOW.parking);
  });

  it("falls back to the start step for an unknown key", () => {
    expect(getStep(FLOW, "not-a-real-step")).toBe(FLOW.start);
  });
});

describe("resolveStepText", () => {
  it("returns a step's inline text when present", () => {
    expect(resolveStepText(FLOW.start, KNOWLEDGE)).toBe("Hi there.");
  });

  it("resolves a knowledgeId step from the clinic's knowledge base", () => {
    expect(resolveStepText(FLOW.parking, KNOWLEDGE)).toBe("Behind the building.");
  });

  it("falls back gracefully when a knowledgeId has no matching entry", () => {
    expect(resolveStepText(FLOW["no-answer"], KNOWLEDGE)).toMatch(/get someone from the team/i);
  });
});

describe("resolveOptionOutcome", () => {
  it("treats an option with `next` as a navigation outcome", () => {
    const outcome = resolveOptionOutcome({ next: "parking" });
    expect(outcome).toEqual({ type: "navigate", nextStepKey: "parking" });
  });

  it("falls back to the start step when an option has neither next nor href", () => {
    const outcome = resolveOptionOutcome({});
    expect(outcome).toEqual({ type: "navigate", nextStepKey: "start" });
  });

  it("treats a tel: href as an immediate external outcome", () => {
    const outcome = resolveOptionOutcome({ href: "tel:+15551234567" });
    expect(outcome).toEqual({ type: "external", href: "tel:+15551234567", isImmediate: true });
  });

  it("treats a mailto: href as an immediate external outcome", () => {
    const outcome = resolveOptionOutcome({ href: "mailto:hello@example.com" });
    expect(outcome).toEqual({ type: "external", href: "mailto:hello@example.com", isImmediate: true });
  });

  it("treats an internal href (e.g. /book) as a non-immediate external outcome", () => {
    const outcome = resolveOptionOutcome({ href: "/book?service=checkups-cleanings" });
    expect(outcome).toEqual({
      type: "external",
      href: "/book?service=checkups-cleanings",
      isImmediate: false,
    });
  });
});
