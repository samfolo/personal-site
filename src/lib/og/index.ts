/**
 * OG Image Utilities
 *
 * Barrel export for OG image generation utilities.
 */

export {FONTS} from "./fonts";
export {generateOgImage} from "./generate";
export {createOgTemplate} from "./template";
export {getThemeFromTitle} from "./theme-selection";

export type {FontData} from "./fonts";
export type {OgTemplateOptions} from "./template";

/**
 * Default Open Graph image path for social sharing.
 */
export const OG_DEFAULT_PATH = "/og/default.png";

/**
 * Get OG image path for a blog post.
 */
export const getBlogPostOgPath = (postId: string): string =>
  `/og/blog/${postId}.png`;
