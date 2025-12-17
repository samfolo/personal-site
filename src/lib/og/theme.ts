/**
 * Theme Selection for OG Images
 *
 * Deterministically selects a theme based on title hash.
 */

import type {Theme} from '../../types';

export const THEMES: Theme[] = ['steel', 'purple', 'charcoal', 'teal'];

/**
 * Theme labels for OG images.
 * Uppercase descriptive names shown below the date divider.
 */
export const THEME_LABELS: Record<Theme, string> = {
  steel: 'STEEL GREY + WARM CREAM',
  purple: 'DARK PURPLE + GOLD',
  charcoal: 'WARM CHARCOAL + OFF-WHITE',
  teal: 'DARK TEAL + CORAL',
};

/**
 * Simple hash function for strings.
 * Sums character codes to produce a deterministic number.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash += str.charCodeAt(i);
  }
  return hash;
}

/**
 * Get a theme deterministically based on the title.
 * Same title will always produce the same theme.
 */
export function getThemeFromTitle(title: string): Theme {
  const hash = hashString(title);
  const index = hash % THEMES.length;
  return THEMES[index];
}
