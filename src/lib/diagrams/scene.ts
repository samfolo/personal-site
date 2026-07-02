/**
 * Scene builder and renderer
 *
 * The authoring surface of the diagram SDK. A scene is declared as shapes
 * and the relations between them — lanes, columns, `under` alignments, and
 * edges by handle — and the builder owns the polish: module snapping,
 * anchor sides and spreading, flat-versus-elbow routing, and label
 * placement. Rendering happens at build time to classed SVG, so figures
 * re-theme through CSS custom properties with zero client JavaScript.
 *
 * Routing covers the shipped patterns — straight connectors between aligned
 * shapes and single-bend orthogonal elbows — which is what hand-composed
 * figures on the module need. Denser graphs (auto-layout, multi-bend
 * routing) are a deliberate non-goal until a figure demands them.
 */

import {measureMono} from "./metrics";
import {
  containerMinHeight,
  renderActor,
  renderAnnotation,
  renderBoundary,
  renderCard,
  renderEdge,
  renderMarkers,
  renderNode,
  renderTrackedLabel,
} from "./primitives";
import type {ActorShape, CardShape, NodeShape} from "./primitives";
import {el} from "./svg";
import {
  ACTOR_HEIGHT,
  ACTOR_WIDTH,
  ANCHOR_SPREAD,
  BOUNDARY_LABEL_DROP,
  BOUNDARY_PAD_X,
  BOUNDARY_PAD_Y,
  CARD_HEIGHT,
  CARD_WIDTH,
  EDGE_LABEL_GAP,
  ELBOW_LABEL_GAP,
  LANE_LABEL_RISE,
  MODULE,
  NODE_HEIGHT,
  NODE_SPAN,
  NOTE_BOTTOM_RISE,
  NOTE_INSET,
  NOTE_TOP_Y,
  TEXT_PAD_X,
  TEXT_SIZE_PRIMARY,
  TEXT_SIZE_SECONDARY,
} from "./tokens";
import type {
  BoxAlign,
  BoxBadge,
  Corner,
  EdgeLabelStyle,
  EdgeOptions,
  Frame,
  Ink,
  NodeVariant,
  Point,
  ProfileStatus,
  ShapeHandle,
  SideAnchor,
  TextAnchor,
} from "./types";

/**
 * Coordinate tolerance when deciding whether two anchors are aligned.
 */
const EPSILON = 0.5;

/**
 * Options for a lane — a horizontal band of nodes sharing a centre line.
 */
export interface LaneOptions {
  /**
   * Tracked label above the lane's first node.
   */
  label?: string;

  /**
   * Centre line of the lane's nodes — the one centre-line coordinate in
   * the API; every other `y` is a top edge.
   */
  centreY: number;

  /**
   * Node height within the lane.
   */
  h?: number;
}

/**
 * Options for a node.
 */
export interface NodeOptions {
  /**
   * Scene-unique id; defaults to the label.
   */
  id?: string;

  /**
   * Left edge in viewBox pixels — pair with {@link Scene.col} to snap to
   * the module.
   */
  x?: number;

  /**
   * Adopt another shape's horizontal placement — the alignment relation
   * that buys straight vertical edges.
   */
  under?: ShapeHandle;

  /**
   * Width in module columns.
   */
  span?: number;

  /**
   * Explicit width, overriding `span`.
   */
  w?: number;

  /**
   * Explicit height.
   */
  h?: number;

  /**
   * Top edge — required for nodes declared outside a lane.
   */
  y?: number;

  /**
   * Visual treatment.
   */
  variant?: NodeVariant;
}

/**
 * A lane handle: places nodes on its centre line.
 */
export interface Lane {
  /**
   * Declare a node on this lane.
   */
  node: (label: string, options?: NodeOptions) => ShapeHandle;
}

/**
 * Options for a labelled actor box.
 */
export interface ActorOptions {
  /**
   * Primary title.
   */
  title: string;

  /**
   * Secondary line under the title.
   */
  sub?: string;

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
  w?: number;

