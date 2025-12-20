/**
 * SEO Types
 *
 * Types for the SEO component.
 */

import type {OGType} from "../../../types";

/**
 * SEO configuration for pages.
 */
export interface SEOConfig {
  /**
   * Open Graph image URL.
   */
  ogImage?: string;

  /**
   * Open Graph type.
   */
  ogType?: OGType;

  /**
   * Article publish date.
   */
  publishDate?: Date;

  /**
   * Article last updated date.
   */
  updatedDate?: Date;

  /**
   * Article tags.
   */
  tags?: string[];
}
