/**
 * Scroll Header Controller
 *
 * Uses Intersection Observer to toggle site header state
 * when the scroll trigger element scrolls out of view.
 *
 * On the home page (with scroll trigger): header transitions between states
 * On other pages (no scroll trigger): header is always in scrolled state
 */

import {DOM_IDS, DOM_SELECTORS} from "../config/dom";

type HeaderState = "hero" | "scrolled";

const setHeaderState = (header: HTMLElement, state: HeaderState): void => {
  header.dataset.state = state;
};

((): void => {
  let currentObserver: IntersectionObserver | null = null;

  const cleanup = (): void => {
    if (currentObserver) {
      currentObserver.disconnect();
      currentObserver = null;
    }
  };

  const init = (): void => {
    cleanup();

    const header = document.getElementById(DOM_IDS.SITE_HEADER);
    const scrollTrigger = document.querySelector<HTMLElement>(
      DOM_SELECTORS.SCROLL_TRIGGER
    );

    if (!header) {
      return;
    }

    // Check if this is the home page (has hero with scroll trigger)
    const isHomePage = scrollTrigger !== null;

    if (!isHomePage) {
      // Non-home pages: always show scrolled state
      setHeaderState(header, "scrolled");
      return;
    }

    // Home page: use intersection observer for scroll-based state
    currentObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHeaderState(header, "hero");
          } else {
            setHeaderState(header, "scrolled");
          }
        });
      },
      {
        // Offset roughly matches header height (~76px) to trigger
        // state change just before/after header would overlap content.
        rootMargin: "-80px 0px 0px 0px",
      }
    );

    currentObserver.observe(scrollTrigger);
  };

  // Initialise on load and after Astro page transitions
  init();
  document.addEventListener("astro:after-swap", init);
})();