  /**
   * Height.
   */
  h?: number;

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
 * Options for a profile store card.
 */
export interface StoreOptions {
  /**
   * Primary name.
   */
  name: string;

  /**
   * Secondary metadata line.
   */
  meta: string;

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
  w?: number;

  /**
   * Height.
   */
  h?: number;

  /**
   * Lifecycle status.
   */
  status?: ProfileStatus;

  /**
   * Whether this is the live store.
   */
  active?: boolean;
}

/**
 * Options when restating a store's lifecycle in a step scene.
 */
export interface StatusOptions {
  /**
   * Whether the store is live in this step.
   */
  active?: boolean;
}

/**
 * Options for a boundary drawn around existing shapes.
 */
export interface BoundaryOptions {
  /**
   * Tracked label below the boundary's bottom-left corner.
   */
  label?: string;
}

/**
 * Options for freestanding labels and annotations.
 */
export interface TextOptions {
  /**
   * Anchor x.
   */
  x: number;

  /**
   * Anchor y (vertical centre).
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
}

/**
 * Options for a corner-pinned annotation note.
 */
export interface NoteOptions {
  /**
   * Which corner the note pins to.
   */
  corner: Corner;
}

/**
 * The scene authoring surface.
 */
export interface Scene {
  /**
   * Diagram width in viewBox pixels.
   */
  readonly width: number;

  /**
   * Diagram height in viewBox pixels.
   */
  readonly height: number;

  /**
   * Horizontal centre.
   */
  readonly cx: number;

  /**
   * Vertical centre.
   */
  readonly cy: number;

  /**
   * Left edge of the n-th module column (fractions snap to half-modules).
   */
  col: (n: number) => number;

  /**
   * Declare a lane.
   */
  lane: (options: LaneOptions) => Lane;

  /**
   * Declare a freestanding node.
   */
  node: (label: string, options: NodeOptions) => ShapeHandle;

  /**
   * Declare a labelled actor box.
   */
  actor: (id: string, options: ActorOptions) => ShapeHandle;

  /**
   * Declare a profile store card.
   */
  store: (id: string, options: StoreOptions) => ShapeHandle;

  /**
   * Restate a store's lifecycle — the per-step lever in walk-throughs.
   */
  status: (id: string, status: ProfileStatus, options?: StatusOptions) => void;

  /**
   * Draw a dashed boundary around existing shapes. The frame extends half a
   * module horizontally and a fixed pad vertically beyond its children.
   */
  boundary: (children: ShapeHandle[], options?: BoundaryOptions) => ShapeHandle;

  /**
   * Connect two shapes. Aligned shapes get straight connectors; others get
   * a single-bend orthogonal elbow.
   */
  edge: (
    from: ShapeHandle | string,
    to: ShapeHandle | string,
    options?: EdgeOptions
  ) => void;

  /**
   * Freestanding tracked label (names of places and states).
   */
  label: (text: string, options: TextOptions) => void;

  /**
   * Freestanding plain annotation (counts, costs, latencies).
   */
  text: (text: string, options: TextOptions) => void;

  /**
   * Corner-pinned annotation note.
   */
  note: (text: string, options: NoteOptions) => void;
}

interface EdgeItem {
  from: string;
  to: string;
  options: EdgeOptions;
}

interface LaneState {
  label?: string;
  centreY: number;
  h: number;
  firstNodeX?: number;
}

interface BoundaryItem {
  frame: Frame;
  label?: string;
}

/**
 * A deferred render call. Shapes retain as thunks over their shape objects
 * (so per-step mutation like `status()` is reflected at render), and adding
 * a new mark costs one scene method plus its emitter — no renderer changes.
 */
type RenderThunk = () => string;

interface SceneState {
  width: number;
  height: number;
  handles: Map<string, ShapeHandle>;
  boundaries: BoundaryItem[];
  shapes: RenderThunk[];
  cards: Map<string, CardShape>;
  edges: EdgeItem[];
  texts: RenderThunk[];
  lanes: LaneState[];
}

/**
 * A scene builder paired with the state it collects into.
 */
interface SceneBuild {
  /**
   * The authoring surface handed to a diagram's scene function.
   */
  scene: Scene;

