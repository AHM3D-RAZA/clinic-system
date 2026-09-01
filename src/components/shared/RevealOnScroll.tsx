"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  id?: string;
  /** HTML element to render as. Defaults to a plain div. */
  as?: "div" | "section";
}

/**
 * Fades + lifts its children into place the first time they scroll into
 * view. Pure presentation — no content or theme knowledge — so it can
 * wrap any section on the site.
 */
export function RevealOnScroll({ children, className, id, as = "div" }: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isIn, setIsIn] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      // No observer support: reveal immediately, but asynchronously so
      // this doesn't count as a synchronous setState-in-effect.
      const timer = setTimeout(() => setIsIn(true), 0);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIn(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Tag = as;
  return (
    <Tag id={id} ref={ref as never} className={cn("reveal", isIn && "isIn", className)}>
      {children}
    </Tag>
  );
}
