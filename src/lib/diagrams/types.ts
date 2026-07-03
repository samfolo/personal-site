/**
 * Shared types for the diagram SDK
 *
 * The vocabulary's semantic surface: ink roles, shape variants, lifecycle
 * statuses, and the option shapes scenes author against. Geometry values are
 * in viewBox pixels at the design width.
 */

/**
 * Semantic ink roles. Primary data paths draw in `fg`, background or async
 * work in `muted`, state that demands attention in `highlight`. Frames take
 * `rule` implicitly through their CSS classes.
 */
export type Ink = "fg" | "muted" | "highlight";

/**
 * Visual treatment for a node. Every variant carries meaning — active versus
 * building versus superseded — never arbitrary brightness.
 */
export type NodeVariant = "default" | "emphasis" | "muted" | "building";

/**
 * The lifecycle state a profile store holds. "Active" is deliberately not a
 * status — the active store is derived, so it is a separate flag.
 */
export type ProfileStatus = "building" | "complete" | "superseded";

/**
 * Where an edge attaches along a shape's side: the centre, or the upper or
 * lower third (reads enter a store's upper third, writes its lower).
 */
export type SideAnchor = "centre" | "upper" | "lower";

/**
 * Compass corner for pinned annotation notes.
 */
export type Corner = "ne" | "nw" | "se" | "sw";

/**
 * SVG text anchor.
 */
export type TextAnchor = "start" | "middle" | "end";

/**
 * Voice of an edge label: plain mono annotation, or a tracked uppercase
 * label for names of places and states.
 */
export type EdgeLabelStyle = "text" | "label";

/**
 * How an edge travels: `auto` routes orthogonally (straight when aligned,
 * a rounded elbow when not); `direct` draws a straight line between the
 * facing sides — the fan-out treatment, where several edges leave one
 * anchor and diverge; `return` routes feedback around the outside — south
 * out of the source, along a rail near the diagram's bottom edge, and
 * rising in the margin to enter the target's far side.
 */
export type EdgeRoute = "auto" | "direct" | "return";

/**
 * Ink tone available to a corner badge: `fg` for settled states, `muted`
 * for background or in-progress ones.
 */
export type BadgeTone = "fg" | "muted";

/**
 * Horizontal alignment of a container's text block.
 */
export type BoxAlign = "start" | "middle";

/**
 * A corner badge carried by an actor box.
 */
export interface BoxBadge {
  /**
   * Badge text (tracking applied at render).
   */
  text: string;

  /**
   * Ink tone.
   */
  tone?: BadgeTone;

  /**
   * Dash the badge frame (in-progress states).
   */
  dashed?: boolean;
}

/**
 * A point in viewBox space.
 */
export interface Point {
  /**
   * Horizontal coordinate.
   */
  x: number;

  /**
   * Vertical coordinate.
   */
  y: number;
}

/**
 * An axis-aligned rectangle in viewBox space.
 */
export interface Frame {
  /**
   * Left edge.
   */
  x: number;

  /**
   * Top edge.
   */
  y: number;

  /**
   * Width.
   */
  w: number;

  /**
   * Height.
   */
  h: number;
}

/**
 * A placed shape, returned from every declaration so edges and boundaries
 * can reference it by handle rather than by coordinates.
 */
export interface ShapeHandle extends Frame {
  /**
   * Scene-unique identifier.
   */
  id: string;
}

/**
 * Options for an edge between two shapes.
 */
export interface EdgeOptions {
  /**
   * How the edge travels.
   */
  route?: EdgeRoute;

  /**
   * Ink role for the stroke and arrowhead.
   */
  ink?: Ink;

  /**
   * Dash the stroke (the connector rhythm, 3 3).
   */
  dash?: boolean;

  /**
   * Optional label beside the edge.
   */
  label?: string;

  /**
   * Voice of the label.
   */
  labelStyle?: EdgeLabelStyle;

  /**
   * Explicit label position, overriding the per-route default.
   */
  labelAt?: Point;

  /**
   * Explicit label anchor, overriding the per-route default.
   */
  labelAnchor?: TextAnchor;

  /**
   * X of an elbow's vertical run. Without it, the elbow bends midway
   * between the facing edges.
   */
  via?: number;

  /**
   * Anchor on the target side.
   */
  enter?: SideAnchor;

  /**
   * Anchor on the source side.
   */
  exit?: SideAnchor;
}