  /**
   * The collected items, consumed by the renderers.
   */
  state: SceneState;
}

/**
 * Create an empty scene builder. Exposed for the renderers; scenes are
 * normally declared through {@link defineDiagram}.
 */
export const createScene = (width: number, height: number): SceneBuild => {
  const state: SceneState = {
    width,
    height,
    handles: new Map(),
    boundaries: [],
    shapes: [],
    cards: new Map(),
    edges: [],
    texts: [],
    lanes: [],
  };

  const register = (id: string, frame: Frame): ShapeHandle => {
    if (state.handles.has(id)) {
      throw new Error(`diagram scene: duplicate shape id "${id}"`);
    }
    const handle = {id, ...frame};
    state.handles.set(id, handle);
    return handle;
  };

  // Text must clear its frame — overflow fails the build rather than
  // rendering squashed. Mono metrics are exact (fixed-pitch), so the guard
  // has no false negatives.
  const guardWidth = (
    id: string,
    text: string,
    size: number,
    boxWidth: number
  ): void => {
    const width = measureMono(text, size);
    if (width > boxWidth - TEXT_PAD_X * 2) {
      throw new Error(
        `diagram scene: "${id}" text "${text}" is ${width}px — too wide for its ${boxWidth}px frame; widen the shape or shorten the copy`
      );
    }
  };

  // Containers must also be tall enough for their typeset rows — the
  // vertical counterpart of guardWidth.
  const guardHeight = (
    id: string,
    boxHeight: number,
    hasCorner: boolean,
    hasSub: boolean
  ): void => {
    const required = containerMinHeight(hasCorner, hasSub);
    if (boxHeight < required) {
      throw new Error(
        `diagram scene: "${id}" is ${boxHeight}px tall — its rows need at least ${required}px`
      );
    }
  };

  const placeNode = (
    label: string,
    options: NodeOptions,
    lane?: LaneState
  ): ShapeHandle => {
    const {id = label, span = NODE_SPAN, variant = "default", under} = options;
    const w = options.w ?? (under ? under.w : span * MODULE);
    const h = options.h ?? lane?.h ?? NODE_HEIGHT;
    const x = under ? under.x : options.x;
    if (x === undefined) {
      throw new Error(`diagram scene: node "${id}" needs \`x\` or \`under\``);
    }
    const y = lane ? lane.centreY - h / 2 : options.y;
    if (y === undefined) {
      throw new Error(`diagram scene: node "${id}" needs \`y\` outside a lane`);
    }
    if (lane && lane.firstNodeX === undefined) {
      lane.firstNodeX = x;
    }
    guardWidth(id, label, TEXT_SIZE_PRIMARY, w);
    const shape: NodeShape = {x, y, w, h, label, variant};
    state.shapes.push(() => renderNode(shape));
    return register(id, {x, y, w, h});
  };

  const resolve = (ref: ShapeHandle | string): ShapeHandle => {
    const handle =
      typeof ref === "string"
        ? state.handles.get(ref)
        : state.handles.get(ref.id);
    if (!handle) {
      const id = typeof ref === "string" ? ref : ref.id;
      throw new Error(`diagram scene: unknown shape "${id}"`);
    }
    return handle;
  };

  const scene: Scene = {
    width,
    height,
    cx: width / 2,
    cy: height / 2,

    col: (n) => n * MODULE,

    lane(options) {
      const lane: LaneState = {
        label: options.label,
        centreY: options.centreY,
        h: options.h ?? NODE_HEIGHT,
      };
      state.lanes.push(lane);
      return {
        node: (label, nodeOptions = {}) => placeNode(label, nodeOptions, lane),
      };
    },

    node: (label, options) => placeNode(label, options),

    actor(id, options) {
      const {w = ACTOR_WIDTH, h = ACTOR_HEIGHT} = options;
      guardWidth(id, options.title, TEXT_SIZE_PRIMARY, w);
      if (options.sub !== undefined) {
        guardWidth(id, options.sub, TEXT_SIZE_SECONDARY, w);
      }
      const shape: ActorShape = {
        x: options.x,
        y: options.y,
        w,
        h,
        title: options.title,
        sub: options.sub,
        align: options.align,
        dashed: options.dashed,
        badge: options.badge,
        spinner: options.spinner,
      };
      guardHeight(
        id,
        h,
        options.badge !== undefined || options.spinner === true,
        options.sub !== undefined
      );
      state.shapes.push(() => renderActor(shape));
      return register(id, shape);
    },

    store(id, options) {
      const {w = CARD_WIDTH, h = CARD_HEIGHT} = options;
      guardWidth(id, options.name, TEXT_SIZE_PRIMARY, w);
      guardWidth(id, options.meta, TEXT_SIZE_SECONDARY, w);
      guardHeight(id, h, true, true);
      const shape: CardShape = {
        x: options.x,
        y: options.y,
        w,
        h,
        name: options.name,
        meta: options.meta,
        status: options.status ?? "complete",
        active: options.active ?? false,
      };
      state.cards.set(id, shape);
      state.shapes.push(() => renderCard(shape));
      return register(id, shape);
    },

    status(id, status, options = {}) {
      const card = state.cards.get(id);
      if (!card) {
        throw new Error(`diagram scene: unknown store "${id}"`);
      }
      // Restate only what is named: activity is preserved unless the step
      // says otherwise.
      card.status = status;
      card.active = options.active ?? card.active;
    },

    boundary(children, options = {}) {
      if (children.length === 0) {
        throw new Error("diagram scene: boundary needs at least one child");
      }
      const left = Math.min(...children.map((c) => c.x)) - BOUNDARY_PAD_X;
      const right =
        Math.max(...children.map((c) => c.x + c.w)) + BOUNDARY_PAD_X;
      const top = Math.min(...children.map((c) => c.y)) - BOUNDARY_PAD_Y;
      const bottom =
        Math.max(...children.map((c) => c.y + c.h)) + BOUNDARY_PAD_Y;
      const frame = {x: left, y: top, w: right - left, h: bottom - top};
      state.boundaries.push({frame, label: options.label});
      return register(
        options.label ?? `boundary-${state.boundaries.length}`,
        frame
      );
    },

    edge(from, to, options = {}) {
      state.edges.push({from: resolve(from).id, to: resolve(to).id, options});
    },

    label(text, options) {
      state.texts.push(() =>
        renderTrackedLabel({
          text,
          x: options.x,
          y: options.y,
          anchor: options.anchor,
          ink: options.ink,
          centred: true,
        })
      );
    },

    text(text, options) {
      state.texts.push(() =>
        renderAnnotation({
          text,
          x: options.x,
          y: options.y,
          anchor: options.anchor,
          ink: options.ink,
          centred: true,
        })
      );
    },

    note(text, options) {
      const isEast = options.corner === "ne" || options.corner === "se";
      const isTop = options.corner === "ne" || options.corner === "nw";
      state.texts.push(() =>
        renderAnnotation({
          text,
          x: isEast ? width - NOTE_INSET : NOTE_INSET,
          y: isTop ? NOTE_TOP_Y : height - NOTE_BOTTOM_RISE,
          anchor: isEast ? "end" : "start",
          centred: true,
        })
      );
    },
  };

  return {scene, state};
};

type Side = "north" | "south" | "east" | "west";

interface ResolvedEdge {
  points: Point[];
  ink: Ink;
  dash: boolean;
  label?: string;
  labelStyle: EdgeLabelStyle;
  labelAt: Point;
  labelAnchor: TextAnchor;
}

const sideAnchorY = (shape: Frame, anchor: SideAnchor): number => {
  if (anchor === "upper") {
    return shape.y + shape.h / 3;
  }
  if (anchor === "lower") {
    return shape.y + (shape.h * 2) / 3;
  }
  return shape.y + shape.h / 2;
};

const centreX = (shape: Frame): number => shape.x + shape.w / 2;
const centreY = (shape: Frame): number => shape.y + shape.h / 2;

/**
 * Spread bookkeeping: how many centre-anchored edges already attach to a
 * given shape side, so later arrivals offset rather than stack.
 */
type SideUsage = Map<string, number>;

const spreadOffset = (
  usage: SideUsage,
  shapeId: string,
  side: Side,
  isCentred: boolean
): number => {
  if (!isCentred) {
    return 0;
  }
  const key = `${shapeId}:${side}`;
  const count = usage.get(key) ?? 0;
  usage.set(key, count + 1);
  return count * ANCHOR_SPREAD;
};

const resolveEdge = (
  edge: EdgeItem,
  handles: Map<string, ShapeHandle>,
  usage: SideUsage
): ResolvedEdge => {
  const source = handles.get(edge.from);
  const target = handles.get(edge.to);
  if (!source || !target) {
    throw new Error(
      `diagram scene: edge references unknown shape "${edge.from}" → "${edge.to}"`
    );
  }
  const {
    ink = "muted",
    dash = false,
    label,
    labelStyle = "text",
    route = "auto",
    via,
    enter = "centre",
    exit = "centre",
  } = edge.options;

  const finish = (
    points: Point[],
    labelAt: Point,
    labelAnchor: TextAnchor
  ): ResolvedEdge => ({
    points,
    ink,
    dash,
    label,
    labelStyle,
    labelAt: edge.options.labelAt ?? labelAt,
    labelAnchor: edge.options.labelAnchor ?? labelAnchor,
  });

  // Direct edges draw straight between the facing sides — the fan-out
  // treatment. Several can share an anchor and diverge, so they skip the
  // spread bookkeeping.
  if (route === "direct") {
    const headsEast = centreX(source) < centreX(target);
    const start = {
      x: headsEast ? source.x + source.w : source.x,
      y: sideAnchorY(source, exit),
    };
    const end = {
      x: headsEast ? target.x : target.x + target.w,
      y: sideAnchorY(target, enter),
    };
    return finish(
      [start, end],
      {x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 - EDGE_LABEL_GAP},
      "middle"
    );
  }

  // Vertically aligned shapes connect with a straight vertical edge.
  if (
    via === undefined &&
    Math.abs(centreX(source) - centreX(target)) < EPSILON
  ) {
    const x = centreX(source);
    const goesDown = centreY(source) < centreY(target);
    const sy = goesDown ? source.y + source.h : source.y;
    const ty = goesDown ? target.y : target.y + target.h;
    return finish(
      [
        {x, y: sy},
        {x, y: ty},
      ],
      {x: x + EDGE_LABEL_GAP, y: (sy + ty) / 2},
      "start"
    );
  }

  const goesEast = centreX(source) < centreX(target);
  const sourceEdgeX = goesEast ? source.x + source.w : source.x;
  const sy =
    sideAnchorY(source, exit) +
    spreadOffset(
      usage,
      source.id,
      goesEast ? "east" : "west",
      exit === "centre"
    );
  const targetEnterY = sideAnchorY(target, enter);

  // Aligned anchors connect flat; anything else steps out to a vertical run
  // and turns — the drawFeed rule, generalised. Spread offsets are assigned
  // in declaration order, and this flat check compares a spread-adjusted
  // source anchor against the target's unadjusted one — a second parallel
  // edge between the same aligned shapes therefore routes as a degenerate
  // elbow rather than a flat line. No shipped figure draws one; revisit if
  // that changes.
  if (via === undefined && Math.abs(sy - targetEnterY) < EPSILON) {
    const tx = goesEast ? target.x : target.x + target.w;
    const y =
      targetEnterY +
      spreadOffset(
        usage,
        target.id,
        goesEast ? "west" : "east",
        enter === "centre"
      );
    return finish(
      [
        {x: sourceEdgeX, y},
        {x: tx, y},
      ],
      {x: (sourceEdgeX + tx) / 2, y: y - EDGE_LABEL_GAP},
      "middle"
    );
  }

  const targetEdgeX = goesEast ? target.x : target.x + target.w;
  const bendX = via ?? (sourceEdgeX + targetEdgeX) / 2;

  // A bend inside the target's horizontal span enters vertically instead.
  if (bendX > target.x && bendX < target.x + target.w) {
    const fromBelow = sy > centreY(target);
    const endY = fromBelow ? target.y + target.h : target.y;
    return finish(
      [
        {x: sourceEdgeX, y: sy},
        {x: bendX, y: sy},
        {x: bendX, y: endY},
      ],
      {x: bendX + ELBOW_LABEL_GAP, y: sy},
      "start"
    );
  }

  const enteringEast = bendX > centreX(target);
  const ty =
    targetEnterY +
    spreadOffset(
      usage,
      target.id,
      enteringEast ? "east" : "west",
      enter === "centre"
    );
  const tx = enteringEast ? target.x + target.w : target.x;
  return finish(
    [
      {x: sourceEdgeX, y: sy},
      {x: bendX, y: sy},
      {x: bendX, y: ty},
      {x: tx, y: ty},
    ],
    {x: bendX + EDGE_LABEL_GAP, y: (sy + ty) / 2},
    "start"
  );
};

const renderBoundaryItem = ({frame, label}: BoundaryItem): string => {
  if (label === undefined) {
    return renderBoundary(frame);
  }
  const labelMarkup = renderTrackedLabel({
    text: label,
    x: frame.x,
    y: frame.y + frame.h + BOUNDARY_LABEL_DROP,
  });
  return renderBoundary(frame) + labelMarkup;
};

const renderEdgeLabel = (resolved: ResolvedEdge, label: string): string => {
  const placed = {
    text: label,
    x: resolved.labelAt.x,
    y: resolved.labelAt.y,
    anchor: resolved.labelAnchor,
    centred: true,
  };
  if (resolved.labelStyle === "label") {
    return renderTrackedLabel(placed);
  }
  return renderAnnotation(placed);
};

/**
 * Render a scene's collected items in paint order: boundaries beneath
 * everything, then shapes, then edges, then text.
 */
export const renderSceneBody = (
  state: SceneState,
  diagramId: string
): string => {
  const usage: SideUsage = new Map();

  const boundaries = state.boundaries.map(renderBoundaryItem).join("");

  const shapes = state.shapes.map((render) => render()).join("");

  const edges = state.edges
    .map((edge) => {
      const resolved = resolveEdge(edge, state.handles, usage);
      const stroke = renderEdge({
        points: resolved.points,
        ink: resolved.ink,
        dash: resolved.dash,
        diagramId,
      });
      if (!resolved.label) {
        return stroke;
      }
      return stroke + renderEdgeLabel(resolved, resolved.label);
    })
    .join("");

  const laneLabels = state.lanes
    .filter((lane) => lane.label !== undefined)
    .map((lane) =>
      renderTrackedLabel({
        text: lane.label ?? "",
        x: lane.firstNodeX ?? MODULE / 2,
        y: lane.centreY - LANE_LABEL_RISE,
      })
    )
    .join("");

  const texts = state.texts.map((render) => render()).join("");

  return boundaries + shapes + edges + laneLabels + texts;
};

/**
 * A static diagram definition: identity, logical size, accessible label,
 * and the scene that draws it.
 */
export interface DiagramDef {
  /**
   * Page-unique identifier (namespaces SVG defs and ARIA ids).
   */
  id: string;

