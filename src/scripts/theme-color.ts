/**
 * Theme Colour Utility
 *
 * Updates the theme-color meta tag to match the current theme.
 * Controls Safari's browser chrome colour.
 */

import { THEME_COLOURS } from '../lib/theme';

export function setThemeColor(theme: string): void {
  const colours = THEME_COLOURS[theme as keyof typeof THEME_COLOURS];
  if (!colours) return;
  const meta = document.querySelector<HTMLMetaElement>('meta[data-theme-color]');
  if (meta) meta.content = colours.bg;
}
