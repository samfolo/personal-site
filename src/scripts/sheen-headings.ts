/**
 * Sheen Headings
 *
 * Applies the sheen text animation effect to H1-H5 headings within prose content.
 */

import {
  type SheenState,
  splitIntoChars,
  startAnimation,
  stopAnimation,
  createState,
} from './sheen-core';

const PROSE_HEADING_SELECTOR = '.prose h1, .prose h2, .prose h3, .prose h4, .prose h5';
const INITIALISED_ATTR = 'data-sheen-heading';

// Settings for prose headings - wider spread for larger text
const HEADING_INTERVAL = 18;
const HEADING_SPREAD = 3;

// Track state for each heading
const headingStates = new WeakMap<HTMLElement, SheenState>();

/**
 * Get the text content of a heading, excluding anchor links
 */
function getHeadingText(heading: HTMLElement): string {
  // Clone the heading to avoid modifying the original
  const clone = heading.cloneNode(true) as HTMLElement;

  // Remove anchor links from the clone
  const anchors = clone.querySelectorAll('.heading-anchor');
  anchors.forEach(anchor => anchor.remove());

  return clone.textContent?.trim() || '';
}

/**
 * Initialise a single heading
 */
function initHeading(heading: HTMLElement): void {
  // Skip if already initialised
  if (heading.hasAttribute(INITIALISED_ATTR)) {return;}

  const text = getHeadingText(heading);
  if (!text) {return;}

  // Preserve the anchor link if present
  const anchor = heading.querySelector('.heading-anchor');

  // Split the text into chars
  const chars = splitIntoChars(heading, text);

  // Re-add the anchor at the beginning if it existed
  if (anchor) {
    heading.insertBefore(anchor, heading.firstChild);
  }

  const state = createState(chars, HEADING_INTERVAL, HEADING_SPREAD);
  headingStates.set(heading, state);
  heading.setAttribute(INITIALISED_ATTR, '');

  heading.addEventListener('mouseenter', () => {
    const s = headingStates.get(heading);
    if (s) {startAnimation(s);}
  });

  heading.addEventListener('mouseleave', () => {
    const s = headingStates.get(heading);
    if (s) {stopAnimation(s);}
  });
}

/**
 * Initialise all prose headings
 */
function init(): void {
  const headings = document.querySelectorAll<HTMLElement>(PROSE_HEADING_SELECTOR);
  headings.forEach(initHeading);
}

// Initialise on load and after Astro page transitions
init();
document.addEventListener('astro:after-swap', init);