  /**
   * Logical [width, height]. Design at the content width so the figure
   * maps 1:1 to CSS pixels in the article column.
   */
  size: [number, number];

  /**
   * Accessible name for the figure.
   */
  ariaLabel: string;

  /**
   * The scene declaration.
   */
  scene: (d: Scene) => void;
}

/**
 * Declare a static diagram.
 */
export const defineDiagram = (def: DiagramDef): DiagramDef => def;

/**
 * One step of a walk-through: control copy, caption copy, and the scene
 * overlay, travelling together as a single object.
 */
export interface StepDef {
  /**
   * Short label for the step's control chip.
   */
  tab: string;

  /**
   * Caption title (HTML allowed, matching the caption conventions).
   */
  title: string;

  /**
   * Caption note (HTML allowed).
   */
  note: string;

  /**
   * The step's scene, drawn after the base scene.
   */
  scene: (d: Scene) => void;
}

/**
 * A stepped walk-through definition.
 */
export interface SteppedDiagramDef {
  /**
   * Page-unique identifier.
   */
  id: string;

  /**
   * Logical [width, height].
   */
  size: [number, number];

  /**
   * Accessible name for the figure.
   */
  ariaLabel: string;

  /**
   * Scene shared by every step, drawn before the step's own scene.
   */
  base?: (d: Scene) => void;

