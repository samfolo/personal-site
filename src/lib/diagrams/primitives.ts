/**
 * Drawing primitives
 *
 * Emitters for the diagram vocabulary: nodes, labelled actor boxes, profile
 * cards with lifecycle badges, boundaries, tracked labels, annotations, and
 * straight or elbowed edges. Each returns classed SVG markup — geometry as
 * attributes, all paint through the `.d-*` classes in
 * `src/styles/components/diagram.css`, which is what keeps every figure
 * theme-aware with zero client JavaScript.
 */

import {measureTracked, track} from "./metrics";
import {el, textEl} from "./svg";
import {
  ARROWHEAD,
  BADGE_HEIGHT,
  BADGE_INSET,
  BADGE_PAD_X,
  BADGE_RADIUS,
  BOUNDARY_RADIUS,
  CARD_PAD_X,
  CARD_RADIUS,
  CONTAINER_LINE_GAP,
  ELBOW_RADIUS,
  ENTITY_PAD_BOTTOM,
  ENTITY_ROW_HEIGHT,
  ENTITY_TITLE_HEIGHT,
  MONO_CAP_HEIGHT,
  MONO_DESCENDER,
  NODE_RADIUS,
  SPINNER_PAD,
  SPINNER_RADIUS,
} from "./tokens";
import type {
  BadgeTone,
  BoxAlign,
  BoxBadge,
  Frame,
  Ink,
  NodeVariant,
  Point,
  ProfileStatus,
  TextAnchor,
} from "./types";

/**
 * A node: a rounded box with a centred monospace label.
 */
export interface NodeShape extends Frame {
  /**
   * Centred label text.
   */
  label: string;

  /**
   * Visual treatment.
   */
  variant: NodeVariant;
}

/**
 * A corner badge, nested into a container's top-right corner.
 */
export interface CornerBadge {
  /**
   * Discriminator.
   */
  kind: "badge";

  /**
   * Badge text (tracking applied at render).
   */
  text: string;

  /**
   * Ink tone.
   */
  tone: BadgeTone;

  /**
   * Dash the badge frame (in-progress states).
   */
  dashed?: boolean;
}

/**
 * An in-progress three-quarter arc, nested into a container's top-right
 * corner.
 */
export interface CornerSpinner {
  /**
   * Discriminator.
   */
  kind: "spinner";
}

/**
 * The element occupying a container's corner row.
 */
export type CornerElement = CornerBadge | CornerSpinner;

/**
 * The generalised container behind actors and store cards: a framed box
 * with an optional corner element in its top row (badge or spinner), a
 * title, and an optional sub line. The text block is centred in the area
 * the corner row leaves free, so spacing stays balanced at any height.
 */
export interface ContainerShape extends Frame {
  /**
   * Primary text.
   */
  title: string;

  /**
   * Secondary line under the title.
   */
  sub?: string;

  /**
   * Horizontal alignment of the text block.
   */
  align: BoxAlign;

  /**
   * Dash the frame (background, asynchronous, or in-progress).
   */
  dashed?: boolean;

  /**
   * Emphasise the frame (the live / highlighted element).
   */
  emphasis?: boolean;

  /**
   * Dim the whole container (superseded elements).
   */
  dim?: boolean;

  /**
   * Corner-row element.
   */
  corner?: CornerElement;
}

/**
 * A labelled actor box: a container with centred text. Dashed marks a
 * background or asynchronous actor; a badge or spinner occupies the corner
 * row.
 */
export interface ActorShape extends Frame {
  /**
   * Primary title.
   */
  title: string;

  /**
   * Secondary line under the title.
   */
  sub?: string;

  /**
   * Horizontal alignment of the text block.
   */
  align?: BoxAlign;

  /**
   * Dash the frame (background / asynchronous actor).
   */
  dashed?: boolean;

  /**
   * Corner badge.
   */
  badge?: BoxBadge;

  /**
   * Draw the in-progress arc in the corner row.
   */
  spinner?: boolean;
}

