/**
 * DOM Selectors and IDs
 *
 * Centralised DOM identifiers to prevent drift between
 * components and scripts that reference the same elements.
 */

export const DOM_IDS = {
  SITE_HEADER: "site-header",
  THEME_NAME: "theme-name",
  FIXED_FOOTER: "fixed-footer",
  BOIDS_CANVAS: "boids-canvas",
  HERO_WORDMARK: "hero-wordmark",
} as const;

/**
 * Data attribute names for use with hasAttribute/setAttribute.
 */
export const DATA_ATTRS = {
  SCROLL_TRIGGER: "data-scroll-trigger",
  SHEEN: {
    READY: "data-sheen-ready",
    LINK: "data-sheen-link",
    HEADING: "data-sheen-heading",
  },
} as const;

/**
 * CSS selectors for use with querySelector/querySelectorAll.
 */
export const DOM_SELECTORS = {
  SCROLL_TRIGGER: `[${DATA_ATTRS.SCROLL_TRIGGER}]`,
  SHEEN: {
    READY: `[${DATA_ATTRS.SHEEN.READY}]`,
  },
  HEADINGS: {
    ANCHOR: ".heading-anchor",
    PROSE: ".prose h1, .prose h2, .prose h3, .prose h4, .prose h5",
  },
  PROSE: {
    LINK: ".prose a:not(.heading-anchor)",
  },
} as const;
