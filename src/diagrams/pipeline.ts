/**
 * Ingestion pipelines
 *
 * Two views of ingestion sharing one skeleton: extract fans out to one
 * triage unit per candidate, the units converge on a single relate unit,
 * and the result lands in the graph. The fan-out is identical — what
 * differs is how each stage runs, and that difference is carried by the
 * per-stage cost annotations. One-shot: every stage is a single call.
 * Agentic: each triage and relate unit is a durable thread — a loop of up
 * to 25 turns, then a verifier (up to 2 tries).
 */

import {defineDiagram} from "../lib/diagrams";
import type {Scene, ShapeHandle} from "../lib/diagrams";

/**
 * Centre line of the main row (text, extract, relate, graph).
 */
const ROW_Y = 116;

/**
 * Top edges of the three stacked triage units.
 */
const TRIAGE_YS = [40, 96, 152];

/**
 * Y of the fan multiplier above the triage stack.
 */
const FAN_LABEL_Y = 24;

/**
 * Y of the per-stage cost annotations on the main row.
 */
const ROW_COST_Y = 152;

/**
 * Y of the triage cost annotation, below the stack.
 */
const TRIAGE_COST_Y = 208;

/**
 * What differs between the two views.
 */
interface Variant {
  /**
   * Fan multiplier above the triage stack.
   */
  fanLabel: string;

  /**
   * Headline total, pinned to the top-right corner.
   */
  total: string;

  /**
   * Cost under the extract stage.
   */
  extractCost: string;

  /**
   * Cost under the triage stack.
   */
  triageCost: string;

  /**
   * Cost under the relate stage.
   */
  relateCost: string;
}

const declareSkeleton = (d: Scene, v: Variant): void => {
  const row = d.lane({centreY: ROW_Y});
  const text = row.node("text", {x: d.col(0.5), span: 1});
  const extract = row.node("extract", {x: d.col(2), span: 1.5});
  const triage = TRIAGE_YS.map((y, index) =>
    d.node("triage", {id: `triage-${index}`, x: d.col(5), span: 1.5, y})
  );
  const relate = row.node("relate", {x: d.col(8), span: 1.5});
  const graph = row.node("graph", {x: d.col(10), span: 1.5});

  d.edge(text, extract);
  for (const unit of triage) {
    d.edge(extract, unit, {route: "direct"});
    d.edge(unit, relate, {route: "direct"});
  }
  d.edge(relate, graph);

  // Annotations centre on the shapes they describe, by handle.
  const middle = (shape: ShapeHandle): number => shape.x + shape.w / 2;
  const stack = middle(triage[0] ?? extract);
  d.text(v.fanLabel, {x: stack, y: FAN_LABEL_Y, anchor: "middle"});
  d.note(v.total, {corner: "ne", ink: "highlight"});
  d.text(v.extractCost, {x: middle(extract), y: ROW_COST_Y, anchor: "middle"});
  d.text(v.triageCost, {x: stack, y: TRIAGE_COST_Y, anchor: "middle"});
  d.text(v.relateCost, {x: middle(relate), y: ROW_COST_Y, anchor: "middle"});
};

export const oneShotPipeline = defineDiagram({
  id: "pipeline-oneshot",
  size: [672, 240],
  ariaLabel:
    "One-shot ingestion: extract fans out to one triage task per candidate, which converge on a single relate task before the knowledge graph. Each stage is a single call.",
  scene(d) {
    declareSkeleton(d, {
      fanLabel: "× n tasks",
      total: "≈ 8 calls · n = 6",
      extractCost: "1 call",
      triageCost: "1 call each",
      relateCost: "1 call",
    });
  },
});

export const agenticPipeline = defineDiagram({
  id: "pipeline-agentic",
  size: [672, 240],
  ariaLabel:
    "Agentic ingestion: the same fan-out — extract to one triage thread per candidate, converging on a single relate thread before the graph. Each triage and relate thread is a loop of up to 25 turns, then a verifier of up to 2 tries.",
  scene(d) {
    declareSkeleton(d, {
      fanLabel: "× n threads",
      total: "≈ 15 threads · n = 6",
      extractCost: "1 call",
      triageCost: "≤ 25 turns + verifier",
      relateCost: "≤ 25 turns + verifier",
    });
  },
});
