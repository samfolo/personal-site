/**
 * Theme Configuration
 *
 * Single source of truth for theme data.
 * All theme-related constants should be imported from here.
 */

import type {Theme} from "../types";

/**
 * Theme order for cycling and iteration.
 * This determines the order in the theme switcher and cycle button.
 */
export const THEME_ORDER: Theme[] = ["steel", "purple", "charcoal", "teal"];

/**
 * Theme display labels.
 * Uppercase format for consistency; transform at point of use if needed.
 */
export const THEME_LABELS: Record<Theme, string> = {
  steel: "STEEL GREY + WARM CREAM",
  purple: "DARK PURPLE + GOLD",
  charcoal: "WARM CHARCOAL + OFF-WHITE",
  teal: "DARK TEAL + CORAL",
};

/**
 * CSS class names for each theme.
 * Used for adding/removing theme classes from the document.
 */
export const THEME_CLASSES: string[] = THEME_ORDER.map((id) => `theme-${id}`);
