/**
 * Date Formatting Utility
 *
 * Formats dates using British English locale.
 * Format: "12 December 2024"
 */

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatUpdatedDate(date: Date): string {
  return `Updated ${formatDate(date)}`;
}
