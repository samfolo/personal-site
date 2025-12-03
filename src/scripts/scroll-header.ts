/**
 * Scroll Header Controller
 *
 * Uses Intersection Observer to toggle fixed header visibility
 * when the scroll trigger element scrolls out of view.
 *
 * Any element can become a scroll trigger by adding data-scroll-trigger.
 */

const HEADER_ID = 'fixed-header';
const SCROLL_TRIGGER_SELECTOR = '[data-scroll-trigger]';
const INITIAL_SWITCHER_ID = 'initial-theme-switcher';

function init(): void {
  const header = document.getElementById(HEADER_ID);
  const scrollTrigger = document.querySelector<HTMLElement>(SCROLL_TRIGGER_SELECTOR);
  const initialSwitcher = document.getElementById(INITIAL_SWITCHER_ID);

  if (!header || !scrollTrigger) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Trigger visible: hide header, show initial switcher
          header.classList.remove('visible');
          initialSwitcher?.classList.remove('hidden');
        } else {
          // Trigger not visible: show header, hide initial switcher
          header.classList.add('visible');
          initialSwitcher?.classList.add('hidden');
        }
      });
    },
    {
      rootMargin: '-80px 0px 0px 0px',
    }
  );

  observer.observe(scrollTrigger);
}

// Initialise on load and after Astro page transitions
init();
document.addEventListener('astro:after-swap', init);
