/**
 * Favicon Utility
 *
 * Updates the favicon to match the current theme.
 */

export function setFavicon(theme: string): void {
  const favicon = document.querySelector<HTMLLinkElement>('link[data-favicon]');
  if (favicon) {
    favicon.href = `/sf-${theme}.ico`;
  }
}
