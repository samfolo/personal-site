/**
 * The verify loop
 *
 * The submit-and-verify hand-off from "The price of a memory": the main
 * thread runs its sequence — search, read, reason, submit — and submitting
 * hands off to a verifier on its own thread, drawn inside a dashed process
 * boundary. The verifier reviews and reaches a verdict; a pass commits to
 * the graph, a fail returns the critique to the start of the thread.
 *
 * The terminal node is the graph itself (the pipeline figures' destination
 * vocabulary), placed OUTSIDE the verifier boundary — the pass edge
 * visibly crosses the boundary to commit, which is what committing is. The
 * fail edge takes the `return` route: south out of the verdict, along the
 * bottom rail, and up the left margin into the start of the thread.
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

export const verifyLoop = defineDiagram({
  id: "verify-loop",
  size: [672, 304],
  ariaLabel:
    "The verify loop: the main thread searches, reads, reasons, and submits; a verifier on a separate thread reviews the submission and reaches a verdict. A pass commits to the graph; a fail returns the critique to the thread.",
  scene(d) {
    const main = d.lane({label: "main thread", centreY: MAIN_Y});
    const search = main.node("search", {x: d.col(0.5), span: 1.5});
    const read = main.node("read", {x: d.col(2.5), span: 1});
    const reason = main.node("reason", {x: d.col(4), span: 1.5});
    const submit = main.node("submit", {x: d.col(6), span: 1.5});

    const verifier = d.lane({centreY: VERIFIER_Y});
    const review = verifier.node("review", {under: submit});
    const verdict = verifier.node("verdict", {x: d.col(8), span: 1.5});
    d.boundary([review, verdict], {label: "verifier · separate thread"});

    // The graph sits outside the boundary: a pass leaves the verifier —
    // that crossing is the commit.
    const graph = verifier.node("graph", {
      x: d.col(10.5),
      span: 1,
      variant: "emphasis",
    });

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
    d.edge(review, verdict);
    d.edge(verdict, graph, {label: "pass", labelStyle: "label"});
    d.edge(verdict, search, {
      ink: "fg",
      route: "return",
      label: "fail",
      labelStyle: "label",
      labelAt: {x: 24, y: 170},
    });
  },
});