/**
 * A profile card: a lifecycle-stated store. The status badge nests into the
 * top-right corner; `active` is shown by the emphasised frame and a tracked
 * highlight label above the corner, never by the status itself.
 */
export interface CardShape extends Frame {
  /**
   * Primary name (model, store, artefact).
   */
  name: string;

  /**
   * Secondary metadata line.
   */
  meta: string;

  /**
   * Lifecycle status, rendered as the corner badge.
   */
  status: ProfileStatus;

  /**
   * Whether this is the live store.
   */
  active: boolean;
}

const VARIANT_CLASSES: Record<NodeVariant, string> = {
  default: "",
  emphasis: " is-emphasis",
  muted: " is-muted",
  building: " is-building",
};

const centredText = (x: number, y: number, text: string): string =>
  textEl({x, y, "text-anchor": "middle", "dominant-baseline": "central"}, text);

/**
 * Render a node.
 */
export const renderNode = (node: NodeShape): string =>
  el(
    "g",
    {class: `d-node${VARIANT_CLASSES[node.variant]}`},
    el("rect", {
      x: node.x,
      y: node.y,
      width: node.w,
      height: node.h,
      rx: NODE_RADIUS,
    }),
    centredText(node.x + node.w / 2, node.y + node.h / 2, node.label)
  );

const renderSpinner = (cx: number, cy: number): string =>
  el("path", {
    class: "d-spinner",
    d: `M${cx},${cy - SPINNER_RADIUS} A${SPINNER_RADIUS},${SPINNER_RADIUS} 0 1 1 ${cx - SPINNER_RADIUS},${cy}`,
  });

/**
 * Height of a container's corner row: the corner element plus its inset.
 * Text below starts from here, whichever element occupies the row.
 */
const CORNER_ROW = BADGE_INSET + BADGE_HEIGHT;

/**
 * The minimum height a container needs for its rows: the corner row when
 * present, the text block, and a grid unit of breathing room around it.
 * The scene's height guard fails the build below this.
 */
export const containerMinHeight = (
  hasCorner: boolean,
  hasSub: boolean
): number => {
  const block = hasSub
    ? MONO_CAP_HEIGHT + CONTAINER_LINE_GAP + MONO_DESCENDER
    : MONO_CAP_HEIGHT + MONO_DESCENDER;
  return (hasCorner ? CORNER_ROW : 0) + block + 8;
};

const renderCornerBadge = (
  shape: ContainerShape,
  badge: CornerBadge
): string => {
  const tracked = track(badge.text);
  const width = measureTracked(tracked) + BADGE_PAD_X * 2;
  const left = shape.x + shape.w - BADGE_INSET - width;
  const top = shape.y + BADGE_INSET;
  const tone = badge.tone === "fg" ? " is-fg" : "";
  const dash = badge.dashed ? " is-dashed" : "";
  return el(
    "g",
    {class: `d-badge${tone}${dash}`},
    el("rect", {
      x: left,
      y: top,
      width,
      height: BADGE_HEIGHT,
      rx: BADGE_RADIUS,
    }),
    textEl(
      {
        x: left + BADGE_PAD_X,
        y: top + BADGE_HEIGHT / 2,
        "dominant-baseline": "central",
      },
      tracked
    )
  );
};

const renderCorner = (shape: ContainerShape): string => {
  if (shape.corner === undefined) {
    return "";
  }
  if (shape.corner.kind === "badge") {
    return renderCornerBadge(shape, shape.corner);
  }
  return renderSpinner(
    shape.x + shape.w - SPINNER_PAD - SPINNER_RADIUS,
    shape.y + BADGE_INSET + BADGE_HEIGHT / 2
  );
};

