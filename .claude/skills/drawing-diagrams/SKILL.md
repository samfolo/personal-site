---
name: drawing-diagrams
description: Authoring blog diagrams with the SVG diagram SDK. Consult when drawing a new figure, changing an existing scene, or extending the SDK's vocabulary. Covers the authoring API, the polish the SDK owns, verification workflow, and the heuristics for SVG-based components.
---

# Drawing Diagrams

Authoring figures with the SVG diagram SDK (`src/lib/diagrams/`). This is the
usage guide; architecture and both engines are documented in
[maintaining-design-system/DIAGRAMS.md](../maintaining-design-system/DIAGRAMS.md).

British English throughout.

## The responsibility of a diagram

Readers judge a post by its figures. Every diagram carries the same brief:

- **Represent one idea, clearly.** A figure is an argument, not a feature
  tour — if it needs a paragraph to explain, recompose it.
- **Be faithful to the real system.** Draw what the code does, not what the
  changelog says. Verify against the source before drawing.
- **Look deliberate.** Composition on the module, balanced typesetting, and
  semantic ink are what separate "considered" from "generated". The SDK
  enforces most of this; your job is the composition and the copy.

Restraint is the aesthetic: six semantic inks, two text voices (tracked
uppercase for names of places and states; small mono for data), one corner
grammar. If a figure needs more than the vocabulary offers, extend the
vocabulary once — never improvise inside a scene.

## Authoring a figure

One scene module in `src/diagrams/`, exported through `src/diagrams/index.ts`;
one component in the post:

```ts
export const verifyLoop = defineDiagram({
  id: "verify-loop-sdk",                  // page-unique
  size: [672, 288],                       // design at CONTENT_WIDTH (672)
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

```astro
<Diagram of={verifyLoop} caption="…">
  <Fragment slot="description">Full text alternative — required.</Fragment>
</Diagram>
```

Walk-throughs: `defineSteppedDiagram` + `<SteppedDiagram>`. A step is one
object (`tab`, `title`, `note`, `scene`); steps re-run the shared `base`
scene then their own, and `d.status(id, …)` restates a store's lifecycle.

Vocabulary: `node` (variants default/emphasis/muted/building), `actor`
(centred container; `badge`/`spinner` corner, `align`), `store` (lifecycle
card), `boundary`, `edge`, `label`, `text`, `note`. Coordinates: every
`x`/`y` is a left/top edge; a lane's `centreY` is the one centre-line
coordinate; `col(n)` snaps to the 56px module (fractions = half-modules).

## What the SDK owns — compose, don't fight

- **Layout.** Nodes on module columns; `under:` buys straight vertical
  edges; boundaries extend half a module beyond children; rows on the 8px
  grid. Aligned anchors route flat, others elbow; `via:` pins a bend;
  `route: "direct"` fans out; `enter: "upper" | "lower"` hits a store's
  thirds; parallel arrivals spread.
- **Typesetting.** Container text blocks centre in the space the corner row
  leaves free — balance is structural. Never nudge text with magic offsets
  in a scene.
- **Ink.** Declare roles (`ink: "fg"` for primary data paths, muted
  default, highlight for state demanding attention), never colours.
- **Guards.** Copy too wide, or a container too short, fails the build with
  the measurement. Fix the composition or the copy — never soften a guard.

## Verifying without breaking anything

- Iterate on `/dev/diagrams` (dev-only): `?grid=1` overlays the module,
  `?theme=teal|purple|charcoal` pins themes. Screenshot and actually look —
  collisions, crowding, and imbalance are found by eyes, not tests.
- Check **all four themes**; teal's coral foreground exposes ink mistakes.
- `npm run lint && npm run check && npm run fmt:check` before finishing.
- The legacy canvas engine (`src/scripts/diagrams/`, the three shipped
  figure components) is frozen — never route new work through it, and don't
  edit shipped scenes' copy while restyling.
- Every figure keeps a full `description` slot — the build enforces it.

## Extending the SDK — new element types

Three touches, in this order:

1. **Emitter** in `primitives.ts` — geometry from `tokens.ts` constants as
   attributes; text through `textEl` (escapes internally) and `track()`/
   `measureTracked` or `measureMono` for sizing; classes only, no inline
   paint. Boxed shapes should specialise `renderContainer` by parameters
   rather than adding emitters.
2. **Scene method** in `scene.ts` (~six lines): guard width/height, register
   the handle, push a render thunk.
3. **CSS block** in `src/styles/components/diagram.css` — a `.d-*` class
   painting exclusively with the six semantic tokens and the typography
   scale; ink modifiers must come from the shared `INK_CLASSES` vocabulary
   (`is-fg` / `is-highlight`) so TS and CSS cannot drift.

Heuristics for SVG-based components in this system:

- Paint in CSS, geometry in attributes — that split is what makes theming
  zero-JS; a `fill` or `stroke` literal in TS is a defect.
- CSS font sizes resolve to SVG user units, so the typography tokens scale
  with the figure; 12px is the deliberate diagram-only step in the scale.
- `dominant-baseline: central` for single-line vertical centring; typeset
  multi-line blocks from cap height and descender (`MONO_CAP_HEIGHT`,
  `MONO_DESCENDER`), not font-size guesses.
- Tracked labels bake spacing into the text (NBSP word gaps — SVG collapses
  ordinary whitespace runs).
- New geometry constants go in `tokens.ts` with a JSDoc stating their
  reasoning (the concentric badge rule is the model), aligned to the 8px
  grid or the module.
- No text wrapping, no auto-layout, no runtime dependencies — refusal is
  the robustness strategy; compose within it.

## Checklist — adding or changing a figure

- [ ] Scene faithful to the real system (read the source it depicts).
- [ ] Composed on the module; verified with `?grid=1`.
- [ ] Copy fits (guards pass); labels use the right voice.
- [ ] All four themes screenshotted and eyeballed.
- [ ] `description` slot tells the whole story without the pixels.
- [ ] Registry export added; `npm run lint && npm run check` clean.
