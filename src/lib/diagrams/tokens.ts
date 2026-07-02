/**
 * Diagram geometry tokens
 *
 * The single home for the diagram vocabulary's geometry: the module grid,
 * shape radii, dash rhythms, arrowhead size, and badge metrics. These are
 * viewBox-space values (logical pixels at the design width), emitted as SVG
 * attributes — deliberately NOT CSS custom properties, so the site's design
 * system stays untouched. Colour and typography reach the diagrams through
 * the existing semantic tokens via the `.d-*` classes in
 * `src/styles/components/diagram.css`.
 */

/**
 * The article content column width in CSS pixels, derived from the design
 * system: `--container-max` (45rem) − 2 × `--container-px` (1.5rem) = 42rem.
 * Diagrams are designed at this width so the SVG maps 1:1 to CSS pixels in
 * the desktop column.
 */
export const CONTENT_WIDTH = 672;

/**
 * Columns in the layout module.
 */
export const GRID_COLUMNS = 12;

/**
 * Width of one module column (8px-aligned).
 */
export const MODULE = CONTENT_WIDTH / GRID_COLUMNS;

/**
 * Default node height (five grid units).
 */
export const NODE_HEIGHT = 40;

/**
 * Default node width in module columns.
 */
export const NODE_SPAN = 2;

/**
 * Corner radius for nodes.
 */
export const NODE_RADIUS = 4;

/**
 * Corner radius for boundaries.
 */
export const BOUNDARY_RADIUS = 6;

/**
 * Corner radius for cards and labelled actor boxes.
 */
export const CARD_RADIUS = 8;

/**
 * Corner radius for elbow connector bends.
 */
export const ELBOW_RADIUS = 6;

/**
 * Arrowhead length (and base width) in viewBox pixels.
 */
export const ARROWHEAD = 6;

/**
 * Badge height (two grid units).
 */
export const BADGE_HEIGHT = 16;

/**
 * Badge inset from a card's top-right corner (one grid unit).
 */
export const BADGE_INSET = 8;

/**
 * Badge corner radius. Near-concentric with the card corner (a true
 * concentric radius at this inset would be zero): small enough to nest into
 * the corner rather than read as a free-floating pill.
 */
export const BADGE_RADIUS = 2;

/**
 * Badge horizontal text padding.
 */
export const BADGE_PAD_X = 8;

/**
 * Default profile-card width.
 */
export const CARD_WIDTH = 240;

/**
 * Default profile-card height.
 */
export const CARD_HEIGHT = 84;

/**
 * Card text inset from the left edge.
 */
export const CARD_PAD_X = 16;

/**
 * Cap height of the diagram's monospace type at node size — used wherever
 * text blocks are typeset against box edges (CommitMono caps sit at roughly
 * 0.7em of the 13px size).
 */
export const MONO_CAP_HEIGHT = 9;

/**
 * Descender depth of the diagram's monospace type at annotation size.
 */
export const MONO_DESCENDER = 3;

/**
 * Baseline distance from a container's title to its sub line. The text
 * block (cap line to descender) is centred in the area the corner row
 * leaves free, so the gap above the caps always equals the gap below the
 * descender — balance is structural, not tuned per shape.
 */
export const CONTAINER_LINE_GAP = 20;

/**
 * Default labelled actor box width.
 */
export const ACTOR_WIDTH = 150;

/**
 * Default labelled actor box height (title + sub rows).
 */
export const ACTOR_HEIGHT = 56;

/**
 * Minimum horizontal padding between a shape's text and its frame.
 */
export const TEXT_PAD_X = 8;

/**
 * Primary diagram text size in viewBox pixels — mirrors `--text-sm`, needed
 * on the TS side only for the overflow guards (paint stays in CSS).
 */
export const TEXT_SIZE_PRIMARY = 13;

/**
 * Secondary diagram text size in viewBox pixels — the deliberate
 * diagram-only step between `--text-xs` and `--text-sm`.
 */
export const TEXT_SIZE_SECONDARY = 12;

/**
 * How far a lane's tracked label sits above the lane's centre line.
 */
export const LANE_LABEL_RISE = 44;

/**
 * Horizontal padding a boundary extends beyond its children — half a module,
 * so boundary edges land on the half-module grid when children are snapped.
 */
export const BOUNDARY_PAD_X = MODULE / 2;

/**
 * Vertical padding a boundary extends beyond its children.
 */
export const BOUNDARY_PAD_Y = 24;

/**
 * Drop from a boundary's bottom edge to its label baseline. The label sits
 * outside the frame: inside the top edge it collides with edges that cross
 * into the boundary.
 */
export const BOUNDARY_LABEL_DROP = 18;

/**
 * Inset of a corner note from the diagram's vertical edges.
 */
export const NOTE_INSET = 28;

/**
 * Baseline of a top-corner note.
 */
export const NOTE_TOP_Y = 24;

/**
 * Rise of a bottom-corner note's baseline above the diagram's bottom edge.
 */
export const NOTE_BOTTOM_RISE = 16;

/**
 * Offset between anchors when several edges arrive at (or leave) one side of
 * a shape — spread, never stacked.
 */
export const ANCHOR_SPREAD = 10;

/**
 * Spinner radius (the reindex-worker's three-quarter arc).
 */
export const SPINNER_RADIUS = 5;

/**
 * Spinner padding from its box's top-right corner — the same corner-nesting
 * treatment as a card's badge.
 */
export const SPINNER_PAD = 8;

/**
 * Nudge from an edge's geometry to its default label position.
 */
export const EDGE_LABEL_GAP = 8;

/**
 * Nudge from an elbow's vertical run to its default label position — a
 * little wider than the straight-edge gap so the label clears the bend.
 */
export const ELBOW_LABEL_GAP = 12;
