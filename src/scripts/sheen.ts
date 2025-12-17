/**
 * Sheen Text Animation Controller
 *
 * Animates a left-to-right colour sweep on hover for elements
 * with the [data-sheen-ready] attribute (pre-split at build time)
 * or [data-sheen-text] attribute (split at runtime).
 */

import {
  type SheenState,
  CHAR_CLASS,
  splitIntoChars,
  startAnimation,
  stopAnimation,
  createState,
} from './sheen-core';

// Elements pre-split at build time (preferred)
const SHEEN_READY_SELECTOR = '[data-sheen-ready]';
// Legacy: elements that need runtime splitting
const SHEEN_TEXT_SELECTOR = '[data-sheen-text]';

// Track state for each sheen element
const sheenStates = new WeakMap<HTMLElement, SheenState>();

/**
 * Collect existing character spans from a pre-split element
 */
const collectChars = (element: HTMLElement): HTMLSpanElement[] =>
  Array.from(element.querySelectorAll<HTMLSpanElement>(`.${CHAR_CLASS}`));

/**
 * Initialise a single sheen element
 */
const initElement = (element: HTMLElement): void => {
  // Skip if already initialised
  if (sheenStates.has(element)) {
    return;
  }

  const interval = parseInt(element.dataset.sheenInterval ?? '15', 10);
  const spread = parseInt(element.dataset.sheenSpread ?? '2', 10);

  // Use pre-split chars if available, otherwise split at runtime
  const isPreSplit = element.hasAttribute('data-sheen-ready');
  let chars: HTMLSpanElement[];

  if (isPreSplit) {
    chars = collectChars(element);
  } else {
    const text = element.dataset.sheenText;

    if (!text) {
      return;
    }

    chars = splitIntoChars(element, text);
  }

  if (chars.length === 0) {
    return;
  }

  const state = createState(chars, interval, spread);
  sheenStates.set(element, state);

  element.addEventListener('mouseenter', () => {
    const s = sheenStates.get(element);

    if (s) {
      startAnimation(s);
    }
  });

  element.addEventListener('mouseleave', () => {
    const s = sheenStates.get(element);

    if (s) {
      stopAnimation(s);
    }
  });
};

/**
 * Initialise all sheen elements on the page
 */
const init = (): void => {
  const elements = document.querySelectorAll<HTMLElement>(
    `${SHEEN_READY_SELECTOR}, ${SHEEN_TEXT_SELECTOR}`
  );
  elements.forEach(initElement);
};

// Initialise on load and after Astro page transitions
init();
document.addEventListener('astro:after-swap', init);
