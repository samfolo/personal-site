/**
 * Navigation Configuration
 *
 * Single source of truth for navigation links.
 * All navigation-related constants should be imported from here.
 */

export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: NavLink[] = [
  {href: "/blog", label: "Blog"},
  {href: "/about", label: "About"},
  {href: "/uses", label: "Uses"},
];
