/**
 * Canvas diagram engine
 *
 * Shared scaffolding for the blog's workflow diagrams. Each diagram draws in a
 * fixed logical coordinate space; the engine scales that space to the
 * element's rendered width (preserving aspect ratio), handles HiDPI, reads the
 * active theme's semantic colours, and redraws on resize, theme change, font
 * load, and Astro page swaps.
 *
 * Diagrams are static schematics, so this uses the native Canvas 2D API rather
 * than p5 — there is nothing to animate, and the page should not pay for an
 * animation runtime.
 */

/**
 * The theme's semantic colours, read live from CSS custom properties so the
 * canvas tracks the active theme.
 */
export interface Palette {
  bg: string;
  fg: string;
  muted: string;
  rule: string;
  emphasis: string;
  highlight: string;
}

const readPalette = (el: Element): Palette => {
  const s = getComputedStyle(el);
  const get = (name: string): string => s.getPropertyValue(name).trim();
  return {
    bg: get("--bg"),
    fg: get("--fg"),
    muted: get("--muted"),
    rule: get("--rule"),
    emphasis: get("--emphasis"),
    highlight: get("--highlight"),
  };
};

/**
 * What a diagram's draw function receives. Coordinates are in the diagram's
 * logical space; the engine has already applied the device-pixel and
 * fit-to-width transform.
 */
export interface DrawContext {
  ctx: CanvasRenderingContext2D;
  palette: Palette;
  width: number;
  height: number;
}

/**
 * A diagram: its logical dimensions and how to draw it.
 */
export interface Diagram {
  width: number;
  height: number;
  draw: (scene: DrawContext) => void;
}

/**
 * Size the canvas to its rendered width (preserving the diagram's aspect
 * ratio), apply the HiDPI and fit-to-width transform, clear it, and return the
 * draw context. Returns null if the element isn't laid out yet.
 */
const prepareFrame = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): DrawContext | null => {
  const cssWidth = canvas.clientWidth;
  if (cssWidth <= 0) {
    return null;
  }
  const cssHeight = cssWidth * (height / width);
  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  canvas.style.height = `${cssHeight}px`;

  const scale = (cssWidth / width) * dpr;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, width, height);

  return {ctx, palette: readPalette(canvas), width, height};
};

/**
 * Redraw on the things that change a canvas's correct rendering: element
 * resize, theme (the `<html>` class), and web-font load.
 */
const wireRedraw = (canvas: HTMLCanvasElement, render: () => void): void => {
  new ResizeObserver(render).observe(canvas);

  const themeObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.attributeName === "class") {
        render();
        return;
      }
    }
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  // Fonts may not be ready on first paint; redraw once they are.
  if (document.fonts?.ready) {
    void document.fonts.ready.then(render);
  }
};

const mountOne = (canvas: HTMLCanvasElement, diagram: Diagram): void => {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  const render = (): void => {
    const scene = prepareFrame(canvas, ctx, diagram.width, diagram.height);
    if (scene) {
      diagram.draw(scene);
    }
  };
  wireRedraw(canvas, render);
  render();
};

/**
 * Mount a diagram onto every canvas matching the selector.
 */
export const mountDiagram = (selector: string, diagram: Diagram): void => {
  const mountAll = (): void => {
    document
      .querySelectorAll<HTMLCanvasElement>(selector)
      .forEach((canvas) => mountOne(canvas, diagram));
  };

  mountAll();
  document.addEventListener("astro:after-swap", mountAll);
};

/**
 * A diagram with discrete steps. `draw` receives the active step index, so one
 * canvas can render a walk-through frame by frame.
 */
export interface SteppedDiagram {
  width: number;
  height: number;
  draw: (scene: DrawContext, step: number) => void;
}

const activeStep = (radios: NodeListOf<HTMLInputElement>): number => {
  for (const radio of radios) {
    if (radio.checked) {
      const step = Number(radio.dataset.step);
      return Number.isFinite(step) ? step : 0;
    }
  }
  return 0;
};

