/**
 * One-shot ingestion pipeline — an SDK proving ground
 *
 * A fresh composition (not a port) in the flowchart shape the pipeline
 * figures use: a stage fans out to parallel workers, converges, and lands
 * in the graph. Exercises direct-routed fan-out edges, half-module column
 * placement, per-column annotations, and the corner note.
 */

import {defineDiagram} from "../lib/diagrams";

/**
 * Top edge of the centre row (extract, the middle worker, relate, graph).
 */
const ROW_Y = 100;

/**
 * Top edges of the three stacked triage workers.
 */
const TRIAGE_YS = [32, 100, 168];

export const oneShotPipeline = defineDiagram({
  id: "one-shot-pipeline",
  size: [672, 240],
  ariaLabel:
    "One-shot ingestion: extract fans out to one triage task per candidate, which converge on a single relate task before the knowledge graph. Each stage is a single call.",
  scene(d) {
    const extract = d.node("extract", {x: d.col(0.5), y: ROW_Y});
    const triage = ["triage · 1", "triage · 2", "triage · n"].map(
      (label, index) =>
        d.node(label, {x: d.col(3.5), y: TRIAGE_YS[index] ?? ROW_Y})
    );
    const relate = d.node("relate", {x: d.col(6.5), y: ROW_Y});
    const graph = d.node("graph", {
      x: d.col(9.5),
      y: ROW_Y,
      variant: "emphasis",
    });

    for (const worker of triage) {
      d.edge(extract, worker, {route: "direct"});
      d.edge(worker, relate, {route: "direct"});
    }
    d.edge(relate, graph);

    d.label("one-shot ingestion", {x: 28, y: 24});
    d.text("1 call", {x: 84, y: 156, anchor: "middle"});
    d.text("1 call each", {x: 252, y: 224, anchor: "middle"});
    d.text("1 call", {x: 420, y: 156, anchor: "middle"});
    d.note("≈ 8 calls / run", {corner: "ne"});
  },
});
