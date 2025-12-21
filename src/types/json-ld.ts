/**
 * JSON-LD Type Definitions
 *
 * Minimal schema.org types for structured data used in the site.
 * See: https://schema.org/
 */

/**
 * Supported JSON-LD schema types.
 */
export type JSONLDType = "WebSite" | "Article" | "Person";

/**
 * schema.org Organization.
 * Note: Type name uses American spelling per schema.org convention.
 */
export interface JSONLDOrganization {
  /**
   * JSON-LD type identifier.
   */
  "@type": "Organization";

  /**
   * Organisation name.
   */
  name: string;

  /**
   * Organisation website URL.
   */
  url?: string;
}

/**
 * schema.org PostalAddress.
 */
export interface JSONLDPostalAddress {
  /**
   * JSON-LD type identifier.
   */
  "@type": "PostalAddress";

  /**
   * City or locality.
   */
  addressLocality: string;

  /**
   * Country code (ISO 3166-1 alpha-2).
   */
  addressCountry: string;
}

/**
 * schema.org Person (embedded as author).
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
 * schema.org Person (top-level entity with full details).
 */
export interface JSONLDPersonEntity {
  /**
   * JSON-LD context URL.
   */
  "@context": "https://schema.org";

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
  url: string;

  /**
   * Person's job title.
   */
  jobTitle: string;

  /**
   * Short description of the person.
   */
  description: string;

  /**
   * Organisation the person works for.
   */
  worksFor: JSONLDOrganization;

  /**
   * Person's location.
   */
  address: JSONLDPostalAddress;

  /**
   * Social profile URLs for identity verification.
   */
  sameAs: string[];
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
