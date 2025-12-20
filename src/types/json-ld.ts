/**
 * JSON-LD Type Definitions
 *
 * Minimal schema.org types for structured data used in the site.
 * See: https://schema.org/
 */

/**
 * Supported JSON-LD schema types.
 */
export type JSONLDType = "WebSite" | "Article";

/**
 * schema.org Person.
 */
export interface JSONLDPerson {
  /**
   * JSON-LD type identifier.
   */
  "@type": "Person";

  /**
   * Person's full name.
   */
  name: string;

  /**
   * Person's website URL.
   */
  url?: string;

  /**
   * Person's job title.
   */
  jobTitle?: string;

  /**
   * Social profile URLs for identity verification.
   */
  sameAs?: string[];
}

/**
 * schema.org WebSite.
 */
export interface JSONLDWebSite {
  /**
   * JSON-LD context URL.
   */
  "@context": "https://schema.org";

  /**
   * JSON-LD type identifier.
   */
  "@type": "WebSite";

  /**
   * Website name.
   */
  name: string;

  /**
   * Website URL.
   */
  url: string;

  /**
   * Website description.
   */
  description: string;

  /**
   * Website author.
   */
  author: JSONLDPerson;
}

/**
 * schema.org Article.
 */
export interface JSONLDArticle {
  /**
   * JSON-LD context URL.
   */
  "@context": "https://schema.org";

  /**
   * JSON-LD type identifier.
   */
  "@type": "Article";

  /**
   * Article headline.
   */
  headline: string;

  /**
   * Article description.
   */
  description: string;

  /**
   * Article canonical URL.
   */
  url: string;

  /**
   * ISO 8601 publish date.
   */
  datePublished: string;

  /**
   * ISO 8601 last modified date.
   */
  dateModified: string;

  /**
   * Article author.
   */
  author: JSONLDPerson;

  /**
   * Comma-separated keywords.
   */
  keywords?: string;
}

/**
 * Article data passed to JSON-LD component.
 */
export interface JSONLDArticleData {
  /**
   * Article headline.
   */
  headline: string;

  /**
   * Article description.
   */
  description: string;

  /**
   * Article publish date.
   */
  publishDate: Date;

  /**
   * Article last updated date.
   */
  updatedDate?: Date;

  /**
   * Article tags.
   */
  tags?: string[];
}
