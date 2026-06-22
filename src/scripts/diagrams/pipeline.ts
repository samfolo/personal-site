/**
 * Pipeline diagrams
 *
 * Two views of ingestion, one per tab. Both share the same shape: extract fans
 * out to one triage unit per candidate, which converge on a single relate unit
 * before the graph. The fan-out is identical — what differs is how each stage
 * runs, and that difference is carried by the per-stage cost annotations:
 *
 * One-shot: each stage is a single call.
 * Agentic:  each triage and relate unit is a durable thread — a loop of up to
 *           25 turns, then a verifier (up to 2 tries).
 */

import {
  drawArrow,
  type DrawContext,
  drawNode,
  drawText,
  leftOf,
  mountDiagram,
  type Node,
  rightOf,
} from "./canvas";

const WIDTH = 800;
const HEIGHT = 240;

const text: Node = {x: 24, y: 84, w: 64, h: 40, label: "text"};
const extract: Node = {x: 128, y: 84, w: 96, h: 40, label: "extract"};
const triage: Node[] = [
  {x: 328, y: 24, w: 104, h: 40, label: "triage"},
  {x: 328, y: 84, w: 104, h: 40, label: "triage"},
  {x: 328, y: 144, w: 104, h: 40, label: "triage"},
];
const relate: Node = {x: 520, y: 84, w: 104, h: 40, label: "relate"};
const graph: Node = {x: 696, y: 84, w: 80, h: 40, label: "graph"};

/**
 * What differs between the two views.
 */
interface Variant {
  fanLabel: string;
  total: string;
  extractCost: string;
  triageCost: string;
  relateCost: string;
}

const drawSkeleton = ({ctx, palette: p}: DrawContext, v: Variant): void => {
  for (const node of [text, extract, ...triage, relate, graph]) {
    drawNode(ctx, p, node);
  }

  drawArrow(ctx, p.muted, ...rightOf(text), ...leftOf(extract));
  for (const unit of triage) {
    drawArrow(ctx, p.muted, ...rightOf(extract), ...leftOf(unit));
    drawArrow(ctx, p.muted, ...rightOf(unit), ...leftOf(relate));
  }
  drawArrow(ctx, p.muted, ...rightOf(relate), ...leftOf(graph));

  drawText(ctx, p.muted, v.fanLabel, 380, 12, "center");
  drawText(ctx, p.emphasis, v.total, 776, 12, "right");

  drawText(ctx, p.muted, v.extractCost, 176, 140, "center");
  drawText(ctx, p.muted, v.triageCost, 380, 204, "center");
  drawText(ctx, p.muted, v.relateCost, 572, 140, "center");
};

mountDiagram("[data-diagram='pipeline-oneshot']", {
  width: WIDTH,
  height: HEIGHT,
  draw: (scene) =>
    drawSkeleton(scene, {
      fanLabel: "× n tasks",
      total: "≈ 8 calls · n = 6",
      extractCost: "1 call",
      triageCost: "1 call each",
      relateCost: "1 call",
    }),
});

mountDiagram("[data-diagram='pipeline-agentic']", {
  width: WIDTH,
  height: HEIGHT,
  draw: (scene) =>
    drawSkeleton(scene, {
      fanLabel: "× n threads",
      total: "≈ 15 threads · n = 6",
      extractCost: "1 call",
      triageCost: "≤ 25 turns + verifier",
      relateCost: "≤ 25 turns + verifier",
    }),
});
