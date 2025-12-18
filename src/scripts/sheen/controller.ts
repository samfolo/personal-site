/**
 * Sheen Text Animation Controller
 *
 * Animates a left-to-right colour sweep on hover for elements
 * with the [data-sheen-ready] attribute (pre-split at build time).
 */

import {DOM_SELECTORS} from "../../config/dom";
import {MEDIUM_SHEEN} from "../../config/sheen";

import type {SheenState} from "./core";
import {CHAR_CLASS, startAnimation, stopAnimation, createState} from "./core";

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

  const interval = element.dataset.sheenInterval
    ? parseInt(element.dataset.sheenInterval, 10)
    : MEDIUM_SHEEN.interval;
  const spread = element.dataset.sheenSpread
    ? parseInt(element.dataset.sheenSpread, 10)
    : MEDIUM_SHEEN.spread;

  const chars = collectChars(element);

  if (chars.length === 0) {
    return;
  }

  const state = createState(chars, interval, spread);
  sheenStates.set(element, state);

  element.addEventListener("mouseenter", () => {
    const s = sheenStates.get(element);

    if (s) {
      startAnimation(s);
    }
  });

  element.addEventListener("mouseleave", () => {
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
    DOM_SELECTORS.SHEEN.READY
  );
  elements.forEach(initElement);
};

// Initialise on load and after Astro page transitions
init();
document.addEventListener("astro:after-swap", init);
