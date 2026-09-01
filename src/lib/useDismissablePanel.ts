"use client";

import { useEffect, useRef } from "react";

interface UseDismissablePanelOptions {
  isOpen: boolean;
  onClose: () => void;
  /** Ref to the element that should receive focus once the panel opens. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Standard overlay accessibility behavior, shared by the mobile nav
 * drawer and the assistant panel so neither has to reinvent it:
 *
 * - Escape closes the panel.
 * - Focus moves into the panel when it opens (to `initialFocusRef` if
 *   given, otherwise nothing is forced).
 * - Focus returns to whatever triggered the panel when it closes.
 *
 * This does NOT implement a full focus trap (Tab cycling back around)
 * — both current panels are short, single-column lists where escaping
 * the trap by tabbing past the last item is a reasonable, low-risk
 * simplification for this stage of the product.
 */
export function useDismissablePanel({ isOpen, onClose, initialFocusRef }: UseDismissablePanelOptions) {
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = (document.activeElement as HTMLElement) ?? null;
      initialFocusRef?.current?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }, [isOpen, initialFocusRef]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);
}