const renderContainerText = (shape: ContainerShape): string => {
  // Centre the text block (cap line to descender) in the area the corner
  // row leaves free: the gap above the caps equals the gap below the
  // descender at any container height.
  const contentTop = shape.corner === undefined ? 0 : CORNER_ROW;
  const blockHeight =
    shape.sub === undefined
      ? MONO_CAP_HEIGHT + MONO_DESCENDER
      : MONO_CAP_HEIGHT + CONTAINER_LINE_GAP + MONO_DESCENDER;
  const capTop =
    shape.y + contentTop + (shape.h - contentTop - blockHeight) / 2;
  const titleBaseline = capTop + MONO_CAP_HEIGHT;
  const isCentred = shape.align === "middle";
  const x = isCentred ? shape.x + shape.w / 2 : shape.x + CARD_PAD_X;
  const anchor = isCentred ? "middle" : undefined;
  const title = textEl(
    {class: "title", x, y: titleBaseline, "text-anchor": anchor},
    shape.title
  );
  if (shape.sub === undefined) {
    return title;
  }
  const sub = textEl(
    {
      class: "sub",
      x,
      y: titleBaseline + CONTAINER_LINE_GAP,
      "text-anchor": anchor,
    },
    shape.sub
  );
  return title + sub;
};

/**
 * Render the generalised container: frame, corner element, and text block.
 * The seam for new boxed element types — specialise by parameters, not by
 * new emitters.
 */
export const renderContainer = (shape: ContainerShape): string => {
  const classes =
    "d-box" +
    (shape.dashed ? " is-dashed" : "") +
    (shape.emphasis ? " is-emphasis" : "") +
    (shape.dim ? " is-dim" : "");
  return el(
    "g",
    {class: classes},
    el("rect", {
      class: "frame",
      x: shape.x,
      y: shape.y,
      width: shape.w,
      height: shape.h,
      rx: CARD_RADIUS,
    }),
    renderContainerText(shape),
    renderCorner(shape)
  );
};

const buildActorCorner = (actor: ActorShape): CornerElement | undefined => {
  if (actor.badge) {
    return {
      kind: "badge",
      text: actor.badge.text,
      tone: actor.badge.tone ?? "muted",
      dashed: actor.badge.dashed,
    };
  }
  if (actor.spinner) {
    return {kind: "spinner"};
  }
  return undefined;
};

/**
 * Render a labelled actor box (a centred-text container).
 */
export const renderActor = (actor: ActorShape): string =>
  renderContainer({
    x: actor.x,
    y: actor.y,
    w: actor.w,
    h: actor.h,
    title: actor.title,
    sub: actor.sub,
    align: actor.align ?? "middle",
    dashed: actor.dashed,
    corner: buildActorCorner(actor),
  });

const STATUS_BADGES: Record<ProfileStatus, CornerBadge> = {
  complete: {kind: "badge", text: "complete", tone: "fg"},
  building: {kind: "badge", text: "building", tone: "muted", dashed: true},
  superseded: {kind: "badge", text: "superseded", tone: "muted"},
};

const renderActiveLabel = (card: CardShape): string =>
  renderTrackedLabel({
    text: "active",
    x: card.x + card.w,
    y: card.y - 8,
    anchor: "end",
    ink: "highlight",
    centred: true,
  });

/**
 * Render a profile card (a start-aligned container carrying its lifecycle
 * as the corner badge) and — when active — the tracked highlight label
 * above its top-right corner.
 */
export const renderCard = (card: CardShape): string => {
  const body = renderContainer({
    x: card.x,
    y: card.y,
    w: card.w,
    h: card.h,
    title: card.name,
    sub: card.meta,
    align: "start",
    dashed: card.status === "building",
    emphasis: card.active,
    dim: card.status === "superseded",
    corner: STATUS_BADGES[card.status],
  });
  return card.active ? body + renderActiveLabel(card) : body;
};

/**
 * Render a dashed boundary frame.
 */
export const renderBoundary = (frame: Frame): string =>
  el("rect", {
    class: "d-boundary",
    x: frame.x,
    y: frame.y,
    width: frame.w,
    height: frame.h,
    rx: BOUNDARY_RADIUS,
  });

/**
 * One field row of an entity: the column name, and an optional note in the
 * data voice (a type, a key marker, an invariant) set flush right.
 */
export interface EntityField {
  /**
   * Column name.
   */
  name: string;

