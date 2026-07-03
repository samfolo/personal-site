/**
 * The verify loop — faithful port of the canvas figure
 *
 * The submit-and-verify hand-off from "The price of a memory": the main
 * thread runs its sequence — search, read, reason, submit — and submitting
 * hands off to a verifier on its own thread, drawn inside a dashed process
 * boundary. A pass commits to the graph; a fail returns the critique to
 * the start of the thread, which tries again.
 *
 * One departure from the canvas original, forced by the module (the canvas
 * drew at 820 logical pixels; the column is 672): the verdict node folds
 * into the pass and fail edge labels that carried its meaning. The fail
 * return leaves the verifier westward at lane height and rises in the left
 * margin — the same feedback reading as the canvas's wrap-under path, in
 * less ink.
 */

import {defineDiagram} from "../lib/diagrams";

/**
 * Centre line of the main-thread lane.
 */
const MAIN_Y = 68;

/**
 * Centre line of the verifier lane. The drop from submit is deliberately
 * generous — the hand-off label must read as the edge's, biased toward
 * submit, not as a title floating above the verifier boundary.
 */
const VERIFIER_Y = 204;

/**
 * X of the fail edge's rising run, in the margin left of the thread.
 */
const FAIL_RUN_X = 16;

export const verifyLoop = defineDiagram({
  id: "verify-loop-sdk",
  size: [672, 288],
  ariaLabel:
    "The verify loop: the main thread searches, reads, reasons, and submits; a verifier on a separate thread reviews the submission. A pass commits to the graph; a fail returns the critique to the thread.",
  scene(d) {
    const main = d.lane({label: "main thread", centreY: MAIN_Y});
    const search = main.node("search", {x: d.col(0.5), span: 1.5});
    const read = main.node("read", {x: d.col(2.5), span: 1});
    const reason = main.node("reason", {x: d.col(4), span: 1.5});
    const submit = main.node("submit", {x: d.col(6), span: 1.5});

    const verifier = d.lane({centreY: VERIFIER_Y});
    const review = verifier.node("review", {under: submit});
    const commit = verifier.node("commit to graph", {
      x: d.col(8.5),
      span: 2.5,
      variant: "emphasis",
    });
    d.boundary([review, commit], {label: "verifier · separate thread"});

    d.edge(search, read);
    d.edge(read, reason);
    d.edge(reason, submit);
    // The label hugs submit's exit (a quarter of the drop down it), so it
    // groups with the edge rather than the boundary below.
    d.edge(submit, review, {
      ink: "fg",
      label: "hands off",
      labelStyle: "label",
      labelAt: {x: submit.x + submit.w / 2 + 8, y: submit.y + submit.h + 24},
    });
    d.edge(review, commit, {label: "pass", labelStyle: "label"});
    d.edge(review, search, {
      ink: "fg",
      label: "fail",
      labelStyle: "label",
      via: FAIL_RUN_X,
    });
  },
});
