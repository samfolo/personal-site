/**
 * Theme Selection for OG Images
 *
 * Deterministically selects a theme based on title hash.
 */

import {THEME_ORDER} from "../../config/themes";
import type {Theme} from "../../types";

/**
 * Simple hash function for strings.
 * Sums character codes to produce a deterministic number.
 */
const hashString = (str: string): number => {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash += str.charCodeAt(i);
  }

  return hash;
};

/**
 * Get a theme deterministically based on the title.
 * Same title will always produce the same theme.
 */
export const getThemeFromTitle = (title: string): Theme => {
  const hash = hashString(title);
  const index = hash % THEME_ORDER.length;
  return THEME_ORDER[index];
};
