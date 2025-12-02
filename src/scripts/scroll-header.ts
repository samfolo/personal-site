/**
 * Scroll Header Controller
 *
 * Uses Intersection Observer to toggle fixed header visibility
 * when the hero wordmark scrolls out of view.
 */

const HEADER_ID = 'fixed-header';
const HERO_WORDMARK_ID = 'hero-wordmark';
const INITIAL_SWITCHER_ID = 'initial-theme-switcher';

function init(): void {
  const header = document.getElementById(HEADER_ID);
  const heroWordmark = document.getElementById(HERO_WORDMARK_ID);
  const initialSwitcher = document.getElementById(INITIAL_SWITCHER_ID);

  if (!header || !heroWordmark) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Wordmark visible: hide header, show initial switcher
          header.classList.remove('visible');
          initialSwitcher?.classList.remove('hidden');
        } else {
          // Wordmark not visible: show header, hide initial switcher
          header.classList.add('visible');
          initialSwitcher?.classList.add('hidden');
        }
      });
    },
    {
      rootMargin: '-80px 0px 0px 0px',
    }
  );

  observer.observe(heroWordmark);
}

// Initialise on load and after Astro page transitions
init();
document.addEventListener('astro:after-swap', init);
