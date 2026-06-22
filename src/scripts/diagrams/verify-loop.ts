/**
 * Verify-loop diagram
 *
 * The main thread runs as a sequence of steps ending at `submit`. Submitting
 * hands off to a verifier that runs as its own thread (drawn inside a dashed
 * process boundary). A pass commits to the graph; a fail returns the critique
 * to the thread, which tries again.
 */

import {
  drawArrow,
  drawBoundary,
  drawElbow,
  drawLabel,
  drawNode,
  leftOf,
  mountDiagram,
  type Node,
  rightOf,
} from "./canvas";

const WIDTH = 820;
const HEIGHT = 300;

// Main thread: a sequence of turns.
const search: Node = {x: 24, y: 54, w: 92, h: 40, label: "search"};
const read: Node = {x: 140, y: 54, w: 72, h: 40, label: "read"};
const reason: Node = {x: 236, y: 54, w: 96, h: 40, label: "reason"};
const submit: Node = {x: 356, y: 54, w: 92, h: 40, label: "submit"};

// Verifier: its own thread, inside the process boundary.
const review: Node = {x: 356, y: 200, w: 92, h: 40, label: "review"};
const verdict: Node = {x: 480, y: 200, w: 92, h: 40, label: "verdict"};
const commit: Node = {
  x: 636,
  y: 200,
  w: 152,
  h: 40,
  label: "commit to graph",
  variant: "emphasis",
};

mountDiagram("[data-diagram='verify-loop']", {
  width: WIDTH,
  height: HEIGHT,
  draw: ({ctx, palette: p}) => {
    // Main thread.
    drawLabel(ctx, p.muted, "main thread", 24, 36);
    for (const node of [search, read, reason, submit]) {
      drawNode(ctx, p, node);
    }
    drawArrow(ctx, p.muted, ...rightOf(search), ...leftOf(read));
    drawArrow(ctx, p.muted, ...rightOf(read), ...leftOf(reason));
    drawArrow(ctx, p.muted, ...rightOf(reason), ...leftOf(submit));

    // Verifier process boundary; label right-aligned, clear of the hand-off.
    drawBoundary(ctx, p.rule, 300, 178, 508, 86);
    drawLabel(ctx, p.muted, "verifier · separate thread", 796, 166, "right");

    // Verifier thread.
    for (const node of [review, verdict, commit]) {
      drawNode(ctx, p, node);
    }
    drawArrow(ctx, p.muted, ...rightOf(review), ...leftOf(verdict));
    drawArrow(ctx, p.muted, ...rightOf(verdict), ...leftOf(commit));
    drawLabel(ctx, p.muted, "pass", 604, 210, "center");

    // Hand-off: submit pierces the boundary into the verifier.
    drawElbow(ctx, p.fg, [
      [402, 94],
      [402, 200],
    ]);
    drawLabel(ctx, p.muted, "hands off", 416, 150);

    // Fail: the verdict returns the critique to the thread.
    drawElbow(ctx, p.fg, [
      [526, 240],
      [526, 288],
      [12, 288],
      [12, 74],
      [24, 74],
    ]);
    drawLabel(ctx, p.muted, "fail", 540, 256);
  },
});