  /**
   * Right-aligned note.
   */
  note?: string;
}

/**
 * An entity: a titled record with typed field rows — the ERD vocabulary.
 * Height is structural: title row, one row per field, bottom pad. A rule
 * separates the title from the fields, mirroring how a record reads.
 */
export interface EntityShape extends Frame {
  /**
   * Record name (rendered as-is — code voice).
   */
  title: string;

  /**
   * Field rows, in declaration order.
   */
  fields: EntityField[];
}

/**
 * Structural height of an entity: title row, field rows, bottom pad.
 */
export const entityHeight = (fieldCount: number): number =>
  ENTITY_TITLE_HEIGHT + fieldCount * ENTITY_ROW_HEIGHT + ENTITY_PAD_BOTTOM;

/**
 * Render an entity: frame, title row over a separating rule, field rows
 * with names set left and notes flush right.
 */
export const renderEntity = (entity: EntityShape): string => {
  const ruleY = entity.y + ENTITY_TITLE_HEIGHT;
  const title = textEl(
    {
      class: "title",
      x: entity.x + CARD_PAD_X,
      y: entity.y + ENTITY_TITLE_HEIGHT / 2,
      "dominant-baseline": "central",
    },
    entity.title
  );
  const rule = el("line", {
    class: "rule",
    x1: entity.x,
    y1: ruleY,
    x2: entity.x + entity.w,
    y2: ruleY,
  });
  const rows = entity.fields
    .map((field, index) => {
      const rowCentre =
        ruleY + index * ENTITY_ROW_HEIGHT + ENTITY_ROW_HEIGHT / 2;
      const name = textEl(
        {
          class: "field",
          x: entity.x + CARD_PAD_X,
          y: rowCentre,
          "dominant-baseline": "central",
        },
        field.name
      );
      if (field.note === undefined) {
        return name;
      }
      const note = textEl(
        {
          class: "note",
          x: entity.x + entity.w - CARD_PAD_X,
          y: rowCentre,
          "text-anchor": "end",
          "dominant-baseline": "central",
        },
        field.note
      );
      return name + note;
    })
    .join("");
  return el(
    "g",
    {class: "d-entity"},
    el("rect", {
      class: "frame",
      x: entity.x,
      y: entity.y,
      width: entity.w,
      height: entity.h,
      rx: CARD_RADIUS,
    }),
    title,
    rule,
    rows
  );
};

/**
 * A tracked uppercase label — the voice for names of places and states.
 */
export interface TrackedLabel {
  /**
   * Label text (tracking applied at render).
   */
  text: string;

  /**
   * Anchor x.
   */
  x: number;

  /**
   * Baseline y (or centre when `centred`).
   */
  y: number;

  /**
   * Text anchor.
   */
  anchor?: TextAnchor;

  /**
   * Ink role.
   */
  ink?: Ink;

  /**
   * Centre vertically on `y` instead of treating it as the baseline.
   */
  centred?: boolean;
}

/**
 * The one ink-modifier vocabulary, shared by every primitive so the TS side
 * cannot drift from the `.d-*` classes in diagram.css.
 */
const INK_CLASSES: Record<Ink, string> = {
  fg: " is-fg",
  muted: "",
  highlight: " is-highlight",
};

/**
 * Render a tracked uppercase label.
 */
export const renderTrackedLabel = (label: TrackedLabel): string => {
  const {anchor = "start", ink = "muted", centred = false} = label;
  return textEl(
    {
      class: `d-label${INK_CLASSES[ink]}`,
      x: label.x,
      y: label.y,
      "text-anchor": anchor === "start" ? undefined : anchor,
      "dominant-baseline": centred ? "central" : undefined,
    },
    track(label.text)
  );
};

/**
 * A plain small annotation — the voice for data: counts, costs, latencies.
 */
export interface Annotation {
  /**
   * Annotation text, rendered as-is.
   */
  text: string;

  /**
   * Anchor x.
   */
  x: number;

