/**
 * Diagram SDK
 *
 * Declarative, build-time SVG diagrams for the blog. Scenes are authored as
 * shapes and relations (lanes, columns, `under` alignments, edges by
 * handle); the SDK owns the polish — module snapping, routing, anchor
 * spreading, label placement — and renders classed SVG that re-themes
 * through the design system's semantic tokens with zero client JavaScript.
 *
 * Authoring guidance: `.claude/skills/drawing-diagrams/SKILL.md`. This
 * module's JSDoc is the API reference; the scenes in `src/diagrams/` are
 * the exemplars.
 */

export {
  defineDiagram,
  defineSteppedDiagram,
  renderDiagram,
  renderSteppedDiagram,
} from "./scene";
export type {
  DiagramDef,
  Lane,
  RenderOptions,
  Scene,
  StepDef,
  SteppedDiagramDef,
} from "./scene";
export type {
  Corner,
  EdgeOptions,
  Ink,
  NodeVariant,
  ProfileStatus,
  ShapeHandle,
} from "./types";
export {CONTENT_WIDTH, GRID_COLUMNS, MODULE} from "./tokens";
