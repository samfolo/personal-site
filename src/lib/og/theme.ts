/**
 * Theme Selection for OG Images
 *
 * Deterministically selects a theme based on title hash.
 * Converts OKLCH values to hex for Satori compatibility.
 */

import { formatHex, oklch } from 'culori';

import type { Theme } from '../../types';

export interface ThemeColours {
  bg: string;
  fg: string;
  muted: string;
  rule: string;
}

/**
 * Convert OKLCH values to hex string.
 * Maps to the OKLCH values in src/styles/tokens/colours.css
 */
function oklchToHex(l: number, c: number, h: number): string {
  const color = oklch({ mode: 'oklch', l, c, h });
  return formatHex(color) ?? '#000000';
}

/**
 * OKLCH values from src/styles/tokens/colours.css
 * Converted to hex at runtime to stay in sync with CSS definitions.
 */
export const THEME_COLOURS: Record<Theme, ThemeColours> = {
  steel: {
    bg: oklchToHex(0.2293, 0.009, 255.6),
    fg: oklchToHex(0.9615, 0.0098, 87.47),
    muted: oklchToHex(0.6334, 0, 0),
    rule: oklchToHex(0.359, 0.0095, 260.72),
  },
  purple: {
    bg: oklchToHex(0.227, 0.0199, 303.08),
    fg: oklchToHex(0.9251, 0.041, 91.72),
    muted: oklchToHex(0.6432, 0.0302, 67.25),
    rule: oklchToHex(0.3369, 0.0255, 304.52),
  },
  charcoal: {
    bg: oklchToHex(0.2478, 0, 0),
    fg: oklchToHex(0.9851, 0, 0),
    muted: oklchToHex(0.6268, 0, 0),
    rule: oklchToHex(0.3715, 0, 0),
  },
  teal: {
    bg: oklchToHex(0.2239, 0.0239, 195.58),
    fg: oklchToHex(0.76, 0.1687, 34.05),
    muted: oklchToHex(0.555, 0.0365, 196.15),
    rule: oklchToHex(0.3243, 0.0378, 195.45),
  },
};

const themes: Theme[] = ['steel', 'purple', 'charcoal', 'teal'];

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
  const index = hash % themes.length;
  return themes[index];
}
