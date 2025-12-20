/**
 * Typography Types
 *
 * Shared types for typography components.
 */

/**
 * Typography colour variants mapping to CSS custom properties.
 */
export type TypographyColor = "fg" | "muted";

/**
 * Common props shared by typography components.
 */
export interface BaseTypographyProps {
  /**
   * HTML element to render.
   */
  tag?: keyof HTMLElementTagNameMap;

  /**
   * Text colour variant.
   */
  color?: TypographyColor;
}
