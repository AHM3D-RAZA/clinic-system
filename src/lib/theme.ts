import type { ClinicThemeTokens } from "@/types/clinic";
import type { SwatchKey } from "@/types/content";
import type { CSSProperties } from "react";

/**
 * Flattens a clinic's theme tokens into CSS custom properties. The
 * result is meant to be spread onto a top-level element's `style` prop
 * (see app/layout.tsx) so every component below it can read
 * `var(--color-primary)`, `var(--font-display)`, etc. — regardless of
 * which clinic is active. This is the entire "re-theme without
 * rewriting components" mechanism.
 */
export function themeToCssVariables(theme: ClinicThemeTokens): CSSProperties {
  return {
    "--color-cream": theme.colors.cream,
    "--color-cream-deep": theme.colors.creamDeep,
    "--color-paper": theme.colors.paper,
    "--color-ink": theme.colors.ink,
    "--color-ink-soft": theme.colors.inkSoft,
    "--color-primary": theme.colors.primary,
    "--color-primary-deep": theme.colors.primaryDeep,
    "--color-secondary": theme.colors.secondary,
    "--color-secondary-deep": theme.colors.secondaryDeep,
    "--color-accent": theme.colors.accent,
    "--color-accent-surface": theme.colors.accentSurface,
    "--color-line": theme.colors.line,
    "--font-display": theme.fonts.display,
    "--font-body": theme.fonts.body,
    "--font-mark": theme.fonts.mark,
    "--radius-lg": theme.radii.lg,
    "--radius-md": theme.radii.md,
    "--radius-sm": theme.radii.sm,
  } as CSSProperties;
}

/**
 * Resolves a content item's named swatch (e.g. a service card's
 * "accent") to the CSS var for the color it should render with. Content
 * never hardcodes a hex value — only a role name — so re-theming a
 * clinic re-colors its content automatically.
 */
export function swatchToCssVar(swatch: SwatchKey): string {
  switch (swatch) {
    case "primary":
      return "var(--color-primary)";
    case "secondary":
      return "var(--color-secondary)";
    case "accent":
      return "var(--color-accent)";
    case "accentSurface":
      return "var(--color-accent-surface)";
    case "ink":
      return "var(--color-ink)";
  }
}

/**
 * A slightly deeper companion tone for gradients (swatch card
 * backgrounds use a two-stop gradient in the original design). Falls
 * back to the base var when no "deep" variant exists for that slot.
 */
export function swatchToCssVarDeep(swatch: SwatchKey): string {
  switch (swatch) {
    case "primary":
      return "var(--color-primary-deep)";
    case "secondary":
      return "var(--color-secondary-deep)";
    default:
      return swatchToCssVar(swatch);
  }
}
