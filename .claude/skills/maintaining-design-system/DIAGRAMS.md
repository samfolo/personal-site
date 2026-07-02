# Diagrams

How the blog's technical diagrams are built. Two engines coexist:

- **The SVG diagram SDK** (`src/lib/diagrams/`) — declarative scenes rendered
  to SVG at build time. **All new diagrams use this.**
- **The legacy Canvas 2D engine** (`src/scripts/diagrams/canvas.ts`) — drives
  the three figures shipped before the SDK existed (pipeline, verify-loop,
  migration). Maintained, not extended.

No diagram library either way: p5 drives the hero Boids but is ~1MB and must
not enter blog bundles; D3 / Mermaid / React Flow are not installed. A diagram
is treated like an image: it shrinks to fit on mobile and users zoom.

British English throughout.

## When to use

Read this before adding or changing a blog diagram, or touching
`src/lib/diagrams/`, `src/diagrams/`, `src/scripts/diagrams/`, or the
`src/components/blog/*` diagram components. For day-to-day figure authoring
(the API, verification workflow, and extension recipe), the
[drawing-diagrams skill](../drawing-diagrams/SKILL.md) is the terse guide;
this document is the architecture reference.

## The SVG diagram SDK

### Architecture

| Concern | Path |
|---|---|
| SDK core (tokens, metrics, primitives, scene builder, renderers) | `src/lib/diagrams/` |
| Scene definitions (one module per figure) + registry | `src/diagrams/` |
| Figure shells | `src/components/blog/Diagram.astro`, `SteppedDiagram.astro` |
| Vocabulary CSS (`.d-*` classes, stepper control, figure shell) | `src/styles/components/diagram.css` |
| Dev preview | `/dev/diagrams` (`src/pages/dev/diagrams.astro`, 404 in production) |

A scene declares shapes and relations; the SDK owns the polish. Rendering
happens server-side to classed SVG markup — geometry as attributes, **all
paint through the six semantic colour tokens and the typography tokens** in
`diagram.css`. Theme changes resolve in CSS with zero client JavaScript; the
canvas engine's redraw machinery and hand-mirrored font constants do not
exist here. Font sizes in CSS resolve to SVG user units, so type scales with
the figure.

### Authoring

```ts
export const verifyLoop = defineDiagram({
  id: "verify-loop-sdk",          // page-unique: namespaces markers + ARIA ids
  size: [672, 288],               // one source of truth for dimensions
  ariaLabel: "…",
  scene(d) {
    const main = d.lane({label: "main thread", centreY: 68});
    const claim = main.node("claim", {x: d.col(1)});
    const draft = main.node("draft", {x: d.col(5), variant: "emphasis"});
    const verify = d.lane({centreY: 196}).node("verify", {under: draft});
    d.boundary([verify], {label: "verifier · separate thread"});
    d.edge(claim, draft);
    d.edge(draft, verify, {dash: true, label: "hand-off"}); // aligned ⇒ straight
  },
});
```

Coordinate convention: every `x`/`y` is a left/top edge; a lane's `centreY`
is the API's one centre-line coordinate.

In the post (or any page):

```astro
<Diagram of={verifyLoop} caption="…">
  <Fragment slot="description">Full text alternative…</Fragment>
</Diagram>
```

Stepped walk-throughs use `defineSteppedDiagram` — a step is **one object**
(`tab`, `title`, `note`, `scene`) and `<SteppedDiagram of={…}>` renders the
CSS-only chip stepper, every step's scene, and every step's caption as real
DOM (crawlable, reserved height, no reflow). Steps re-run the shared `base`
scene, then their own; `d.status(id, …)` restates a store's lifecycle per
step.

### What the SDK owns (don't fight it per scene)

- **Ink roles.** Primary data paths `ink: "fg"`; background/async work muted
  (the default); attention-demanding state highlight; frames take `--rule`
  via CSS. Declared semantically per edge, never picked per shape.
- **The module.** `col(n)` snaps to 56px columns (fractions give
  half-modules); `under:` declares vertical alignment — which is what buys
  straight edges; boundaries extend half a module beyond their children;
  design rows on the 8px grid. Pass `debugGrid` (or `/dev/diagrams?grid=1`)
  to see the module while composing.
- **Routing.** Aligned anchors connect flat; anything else steps out to a
  vertical run and turns (single-bend orthogonal elbows, r6 corners). A
  `via:` x pins the bend; a bend inside the target's span enters vertically.
  Several centre-anchored edges on one side spread rather than stack.
  Semantic side anchors: `enter: "upper" | "lower"` (reads enter a store's
  upper third, writes its lower). `route: "direct"` draws a straight line
  between facing sides — the fan-out treatment, where several edges share an
  anchor and diverge (see the one-shot pipeline scene).
