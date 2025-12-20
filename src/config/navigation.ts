/**
 * Navigation Configuration
 *
 * Single source of truth for navigation links.
 * All navigation-related constants should be imported from here.
 */

/**
 * Navigation link definition.
 */
export interface NavLink {
  /**
   * URL path for the link.
   */
  href: string;

  /**
   * Display text for the link.
   */
  label: string;
}

export const NAV_LINKS: NavLink[] = [
  {href: "/blog", label: "Blog"},
  {href: "/about", label: "About"},
  {href: "/uses", label: "Uses"},
];
