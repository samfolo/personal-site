# Canvas Diagrams

How the blog's technical diagrams are built. They are static schematics drawn
with the **native Canvas 2D API** — not a library. p5 drives the hero Boids but
is ~1MB and must not enter blog bundles; D3 / Mermaid are not installed. A
diagram is treated like an image: it shrinks to fit on mobile and users zoom.

British English throughout.

## When to use

Read this before adding or changing a blog diagram, or touching
`src/scripts/diagrams/` or `src/components/blog/*.astro` diagram components.

## Architecture

Two layers:

- **The engine** — `src/scripts/diagrams/canvas.ts`. Owns everything generic:
  the fit-to-width + HiDPI transform, reading the live theme palette from CSS
  custom properties, and redrawing on resize, theme change (`MutationObserver`
  on the `<html>` class), web-font load, and `astro:after-swap`. Per-diagram
  scripts must NOT re-implement any of this.
- **Per-diagram scripts** — e.g. `migration.ts`, `pipeline.ts`,
  `verify-loop.ts`. They carry only scene composition: node positions, phase
  data, copy, and genuinely one-off helpers. No engine logic.

### The width contract

`CONTENT_WIDTH = 672` (in `canvas.ts`) is the article content-column width,
derived as `--container-max` (45rem) − 2 × `--container-px` (1.5rem) = 42rem.
Design a diagram at this width so, in the desktop column, the canvas maps 1:1 to
CSS pixels (scale === devicePixelRatio) and renders crisp without supersampling.
A 12-column / 56px module (`GRID_COLUMNS`, `COLUMN`, `col(n)`) sits inside it for
snapping. Aspect ratios are per-diagram content dimensions (e.g. `672/320`,
`800/240`, `820/300`) — they are NOT design tokens; do not try to tokenise them.

### Mount points

- `mountDiagram(selector, diagram)` — a static diagram.
- `mountSteppedDiagram(selector, radioName, diagram, onStep?)` — a stepped
  walk-through. The active step is derived from a group of `<input type="radio"
  name=…>` each carrying `data-step`; there is no stored step state. `onStep`
  runs after each draw for side content (the per-step `[data-step-title]` /
  `[data-step-note]` caption).

### Primitive vocabulary (canvas.ts)

Reuse before adding: `drawNode` (+ `NodeVariant`), `drawArrow`, `drawElbow`,
`drawLabel` (tracked uppercase) vs `drawText` (plain small text), `drawBoundary`,
`drawBadge`, `drawProfileCard`, `drawLabeledBox`, and the `rightOf`/`leftOf`
edge helpers. Status/variant treatments must carry real meaning (active vs
building vs superseded), never arbitrary brightness.

### Fonts are a token-sync hazard

`ctx.font` is a CSS shorthand string and **cannot read custom properties**, so
the `MONO` / `SMALL_MONO` / `LABEL` constants in `canvas.ts` hardcode the
typography token values by hand — exactly the hazard documented for Satori (OG
images). They MUST mirror `src/styles/tokens/typography.css` (`--font-mono`,
`--font-sans`, the type scale, `--font-semibold`). When a font or the scale
changes, edit these constants too. (`SMALL_MONO`'s 12px is a deliberate
diagram-only step between the 11px and 13px tokens.)

## Component shell convention

Each diagram is a self-contained Astro component (`src/components/blog/`) that:

- wraps a `<figure class="not-prose diagram-figure">` (shared margin);
- renders `<canvas data-diagram="…" role="img" aria-label="…"
  aria-describedby="…-desc">`;
- carries a **full** visually-hidden text description in a `<div class="diagram-desc"
  id="…-desc">` — a canvas (and any JS-injected step copy) is opaque to assistive
  tech and to non-rendering crawlers, so this is the text alternative;
- uses `class="diagram-caption"` for muted multi-line captions/notes (per-element
  margins stay local);
- loads its renderer with `<script src="../../scripts/diagrams/<name>.ts">`.

The shared `.diagram-figure` / `.diagram-caption` / `.diagram-desc` classes live
in `src/styles/components/diagram.css` (components layer). Tab/step state is
CSS-only (radio-driven), consistent with the site's minimal-JS posture.

## Adding a diagram — checklist

- [ ] Design at `CONTENT_WIDTH` (or a width that downscales cleanly to the pixel grid); snap layout to the 12-column module where sensible.
- [ ] Reuse existing primitives before adding new ones; route any new font usage through the shared `MONO`/`SMALL_MONO`/`LABEL` constants, never a fresh literal.
- [ ] Keep the per-diagram script to scene data + copy; leave generic engine logic in `canvas.ts`.
- [ ] Component shell: `figure.not-prose.diagram-figure`, `canvas role="img"` + `aria-label` + `aria-describedby`, a full `.diagram-desc` description, `.diagram-caption` for captions, the `<script>` tag.
- [ ] Verify across themes; screenshot via the dev server and iterate (see [blog-diagram-approach memory] / the owner's process — expect to go back and forth).
- [ ] Run `npm run lint` and `npm run check`.

See also [COMPONENT_DESIGN.md](./COMPONENT_DESIGN.md) and [SKILL.md](./SKILL.md).