  /**
   * Baseline y (or centre when `centred`).
   */
  y: number;

  /**
   * Text anchor.
   */
  anchor?: TextAnchor;

  /**
   * Ink role.
   */
  ink?: Ink;

  /**
   * Centre vertically on `y` instead of treating it as the baseline.
   */
  centred?: boolean;
}

/**
 * Render a plain annotation.
 */
export const renderAnnotation = (note: Annotation): string => {
  const {anchor = "start", ink = "muted", centred = false} = note;
  return textEl(
    {
      class: `d-text${INK_CLASSES[ink]}`,
      x: note.x,
      y: note.y,
      "text-anchor": anchor === "start" ? undefined : anchor,
      "dominant-baseline": centred ? "central" : undefined,
    },
    note.text
  );
};

/**
 * Marker element id for an ink role, namespaced to a diagram so several
 * figures can share a page.
 */
export const markerId = (diagramId: string, ink: Ink): string =>
  `${diagramId}-arrow-${ink}`;

/**
 * Render the arrowhead marker defs for a diagram (one per ink role). The
 * paths carry classes, not fills — arrowhead paint lives in diagram.css
 * with everything else.
 */
export const renderMarkers = (diagramId: string): string => {
  const inks: Ink[] = ["fg", "muted", "highlight"];
  return inks
    .map((ink) =>
      el(
        "marker",
        {
          id: markerId(diagramId, ink),
          viewBox: `0 0 ${ARROWHEAD} ${ARROWHEAD}`,
          refX: ARROWHEAD,
          refY: ARROWHEAD / 2,
          markerWidth: ARROWHEAD,
          markerHeight: ARROWHEAD,
          orient: "auto-start-reverse",
        },
        el("path", {
          class: `d-arrow${INK_CLASSES[ink]}`,
          d: `M0,0 L${ARROWHEAD},${ARROWHEAD / 2} L0,${ARROWHEAD} z`,
        })
      )
    )
    .join("");
};

const edgeClass = (ink: Ink, dash: boolean): string =>
  `d-edge${INK_CLASSES[ink]}${dash ? " is-dashed" : ""}`;

/**
 * Geometry and paint for a rendered edge.
 */
export interface EdgeStroke {
  /**
   * Orthogonal path points, source first. Two points draw a straight
   * connector; more draw an elbow with rounded bends.
   */
  points: Point[];

  /**
   * Ink role.
   */
  ink: Ink;

  /**
   * Dash the stroke.
   */
  dash: boolean;

  /**
   * Owning diagram id, for the arrowhead marker reference.
   */
  diagramId: string;
}

const buildElbowPath = (points: Point[]): string => {
  const parts = [`M${points[0]?.x},${points[0]?.y}`];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const bend = points[i];
    const next = points[i + 1];
    if (!prev || !bend || !next) {
      continue;
    }
    const inLength = Math.hypot(bend.x - prev.x, bend.y - prev.y);
    const outLength = Math.hypot(next.x - bend.x, next.y - bend.y);
    const radius = Math.min(ELBOW_RADIUS, inLength / 2, outLength / 2);
    const inX = bend.x - Math.sign(bend.x - prev.x) * radius;
    const inY = bend.y - Math.sign(bend.y - prev.y) * radius;
    const outX = bend.x + Math.sign(next.x - bend.x) * radius;
    const outY = bend.y + Math.sign(next.y - bend.y) * radius;
    parts.push(`L${inX},${inY}`, `Q${bend.x},${bend.y} ${outX},${outY}`);
  }
  const end = points.at(-1);
  parts.push(`L${end?.x},${end?.y}`);
  return parts.join(" ");
};

/**
 * Render an edge: a straight connector or a rounded orthogonal elbow, with
 * an arrowhead at the final point.
 */
export const renderEdge = (edge: EdgeStroke): string =>
  el("path", {
    class: edgeClass(edge.ink, edge.dash),
    d: buildElbowPath(edge.points),
    "marker-end": `url(#${markerId(edge.diagramId, edge.ink)})`,
  });
