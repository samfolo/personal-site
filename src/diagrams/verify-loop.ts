/**
 * The verify loop, composed on the module
 *
 * The SDK's static exemplar: a main-thread lane, a verifier boundary on a
 * second lane, and edges declared as relations. `under` alignments are what
 * buy the straight hand-off and pass edges; the fail edge routes through
 * the free column between claim and draft.
 */

import {defineDiagram} from "../lib/diagrams";

/**
 * Centre line of the main-thread lane.
 */
const MAIN_Y = 68;

/**
 * Centre line of the verifier lane.
 */
const VERIFIER_Y = 196;

export const verifyLoop = defineDiagram({
  id: "verify-loop-sdk",
  size: [672, 288],
  ariaLabel:
    "The verify loop: claims drafted on the main thread are handed off to a verifier on a separate thread; passes publish, fails return for redrafting.",
  scene(d) {
    const main = d.lane({label: "main thread", centreY: MAIN_Y});
    const claim = main.node("claim", {x: d.col(1)});
    const draft = main.node("draft", {x: d.col(5), variant: "emphasis"});
    const publish = main.node("publish", {x: d.col(9)});

    const verifier = d.lane({centreY: VERIFIER_Y});
    const verify = verifier.node("verify", {under: draft});
    const judge = verifier.node("judge", {under: publish});
    d.boundary([verify, judge], {label: "verifier · separate thread"});

    d.edge(claim, draft);
    d.edge(verify, judge);
    d.edge(draft, verify, {dash: true, label: "hand-off"});
    d.edge(judge, publish, {label: "pass"});
    d.edge(verify, draft, {dash: true, label: "fail", via: d.col(4)});

    d.note("p95 · 140 ms", {corner: "ne"});
  },
});
