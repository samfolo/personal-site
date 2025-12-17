/**
 * Sheen Links
 *
 * Applies the sheen text animation effect to all links within prose content.
 */

import {MEDIUM_SHEEN} from "../config/sheen";
import {
  type SheenState,
  splitIntoChars,
  startAnimation,
  stopAnimation,
  createState,
} from "./sheen-core";

const PROSE_LINK_SELECTOR = ".prose a:not(.heading-anchor)";
const INITIALISED_ATTR = "data-sheen-link";

// Track state for each link
const linkStates = new WeakMap<HTMLAnchorElement, SheenState>();

/**
 * Initialise a single link
 */
const initLink = (link: HTMLAnchorElement): void => {
  // Skip if already initialised or if link contains non-text content
  if (link.hasAttribute(INITIALISED_ATTR)) {
    return;
  }

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
  link.setAttribute(INITIALISED_ATTR, "");

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
  const links =
    document.querySelectorAll<HTMLAnchorElement>(PROSE_LINK_SELECTOR);
  links.forEach(initLink);
};

// Initialise on load and after Astro page transitions
init();
document.addEventListener("astro:after-swap", init);