/**
 * Mount a stepped diagram. The active step is derived from a group of radio
 * inputs (named `radioName`, each carrying a `data-step` index) scoped to the
 * canvas's containing `<figure>` — there is no stored step state, it is read
 * from the DOM on every render. `onStep` runs after each draw, for side
 * content such as a per-step note.
 */
export const mountSteppedDiagram = (
  canvasSelector: string,
  radioName: string,
  diagram: SteppedDiagram,
  onStep?: (step: number, root: ParentNode) => void
): void => {
  const mountAll = (): void => {
    document
      .querySelectorAll<HTMLCanvasElement>(canvasSelector)
      .forEach((canvas) => {
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return;
        }
        const root = canvas.closest("figure") ?? document;
        const radios = root.querySelectorAll<HTMLInputElement>(
          `input[name="${radioName}"]`
        );
        const render = (): void => {
          const scene = prepareFrame(
            canvas,
            ctx,
            diagram.width,
            diagram.height
          );
          if (!scene) {
            return;
          }
          const step = activeStep(radios);
          diagram.draw(scene, step);
          onStep?.(step, root);
        };
        radios.forEach((radio) => radio.addEventListener("change", render));
        wireRedraw(canvas, render);
        render();
      });
  };

  mountAll();
  document.addEventListener("astro:after-swap", mountAll);
};

// =============================================================================
// Drawing primitives (logical coordinates)
// =============================================================================

const MONO = "13px CommitMono, ui-monospace, monospace";
const SMALL_MONO = "12px CommitMono, ui-monospace, monospace";
const LABEL = "600 11px Switzer, system-ui, sans-serif";

/**
 * The article content column width in CSS pixels, derived from the design
 * system: `--container-max` (45rem) − 2 × `--container-px` (1.5rem) = 42rem.
 *
 * Diagrams are designed at this width so that, in the desktop column, the
 * canvas's logical space maps 1:1 to CSS pixels (scale === devicePixelRatio)
 * and renders crisp without supersampling. On narrower viewports the canvas
 * scales down and is treated as an image. Designing at any other width forces
 * a fractional downscale that lands strokes and text off the pixel grid.
 */
export const CONTENT_WIDTH = 672;

/** A 12-column module inside the content width: 672 / 12 = 56px (8px-aligned). */
export const GRID_COLUMNS = 12;
export const COLUMN = CONTENT_WIDTH / GRID_COLUMNS;

/** Snap to the start of the n-th grid column (0-indexed). */
export const col = (n: number): number => n * COLUMN;

const roundRectPath = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

/**
 * Visual treatment for a node.
 */
export type NodeVariant = "default" | "emphasis" | "muted";

/**
 * A node in a diagram: a rounded box with a centred monospace label.
 */
export interface Node {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  variant?: NodeVariant;
}

export const drawNode = (
  ctx: CanvasRenderingContext2D,
  p: Palette,
  node: Node
): void => {
  const border = node.variant === "emphasis" ? p.highlight : p.rule;
  let text = p.fg;
  if (node.variant === "emphasis") {
    text = p.emphasis;
  } else if (node.variant === "muted") {
    text = p.muted;
  }

  ctx.lineWidth = 1;
  ctx.strokeStyle = border;
  roundRectPath(ctx, node.x, node.y, node.w, node.h, 4);
  ctx.stroke();

  ctx.fillStyle = text;
  ctx.font = MONO;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(node.label, node.x + node.w / 2, node.y + node.h / 2 + 1);
};

/**
 * Centre point of a node's right edge.
 */
export const rightOf = (n: Node): [number, number] => [
  n.x + n.w,
  n.y + n.h / 2,
];

/**
 * Centre point of a node's left edge.
 */
export const leftOf = (n: Node): [number, number] => [n.x, n.y + n.h / 2];

