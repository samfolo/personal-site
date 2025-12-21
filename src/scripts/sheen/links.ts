/**
 * Sheen Links
 *
 * Applies the sheen text animation effect to all links within prose content.
 */

import {DATA_ATTRS, DOM_SELECTORS} from "../../config/dom";
import {MEDIUM_SHEEN} from "../../config/sheen";

import type {SheenState} from "./core";
import {
  createState,
  splitIntoChars,
  startAnimation,
  stopAnimation,
} from "./core";

// Track state for each link
const linkStates = new WeakMap<HTMLAnchorElement, SheenState>();

/**
 * Initialise a single link
 */
const initLink = (link: HTMLAnchorElement): void => {
  // Skip if already initialised
  if (link.hasAttribute(DATA_ATTRS.SHEEN.LINK)) {
    return;
  }

  // Skip if inside a not-prose container (respects prose escape hatch)
  if (link.closest(".not-prose")) {
    return;
  }

  // Skip if link contains non-text content
  if (link.querySelector("img, svg, code")) {
    return;
  }

  // Only process links with simple text content
  const text = link.textContent?.trim();

  if (!text) {
    return;
  }

  const chars = splitIntoChars(link, text);
  const state = createState(chars, MEDIUM_SHEEN.interval, MEDIUM_SHEEN.spread);

  linkStates.set(link, state);
  link.setAttribute(DATA_ATTRS.SHEEN.LINK, "");

  link.addEventListener("mouseenter", () => {
    const s = linkStates.get(link);

    if (s) {
      startAnimation(s);
    }
  });

  link.addEventListener("mouseleave", () => {
    const s = linkStates.get(link);

    if (s) {
      stopAnimation(s);
    }
  });
};

/**
 * Initialise all prose links
 */
const init = (): void => {
  const links = document.querySelectorAll<HTMLAnchorElement>(
    DOM_SELECTORS.PROSE.LINK
  );
  links.forEach(initLink);
};

// Initialise on load and after Astro page transitions
init();
document.addEventListener("astro:after-swap", init);
