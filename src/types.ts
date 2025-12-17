/**
 * Shared Type Definitions
 *
 * Centralised types used across the application.
 */

/**
 * Available colour themes.
 * Corresponds to CSS classes: .theme-steel, .theme-purple, etc.
 */
export type Theme = "steel" | "purple" | "charcoal" | "teal";

/**
 * JSON-LD Types
 *
 * Minimal schema.org types for structured data used in the site.
 * See: https://schema.org/
 */

/** Supported JSON-LD schema types */
export type JSONLDType = "WebSite" | "Article";

/** schema.org Person */
export interface JSONLDPerson {
  "@type": "Person";
  name: string;
  url?: string;
  jobTitle?: string;
  sameAs?: string[];
}

/** schema.org WebSite */
export interface JSONLDWebSite {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  description: string;
  author: JSONLDPerson;
}

/** schema.org Article */
export interface JSONLDArticle {
  "@context": "https://schema.org";
  "@type": "Article";
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  author: JSONLDPerson;
  keywords?: string;
}

/** Article data passed to JSON-LD component */
export interface JSONLDArticleData {
  headline: string;
  description: string;
  publishDate: Date;
  updatedDate?: Date;
  tags?: string[];
}
