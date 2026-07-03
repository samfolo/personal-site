---
name: drawing-diagrams
description: Authoring blog diagrams with the SVG diagram SDK. Consult when drawing a new figure, changing a scene, or extending the SDK's vocabulary. Covers the diagram's responsibility to the reader, the design contract, verification workflow, and extension principles.
---

# Drawing Diagrams

Authoring blog figures with the diagram SDK. The SDK source is the reference
documentation; this skill carries the judgement — what a figure owes the
reader, the contract the SDK enforces, and how to verify work.

British English throughout.

## When to Use

Before drawing a new figure, changing an existing scene, or extending the
SDK's vocabulary.

## Sources of Truth

- `src/lib/diagrams/` — the SDK. The `Scene` interface is the authoring
  API; module JSDoc is the documentation. Read it before drawing.
- `src/diagrams/` — every live scene, exported through its registry. These
  are the exemplars for structure and style; start from one.
- `/dev/diagrams` — dev-only preview of every registered figure, with a
  module-grid overlay and theme pinning via query params.

The SDK is the site's only diagram engine.

## The Responsibility of a Diagram

Readers judge a post by its figures. Every diagram carries the same brief:

- **Represent one idea, clearly.** A figure is an argument, not a feature
  tour — if it needs a paragraph to explain, recompose it.
- **Be faithful to the real system.** Draw what the code does, not what the
  changelog says. Verify against the source before drawing.
- **Look deliberate.** Composition on the module, balanced typesetting, and
  semantic ink are what separate considered from generated. The SDK
  enforces most of this; the author's job is composition and copy.

Restraint is the aesthetic. If a figure needs more than the vocabulary
offers, extend the vocabulary once — never improvise inside a scene.

## The Design Contract

What the SDK owns; compose with it, never around it:

- **Semantic ink.** The six theme colour tokens are the only paint, applied
  in CSS — which is what makes every figure re-theme with zero JavaScript.
  Scenes declare ink *roles* (primary data path, background work, state
  demanding attention), never colours.
- **Two text voices.** Tracked uppercase for names of places and states;
  small monospace for data — counts, costs, latencies. Never mixed.
- **The module.** Figures are designed at the content-column width on its
  12-column grid; nodes snap to columns, rows to the 8px grid. Alignment is
  declared as a relation between shapes, which is what buys straight edges.
- **Structural typesetting.** Text blocks centre themselves in the space
  their container affords, so spacing stays balanced at any size. Never
  nudge text with magic offsets in a scene.
- **Guards.** Copy that would overflow its frame fails the build with the
  measurement in the error, and the freestanding text layer is measured
  the same way — text leaving the canvas, overlapping a shape, crossing an
  edge, or colliding with other text fails with the geometry. Fix the
  composition or the copy; never soften a guard. The guards catch
  crossings, not crowding — near-misses are still found by eyes.
- **Refusal as robustness.** No text wrapping, no auto-layout, no runtime
  dependencies. Diagrams carry labels, not paragraphs.

## Verifying

- Iterate on `/dev/diagrams`: overlay the module grid, pin each theme.
  Screenshot and actually look — collisions, crowding, and imbalance are
  found by eyes, not tests.
- Check **every theme**; the highest-chroma one exposes ink mistakes.
- Every figure carries a full text description — the shell enforces it; the
  description should tell the whole story without the pixels.
- `npm run lint && npm run check && npm run fmt:check` before finishing.

## Extending the Vocabulary

- Prefer parameterising an existing primitive over adding a new one — the
  generalised container covers most boxed shapes.
- A genuinely new element follows the existing pattern: an emitter, a scene
  method, a stylesheet block. Read a current primitive end to end first and
  mirror its shape.
- Paint belongs in the stylesheet through semantic tokens; geometry belongs
  in the SDK's tokens module as documented constants, each with the
  reasoning for its value. A colour or size literal in an emitter is a
  defect.
- Measure text through the SDK's metrics, never by eye — sizing that can't
  be measured can't be guarded.
- Keep the TypeScript and CSS class vocabularies in lockstep: a class
  emitted without a rule, or a rule no emitter can produce, is drift.

## Checklist — Adding or Changing a Figure

- [ ] Scene faithful to the real system (read the source it depicts).
- [ ] Composed on the module; verified with the grid overlay.
- [ ] Copy fits (guards pass); labels use the right voice.
- [ ] Every theme screenshotted and eyeballed.
- [ ] Text description tells the whole story without the pixels.
- [ ] Registry export added; lint and check clean.
