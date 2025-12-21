/**
 * JSON-LD Type Definitions
 *
 * Identity-first schema.org types for structured data.
 * Person entity is defined once on /about and referenced via @id elsewhere.
 * See: https://schema.org/
 */

/**
 * Supported JSON-LD schema types.
 */
export type JSONLDType = "WebSite" | "ProfilePage" | "Blog" | "BlogPosting";

/**
 * Reference to an entity by @id.
 * Used to link schemas without duplicating data.
 */
export interface JSONLDRef {
  "@id": string;
}

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
 * schema.org Person with @id for cross-referencing.
 * Full entity defined once on /about as mainEntity of ProfilePage.
 */
export interface JSONLDPerson {
  /**
   * JSON-LD type identifier.
   */
  "@type": "Person";

  /**
   * Canonical identifier for cross-page references.
   */
  "@id": string;

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
 * schema.org ProfilePage.
 * Entity Home for the Person — defines the full identity.
 */
export interface JSONLDProfilePage {
  /**
   * JSON-LD context URL.
   */
  "@context": "https://schema.org";

  /**
   * JSON-LD type identifier.
   */
  "@type": "ProfilePage";

  /**
   * Canonical identifier for this page.
   */
  "@id": string;

  /**
   * Page URL.
   */
  url: string;

  /**
   * Page name.
   */
  name: string;

  /**
   * The Person entity this page is about.
   */
  mainEntity: JSONLDPerson;
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
   * Canonical identifier for this website.
   */
  "@id": string;

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
   * Website author (reference to Person).
   */
  author: JSONLDRef;
}

/**
 * schema.org Blog.
 */
export interface JSONLDBlog {
  /**
   * JSON-LD context URL.
   */
  "@context": "https://schema.org";

  /**
   * JSON-LD type identifier.
   */
  "@type": "Blog";

  /**
   * Canonical identifier for this blog.
   */
  "@id": string;

  /**
   * Blog URL.
   */
  url: string;

  /**
   * Blog name.
   */
  name: string;

  /**
   * Blog description.
   */
  description: string;

  /**
   * Blog publisher (reference to Person).
   */
  publisher: JSONLDRef;
}

/**
 * schema.org BlogPosting.
 */
export interface JSONLDBlogPosting {
  /**
   * JSON-LD context URL.
   */
  "@context": "https://schema.org";

  /**
   * JSON-LD type identifier.
   */
  "@type": "BlogPosting";

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
   * Article author (reference to Person).
   */
  author: JSONLDRef;

  /**
   * Parent Blog this post belongs to.
   */
  isPartOf: JSONLDRef;

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