  /**
   * The steps, in order.
   */
  steps: StepDef[];
}

/**
 * Declare a stepped walk-through.
 */
export const defineSteppedDiagram = (
  def: SteppedDiagramDef
): SteppedDiagramDef => def;

/**
 * Rendering options shared by both figure kinds.
 */
export interface RenderOptions {
  /**
   * Id of the figure's full text description, wired to aria-describedby.
   */
  describedBy?: string;

  /**
   * Overlay the module grid — a development aid for composing on the grid.
   */
  debugGrid?: boolean;
}

const renderDebugGrid = (width: number, height: number): string => {
  const lines: string[] = [];
  for (let x = MODULE / 2; x < width; x += MODULE / 2) {
    const isModule = x % MODULE === 0;
    lines.push(
      el("line", {
        class: isModule ? "mod" : "half",
        x1: x,
        y1: 0,
        x2: x,
        y2: height,
      })
    );
  }
  return el("g", {class: "d-grid", "aria-hidden": "true"}, ...lines);
};

const renderSvg = (
  id: string,
  size: [number, number],
  ariaLabel: string,
  options: RenderOptions,
  extraClass: string,
  body: string
): string => {
  const [width, height] = size;
  return el(
    "svg",
    {
      class: `diagram-svg${extraClass}`,
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": ariaLabel,
      "aria-describedby": options.describedBy,
    },
    el("defs", {}, renderMarkers(id)),
    options.debugGrid ? renderDebugGrid(width, height) : "",
    body
  );
};

/**
 * Render a static diagram to an SVG markup string.
 */
export const renderDiagram = (
  def: DiagramDef,
  options: RenderOptions = {}
): string => {
  const [width, height] = def.size;
  const {scene, state} = createScene(width, height);
  def.scene(scene);
  return renderSvg(
    def.id,
    def.size,
    def.ariaLabel,
    options,
    "",
    renderSceneBody(state, def.id)
  );
};

/**
 * Render a stepped walk-through: every step's scene in one SVG, as sibling
 * groups the stepper CSS toggles. Each step re-runs the base scene, so a
 * step is free to restate statuses and edges without inheriting stale state.
 */
export const renderSteppedDiagram = (
  def: SteppedDiagramDef,
  options: RenderOptions = {}
): string => {
  const [width, height] = def.size;
  const scenes = def.steps
    .map((step, index) => {
      const {scene, state} = createScene(width, height);
      def.base?.(scene);
      step.scene(scene);
      return el(
        "g",
        {class: "diagram-stepper__scene", "data-step": index},
        renderSceneBody(state, def.id)
      );
    })
    .join("");
  return renderSvg(
    def.id,
    def.size,
    def.ariaLabel,
    options,
    " diagram-stepper__svg",
    scenes
  );
};