- **Label grammar.** Tracked uppercase (`d.label`, `labelStyle: "label"`)
  for names of places and states; small mono (`d.text`, default edge labels)
  for data. Tracking is baked into the text (word gaps survive SVG
  whitespace collapsing via NBSP — see `metrics.ts`).
- **Geometry tokens.** Radii (node 4 / boundary 6 / card 8), dash rhythms
  (3,3 connectors; 4,4 containers and building frames), arrowhead 6, badge
  metrics live in `src/lib/diagrams/tokens.ts` — the diagram-geometry home,
  deliberately not CSS custom properties, so the site's token files stay
  clean. The badge nests concentrically into a card's top-right corner
  (badge radius = card radius − inset).
- **The container.** Actors and store cards are one generalised container
  (`renderContainer` in primitives): a framed box with an optional corner
  element in its top row (badge or spinner), a title, and an optional sub
  line, with `align`, `dashed`, `emphasis`, and `dim` as the parameters.
  The text block is centred in the area the corner row leaves free, so the
  gap above the caps always equals the gap below the descender — balance is
  structural, at any height. The top-right corner carries one grammar:
  badges, spinners, and the ACTIVE label all nest there with the same
  inset. New boxed element types specialise the container by parameters,
  not by new emitters.
- **Text measurement and overflow.** Badges self-size through the Switzer
  cap-width table in `metrics.ts` (build-time rendering has no
  `measureText`). Mono text is measured exactly (fixed-pitch), and every
  node label, actor title/sub, and card name/meta is guarded at declaration
  — width and height: copy that would overflow its frame, or a container
  too short for its rows, **fails the build** with the measurement in the
  message. There is deliberately no text wrapping: diagrams carry labels,
  not paragraphs.
- **Adding a new mark.** Three touches: an emitter in `primitives.ts`, a
  scene method that guards + registers + pushes its render thunk
  (~six lines in `scene.ts`), and a `.d-*` class block in `diagram.css`.
  Shapes retain as render thunks in one list, so no renderer changes.

### Registration

One scene module in `src/diagrams/`, exported through `src/diagrams/index.ts`.
Dimensions, steps, chip labels, and caption copy all live in the definition —
the shells and the dev preview read them; nothing is duplicated. Diagram ids
must be page-unique.

### Adding an SDK diagram — checklist

- [ ] Design at `CONTENT_WIDTH` (672); snap to the module (`col(n)`, `under:`), rows on the 8px grid; verify with `/dev/diagrams?grid=1`.
- [ ] Scene module in `src/diagrams/`, exported from the registry.
- [ ] Reuse the vocabulary (node, actor, store, boundary, badge, label, text, note) before inventing shapes; variants must carry meaning.
- [ ] `<Diagram>` / `<SteppedDiagram>` in the post with a full `description` slot (build fails without one).
- [ ] Verify across themes on `/dev/diagrams?theme=…`; screenshot and iterate.
- [ ] `npm run lint`, `npm run check`, `npm run fmt:check`.

## The legacy Canvas 2D engine

Kept for the three shipped figures; do not add new diagrams here.

- **The engine** — `src/scripts/diagrams/canvas.ts`. Owns everything generic:
  the fit-to-width + HiDPI transform, reading the live theme palette from CSS
  custom properties, and redrawing on resize, theme change (`MutationObserver`
  on the `<html>` class), web-font load, and `astro:after-swap`.
- **Per-diagram scripts** — `migration.ts`, `pipeline.ts`, `verify-loop.ts`:
  scene composition only (positions, phase data, copy).
- **The width contract:** `CONTENT_WIDTH = 672` = the article column;
  a 12-column / 56px module (`col(n)`) sits inside it. Aspect ratios are
  per-diagram, not tokens.
- **Fonts are a token-sync hazard:** the `MONO` / `SMALL_MONO` / `LABEL`
  constants hardcode typography-token values (`ctx.font` cannot read custom
  properties) and must be kept in step with
  `src/styles/tokens/typography.css`. The SDK does not have this hazard.
- **Mount points:** `mountDiagram(selector, diagram)` and
  `mountSteppedDiagram(selector, radioName, diagram, onStep?)` (radio-driven,
  no stored step state).
- **Component shells** follow the documented convention: `figure.not-prose.
  diagram-figure`, `canvas role="img"` + `aria-label` + `aria-describedby`, a
  full `.diagram-desc` description, `.diagram-caption` captions, and the
  per-diagram `<script>` tag.
- **The export route** `src/pages/export/[diagram].astro` (dev-only)
  screenshots canvas figures into static images; registering a canvas diagram
  touches its `ASPECT` map and body. SDK figures are plain SVG in the page —
  an SDK-aware export surface is future work.

See also [COMPONENT_DESIGN.md](./COMPONENT_DESIGN.md) and [SKILL.md](./SKILL.md).
