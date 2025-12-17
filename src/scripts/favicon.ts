/**
 * Favicon Utility
 *
 * Updates the favicon to match the current theme.
 */

export const setFavicon = (theme: string): void => {
  const favicon = document.querySelector<HTMLLinkElement>('link[data-favicon]');
  const expected = `/sf-${theme}.ico`;

  if (favicon && !favicon.href.endsWith(expected)) {
    favicon.href = expected;
  }
};
