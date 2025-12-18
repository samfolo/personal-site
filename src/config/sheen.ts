/**
 * Sheen Configuration
 *
 * Single source of truth for sheen text animation constants.
 * All sheen-related values should be imported from here.
 */

interface SheenConfig {
  interval: number;
  spread: number;
}

/**
 * Slow, dramatic effect for large headings (hero, page titles).
 */
export const LARGE_SHEEN = {
  interval: 30,
  spread: 2,
} as const satisfies SheenConfig;

/**
 * Faster, wider spread for interactive elements (lists, links, post titles).
 */
export const MEDIUM_SHEEN = {
  interval: 18,
  spread: 3,
} as const satisfies SheenConfig;