const arrowhead = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  size = 6
): void => {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(
    x - size * Math.cos(angle - Math.PI / 6),
    y - size * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    x - size * Math.cos(angle + Math.PI / 6),
    y - size * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
};

/**
 * A straight connector between two points, with an arrowhead at the end.
 */
export const drawArrow = (
  ctx: CanvasRenderingContext2D,
  colour: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): void => {
  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  ctx.lineWidth = 1;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const back = 5;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - back * Math.cos(angle), y2 - back * Math.sin(angle));
  ctx.stroke();
  arrowhead(ctx, x2, y2, angle);
};

/**
 * An orthogonal (right-angled) connector through a series of points, with an
 * arrowhead at the final point. Corners are lightly rounded.
 */
export const drawElbow = (
  ctx: CanvasRenderingContext2D,
  colour: string,
  points: Array<[number, number]>,
  dash: boolean = false
): void => {
  if (points.length < 2) {
    return;
  }
  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  ctx.lineWidth = 1;
  ctx.setLineDash(dash ? [3, 3] : []);

  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length - 1; i++) {
    ctx.arcTo(
      points[i][0],
      points[i][1],
      points[i + 1][0],
      points[i + 1][1],
      6
    );
  }
  const [ex, ey] = points[points.length - 1];
  ctx.lineTo(ex, ey);
  ctx.stroke();
  ctx.setLineDash([]);

  const [px, py] = points[points.length - 2];
  const angle = Math.atan2(ey - py, ex - px);
  arrowhead(ctx, ex, ey, angle);
};

/**
 * A small uppercase label (lane names, edge labels).
 */
export const drawLabel = (
  ctx: CanvasRenderingContext2D,
  colour: string,
  text: string,
  x: number,
  y: number,
  align: CanvasTextAlign = "left"
): void => {
  ctx.fillStyle = colour;
  ctx.font = LABEL;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  const tracked = text.toUpperCase().split("").join(" ");
  ctx.fillText(tracked, x, y);
};

/**
 * Plain small annotation text (counts, costs) — not uppercased or tracked,
 * unlike {@link drawLabel}.
 */
export const drawText = (
  ctx: CanvasRenderingContext2D,
  colour: string,
  text: string,
  x: number,
  y: number,
  align: CanvasTextAlign = "left"
): void => {
  ctx.fillStyle = colour;
  ctx.font = SMALL_MONO;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
};

/**
 * A dashed boundary marking a separate process or sub-thread.
 */
export const drawBoundary = (
  ctx: CanvasRenderingContext2D,
  colour: string,
  x: number,
  y: number,
  w: number,
  h: number
): void => {
  ctx.strokeStyle = colour;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  roundRectPath(ctx, x, y, w, h, 6);
  ctx.stroke();
  ctx.setLineDash([]);
};

// =============================================================================
// Migration-diagram vocabulary
//
// Building blocks for the embedding-migration walk-through: labelled actor
// boxes (the read / write / worker sources) and a profile card (a lifecycle-
// stated store, marked active by an accent rail). One home for the
// technical-illustration vocabulary so it isn't re-derived per diagram.
// =============================================================================

/**
 * The lifecycle state an embedding profile actually holds: `building` while a
 * reindex fills it, `complete` once it has, `superseded` once a newer complete
 * profile has been activated. Note "active" is NOT a state here — the active
 * profile is *derived* as the highest-epoch complete one, so a card carries a
 * separate `active` flag rather than an "active" status.
 */
export type ProfileStatus = "building" | "complete" | "superseded";

const statusInk = (p: Palette, status: ProfileStatus): string =>
  status === "complete" ? p.fg : p.muted;

/**
 * Horizontal anchor for a badge: `x` is its left edge or its right edge.
 */
export type BadgeAlign = "left" | "right";

/**
 * A small uppercase status pill, outlined (not filled) to stay quiet against a
 * card. `x` is the left edge, or the right edge when `align` is "right".
 */
