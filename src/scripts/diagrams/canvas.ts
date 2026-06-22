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

const mountOne = (canvas: HTMLCanvasElement, diagram: Diagram): void => {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const render = (): void => {
    const cssWidth = canvas.clientWidth;
    if (cssWidth <= 0) {
      return;
    }
    const cssHeight = cssWidth * (diagram.height / diagram.width);
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    canvas.style.height = `${cssHeight}px`;

    const scale = (cssWidth / diagram.width) * dpr;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, diagram.width, diagram.height);

    diagram.draw({
      ctx,
      palette: readPalette(canvas),
      width: diagram.width,
      height: diagram.height,
    });
  };

  const resizeObserver = new ResizeObserver(render);
  resizeObserver.observe(canvas);

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

// =============================================================================
// Drawing primitives (logical coordinates)
// =============================================================================

const MONO = "13px CommitMono, ui-monospace, monospace";
const SMALL_MONO = "12px CommitMono, ui-monospace, monospace";
const LABEL = "600 11px Switzer, system-ui, sans-serif";

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
