/**
 * Heading Anchor Click Handler
 *
 * Handles anchor link clicks: copies URL to clipboard and smooth scrolls.
 * Also handles hash navigation on page load.
 */

const init = (): void => {
  const anchors = document.querySelectorAll<HTMLAnchorElement>('[data-heading-anchor]');

  anchors.forEach((anchor) => {
    anchor.addEventListener('click', async (event) => {
      event.preventDefault();

      const href = anchor.getAttribute('href');

      if (!href) {
        return;
      }

      // Build full URL
      const url = new URL(href, window.location.href);

      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(url.toString());
      } catch (err) {
        console.warn('Failed to copy URL to clipboard:', err);
      }

      // Navigate to the heading
      const targetId = href.slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({behavior: 'smooth'});
        history.pushState(null, '', href);
      }
    });
  });
};

/**
 * Smooth scroll to heading if URL has a hash on page load
 */
const handleInitialHash = (): void => {
  if (!window.location.hash) {
    return;
  }

  const targetId = window.location.hash.slice(1);
  const target = document.getElementById(targetId);

  if (target) {
    // Small delay to ensure layout is complete
    requestAnimationFrame(() => {
      target.scrollIntoView({behavior: 'smooth'});
    });
  }
};

// Initialise on load
init();
handleInitialHash();

// Re-initialise after Astro page transitions
document.addEventListener('astro:after-swap', () => {
  init();
  handleInitialHash();
});
