/**
 * Sheen Text Animation Controller
 *
 * Animates a left-to-right colour sweep on hover for elements
 * with the [data-sheen-text] attribute.
 */

import {
  type SheenState,
  splitIntoChars,
  startAnimation,
  stopAnimation,
  createState,
} from './sheen-core';

const SHEEN_SELECTOR = '[data-sheen-text]';

// Track state for each sheen element
const sheenStates = new WeakMap<HTMLElement, SheenState>();

/**
 * Initialise a single sheen element
 */
function initElement(element: HTMLElement): void {
  // Skip if already initialised
  if (sheenStates.has(element)) return;

  const text = element.dataset.sheenText;
  if (!text) return;

  const interval = parseInt(element.dataset.sheenInterval ?? '15', 10);
  const spread = parseInt(element.dataset.sheenSpread ?? '2', 10);
  const chars = splitIntoChars(element, text);

  const state = createState(chars, interval, spread);
  sheenStates.set(element, state);

  element.addEventListener('mouseenter', () => {
    const s = sheenStates.get(element);
    if (s) startAnimation(s);
  });

  element.addEventListener('mouseleave', () => {
    const s = sheenStates.get(element);
    if (s) stopAnimation(s);
  });
}

/**
 * Initialise all sheen elements on the page
 */
function init(): void {
  const elements = document.querySelectorAll<HTMLElement>(SHEEN_SELECTOR);
  elements.forEach(initElement);
}

// Initialise on load and after Astro page transitions
init();
document.addEventListener('astro:after-swap', init);