export const drawBadge = (
  ctx: CanvasRenderingContext2D,
  p: Palette,
  x: number,
  y: number,
  status: ProfileStatus,
  align: BadgeAlign = "left"
): void => {
  // Thin-space tracking, matching drawLabel (a full space spreads the letters too wide).
  const text = status.toUpperCase().split("").join(" ");
  ctx.font = LABEL;
  const padX = 8;
  const w = ctx.measureText(text).width + padX * 2;
  const h = 18;
  const left = align === "right" ? x - w : x;
  const ink = statusInk(p, status);

  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineWidth = 1;
  ctx.setLineDash(status === "building" ? [3, 3] : []);
  roundRectPath(ctx, left, y, w, h, h / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, left + padX, y + h / 2 + 0.5);
};

/**
 * An embedding profile drawn as a card: a lifecycle-stated store. The header
 * carries the model name and its geometry; a status badge sits top-right.
 * `active` (the live profile) is shown by the emphasised border and an
 * "active" label, NOT by the status — because active is derived (the
 * highest-epoch complete profile), not a state a profile holds. A superseded
 * card is dimmed.
 */
export interface ProfileCard {
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
  geometry: string;
  status: ProfileStatus;
  active?: boolean;
}

export const drawProfileCard = (
  ctx: CanvasRenderingContext2D,
  p: Palette,
  card: ProfileCard
): void => {
  ctx.save();
  if (card.status === "superseded") {
    ctx.globalAlpha = 0.45;
  }

  ctx.lineWidth = card.active ? 1.5 : 1;
  ctx.strokeStyle = card.active ? p.highlight : p.rule;
  ctx.setLineDash(card.status === "building" ? [4, 4] : []);
  roundRectPath(ctx, card.x, card.y, card.w, card.h, 8);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  const nameY = card.y + Math.round(card.h * 0.4);
  const dimsY = card.y + Math.round(card.h * 0.69);
  ctx.fillStyle = p.fg;
  ctx.font = MONO;
  ctx.fillText(card.name, card.x + 16, nameY);
  ctx.fillStyle = p.muted;
  ctx.font = SMALL_MONO;
  ctx.fillText(card.geometry, card.x + 16, dimsY);

  // Status chip shares the metadata row, right-aligned opposite the dimensions.
  drawBadge(ctx, p, card.x + card.w - 14, dimsY - 13, card.status, "right");

  if (card.active) {
    drawLabel(ctx, p.highlight, "active", card.x + card.w, card.y - 8, "right");
  }

  ctx.restore();
};

/**
 * A labelled box for a diagram actor (a read or write source, a worker). A
 * primary `title` over an optional secondary `sub`; `dashed` marks a
 * background or asynchronous actor.
 */
export interface LabeledBox {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string;
  dashed?: boolean;
}

export const drawLabeledBox = (
  ctx: CanvasRenderingContext2D,
  p: Palette,
  box: LabeledBox
): void => {
  ctx.lineWidth = 1;
  ctx.strokeStyle = p.rule;
  ctx.setLineDash(box.dashed ? [4, 4] : []);
  roundRectPath(ctx, box.x, box.y, box.w, box.h, 8);
  ctx.stroke();
  ctx.setLineDash([]);

  const cx = box.x + box.w / 2;
  ctx.textAlign = "center";
  if (box.sub) {
    ctx.fillStyle = p.fg;
    ctx.font = MONO;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(box.title, cx, box.y + box.h / 2 - 1);
    ctx.fillStyle = p.muted;
    ctx.font = SMALL_MONO;
    ctx.fillText(box.sub, cx, box.y + box.h / 2 + 15);
  } else {
    ctx.fillStyle = p.fg;
    ctx.font = MONO;
    ctx.textBaseline = "middle";
    ctx.fillText(box.title, cx, box.y + box.h / 2);
  }
};
