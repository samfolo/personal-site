/**
 * Date Formatting Utility
 *
 * Centralised date formatting using British English locale.
 */

type DateFormat = "full" | "short" | "month-year" | "dot-separated";

/**
 * Format a date in British English locale.
 *
 * @param date - Date to format
 * @param format - Output format:
 *   - "full": "12 December 2024"
 *   - "short": "12 Dec"
 *   - "month-year": "December 2024"
 *   - "dot-separated": "12.12.2024"
 */
export const formatDate = (date: Date, format: DateFormat = "full"): string => {
  switch (format) {
    case "full":
      return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);

    case "short": {
      const day = date.getDate();
      const month = new Intl.DateTimeFormat("en-GB", {month: "short"}).format(
        date
      );
      return `${day} ${month}`;
    }

    case "month-year":
      return new Intl.DateTimeFormat("en-GB", {
        month: "long",
        year: "numeric",
      }).format(date);

    case "dot-separated":
      return date
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, ".");
  }
};
