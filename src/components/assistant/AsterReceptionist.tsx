"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AssistantFlow, ClinicKnowledgeEntry } from "@/types/assistant";
import { getStep, resolveOptionOutcome, resolveStepText } from "@/assistant/orchestrator";
import { cn } from "@/lib/utils";
import { useDismissablePanel } from "@/lib/useDismissablePanel";
import styles from "./AsterReceptionist.module.css";

interface AsterReceptionistProps {
  flow: AssistantFlow;
  knowledge: ClinicKnowledgeEntry[];
  clinicShortName: string;
}

/**
 * The site's "digital receptionist" — presentation only. All
 * conversation-graph logic lives in assistant/orchestrator.ts; this
 * component just renders whatever step that returns and reports back
 * which option the patient picked. Deliberately styled as a front-desk
 * card (torn-tape corner, handwritten label, dashed-chip options)
 * rather than a generic chat bubble/panel — see the project's design
 * language elsewhere on the site (DoctorSection's tape motif, the
 * hero's spinning badge).
 */
export function AsterReceptionist({ flow, knowledge, clinicShortName }: AsterReceptionistProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stepKey, setStepKey] = useState("start");
  const router = useRouter();
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useDismissablePanel({
    isOpen,
    onClose: () => setIsOpen(false),
    initialFocusRef: cardRef,
  });

  const step = getStep(flow, stepKey);
  const stepText = resolveStepText(step, knowledge);

  const handleOption = (option: { next?: string; href?: string }) => {
    const outcome = resolveOptionOutcome(option);
    if (outcome.type === "external") {
      if (outcome.isImmediate) {
        window.location.assign(outcome.href);
      } else {
        setIsOpen(false);
        router.push(outcome.href);
      }
      return;
    }
    setStepKey(outcome.nextStepKey);
  };

  return (
    <div className={styles.receptionist}>
      <div
        className={cn(styles.card, isOpen && styles.isOpen)}
        role="dialog"
        aria-label={`${clinicShortName} front desk`}
        aria-hidden={!isOpen}
        tabIndex={-1}
        ref={cardRef}
      >
        <div className={styles.tape} aria-hidden="true" />
        <div className={styles.header}>
          <span className={styles.headerMark}>the front desk</span>
          <span className={styles.headerSub}>questions, appointments, real answers</span>
        </div>

        <div className={styles.body}>
          <div className={styles.note}>{stepText}</div>
          <div className={styles.options}>
            {step.options.map((option) => (
              <button
                key={option.label}
                type="button"
                className={styles.chip}
                onClick={() => handleOption(option)}
                tabIndex={isOpen ? 0 : -1}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {stepKey !== "start" && (
          <button
            type="button"
            className={styles.restart}
            onClick={() => setStepKey("start")}
            tabIndex={isOpen ? 0 : -1}
          >
            &larr; start over
          </button>
        )}
      </div>

      <button
        type="button"
        className={cn(styles.toggle, isOpen && styles.toggleOpen)}
        aria-label={isOpen ? `Close the ${clinicShortName} front desk` : `Open the ${clinicShortName} front desk`}
        onClick={() => setIsOpen((v) => !v)}
        ref={toggleRef}
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
            <path d="M4 18h16M5 18v-1a7 7 0 0114 0v1M12 5v2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="20.2" r="0.9" fill="currentColor" stroke="none" />
          </svg>
        )}
        <span>Front Desk</span>
      </button>
    </div>
  );
}
