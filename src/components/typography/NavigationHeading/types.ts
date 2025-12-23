/**
 * NavigationHeading Types
 *
 * Types for the NavigationHeading component, which renders a heading
 * with mixed static and link segments for tabbed navigation.
 */

/**
 * Allowed heading tag levels for NavigationHeading.
 */
export type NavigationHeadingTag = "h1" | "h2" | "h3" | "h4" | "h5";

/**
 * Link target behaviour.
 */
export type NavigationHeadingLinkTarget = "_self" | "_blank";

/**
 * A static text segment that renders as a span.
 */
export interface NavigationHeadingDisplaySegment {
  type: "display";
  value: string;
}

/**
 * A link segment that renders as an anchor element.
 */
export interface NavigationHeadingLinkSegment {
  type: "link";
  value: string;
  href: string;
  target?: NavigationHeadingLinkTarget;
}

/**
 * A segment in the NavigationHeading, either static text or a link.
 */
export type NavigationHeadingSegment =
  | NavigationHeadingDisplaySegment
  | NavigationHeadingLinkSegment;
