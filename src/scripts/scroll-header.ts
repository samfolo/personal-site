/**
 * Scroll Header Controller
 *
 * Uses Intersection Observer to toggle fixed header visibility
 * when the scroll trigger element scrolls out of view.
 *
 * On the home page (with scroll trigger): header appears when hero scrolls out
 * On other pages (no scroll trigger): header is always visible
 */

import {DOM_IDS, DOM_SELECTORS} from "../config/dom";

((): void => {
  const init = (): void => {
    const header = document.getElementById(DOM_IDS.FIXED_HEADER);
    const scrollTrigger = document.querySelector<HTMLElement>(
      DOM_SELECTORS.SCROLL_TRIGGER
    );
    const initialSwitcher = document.getElementById(
      DOM_IDS.INITIAL_THEME_SWITCHER
    );

    if (!header) {
      return;
    }

    // Check if this is the home page (has hero with scroll trigger)
    const isHomePage = scrollTrigger !== null;

    if (!isHomePage) {
      // Non-home pages: always show header, hide initial theme switcher
      header.classList.add("visible");
      initialSwitcher?.classList.add("hidden");
      return;
    }

    // Home page: use intersection observer for scroll-based visibility
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Trigger visible: hide header, show initial switcher
            header.classList.remove("visible");
            initialSwitcher?.classList.remove("hidden");
          } else {
            // Trigger not visible: show header, hide initial switcher
            header.classList.add("visible");
            initialSwitcher?.classList.add("hidden");
          }
        });
      },
      {
        // Offset roughly matches header height (~76px) to trigger
        // visibility change just before/after header would overlap content.
        rootMargin: "-80px 0px 0px 0px",
      }
    );

    observer.observe(scrollTrigger);
  };

  // Initialise on load and after Astro page transitions
  init();
  document.addEventListener("astro:after-swap", init);
})();
