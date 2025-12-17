/**
 * Date Formatting Utility
 *
 * Formats dates using British English locale.
 * Format: "12 December 2024"
 */

export const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

export const formatUpdatedDate = (date: Date): string =>
  `Updated ${formatDate(date)}`;
