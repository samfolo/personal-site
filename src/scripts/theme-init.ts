/**
 * Theme Initialisation Script
 *
 * Runs inline at the start of <body> to prevent flash of unstyled content.
 * Reads saved theme from localStorage and applies it before paint.
 *
 * IMPORTANT: This script must be inlined (not a module) to run synchronously.
 */

(function () {
  const THEME_KEY = 'theme';
  const THEME_CLASSES = ['theme-steel', 'theme-purple', 'theme-charcoal', 'theme-teal'];

  const saved = localStorage.getItem(THEME_KEY);

  if (saved && THEME_CLASSES.includes(`theme-${saved}`)) {
    document.body.classList.remove(...THEME_CLASSES);
    document.body.classList.add(`theme-${saved}`);
  }
})();
