/**
 * PostNav Types
 *
 * Types for post navigation links.
 */

/**
 * Navigation link to an adjacent post.
 */
export interface PostNavLink {
  /**
   * URL slug for the post.
   */
  slug: string;

  /**
   * Post title.
   */
  title: string;
}
