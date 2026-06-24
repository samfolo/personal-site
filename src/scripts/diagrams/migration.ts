/**
 * Zero-downtime embedding-migration walk-through
 *
 * Reads and writes ride the active profile A while a reindex worker fills a new
 * profile B in the background, then a single state change makes B active.
 *
 * Faithful to the implementation: B is filled solely by the worker re-deriving
 * the backlog (the items still missing a B-embedding) — there is no dual-write.
 * New writes keep landing only in A and simply reappear in that backlog, so B
 * chases a moving target. The drain happens at the flip (a brief lock).
 *
 * Geometry is proportional (unit X). Both columns span 7X: on the left, Reads
 * (2X) and Writes (2X) with a 3X gap; on the right, profiles A and B (3X each)
 * with a 1X gap. Reads aligns with A's top, Writes with B's bottom, so the read
 * path is flat to A and the write path flat to B; the crossing path in any
 * phase is a right-angle elbow that steps out horizontally before it turns.
 */

import {
  CONTENT_WIDTH,
  drawArrow,
  type DrawContext,
  drawElbow,
  drawLabel,
  drawLabeledBox,
  drawProfileCard,
  mountSteppedDiagram,
  type ProfileStatus,
} from "./canvas";

const WIDTH = CONTENT_WIDTH;
const HEIGHT = 320;

const X = 28;
const TOP = 28;
const BOX_RIGHT = 174;
const PROFILE_LEFT = 400;
const PROFILE_W = 240;
const BEND_X = (BOX_RIGHT + PROFILE_LEFT) / 2;
const LINK_X = 520;

// Left column: Reads (2X) top, 3X gap, Writes (2X) bottom — span 7X.
const READS = {x: 24, y: TOP, w: 150, h: 2 * X};
const WRITES = {x: 24, y: TOP + 5 * X, w: 150, h: 2 * X};

// Right column: profiles A and B (3X) with a 1X gap — span 7X.
const PROFILE_A = {x: PROFILE_LEFT, y: TOP, w: PROFILE_W, h: 3 * X};
const PROFILE_B = {x: PROFILE_LEFT, y: TOP + 4 * X, w: PROFILE_W, h: 3 * X};
const GAP_MID = PROFILE_A.y + PROFILE_A.h + X / 2;
const B_BOTTOM = PROFILE_B.y + PROFILE_B.h;

// Same height as the Reads/Writes boxes — it shares their title+sub structure.
const WORKER = {x: 205, y: B_BOTTOM + X, w: 180, h: 2 * X};

type ActiveProfile = "A" | "B";

type WorkerLink = "backfill" | "index" | null;

interface Phase {
  aStatus: ProfileStatus;
  showB: boolean;
  bStatus: ProfileStatus;
  active: ActiveProfile;
  worker: string | null;
  link: WorkerLink;
  writesPaused: boolean;
  lock: boolean;
}

const PHASES: Phase[] = [
  {aStatus: "complete", showB: false, bStatus: "building", active: "A", worker: null, link: null, writesPaused: false, lock: false},
  {aStatus: "complete", showB: true, bStatus: "building", active: "A", worker: null, link: null, writesPaused: false, lock: false},
  {aStatus: "complete", showB: true, bStatus: "building", active: "A", worker: "listing the backlog", link: null, writesPaused: false, lock: false},
  {aStatus: "complete", showB: true, bStatus: "building", active: "A", worker: "re-embedding into B", link: "backfill", writesPaused: false, lock: false},
  {aStatus: "complete", showB: true, bStatus: "building", active: "A", worker: "building B's index", link: "index", writesPaused: false, lock: false},
  {aStatus: "complete", showB: true, bStatus: "building", active: "A", worker: "final sweep", link: "backfill", writesPaused: true, lock: true},
  {aStatus: "superseded", showB: true, bStatus: "complete", active: "B", worker: null, link: null, writesPaused: false, lock: false},
];

const TITLES = [
  "Steady state",
  "Kickoff",
  "List the backlog",
  "Backfill – the moving target",
  "Build <code>B</code>'s index",
  "Reconcile and flip",
  "After",
];

const BLURBS = [
  "One profile, <code>A</code>, holds every embedding. Searches read from it and new writes land in it. The migration has to keep this working the whole way through.",
  "A second profile, <code>B</code>, is created for the new model – empty. <code>A</code> still handles everything; nothing has moved yet.",
  "The worker lists what needs re-embedding, and keeps re-checking that list as it goes – so anything written from here on is picked up too.",
  "The worker re-embeds the corpus into <code>B</code>. New writes still go only to <code>A</code>, so they show up on the list as well, and <code>B</code> keeps chasing until it has caught up.",
  "Once the rows are in, <code>B</code>'s search index is built. Searches still use <code>A</code> – <code>B</code> isn't ready to read from yet.",
  "A brief lock catches any last writes and re-checks <code>B</code>, then switches it on. Writes pause for this moment; searches never do.",
  "<code>B</code> is now the live profile – searches and writes use it. <code>A</code> is just the old copy now, cleaned up later.",
];

const drawSpinner = (
  ctx: CanvasRenderingContext2D,
  colour: string,
  cx: number,
  cy: number
): void => {
  ctx.strokeStyle = colour;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 5, -Math.PI / 2, Math.PI);
  ctx.stroke();
  ctx.lineWidth = 1;
};

// A feed path: flat when source and entry share a row, else a right-angle elbow
// that steps out horizontally from the box before turning to the profile edge.
const drawFeed = (
  {ctx, palette: p}: DrawContext,
  fromY: number,
  enterY: number,
  paused: boolean
): void => {
  const colour = paused ? p.muted : p.fg;
  if (Math.abs(fromY - enterY) < 0.5) {
    if (paused) {
      drawElbow(ctx, colour, [
        [BOX_RIGHT, fromY],
        [PROFILE_LEFT, enterY],
      ]);
    } else {
      drawArrow(ctx, colour, BOX_RIGHT, fromY, PROFILE_LEFT, enterY);
    }
    return;
  }
  drawElbow(
    ctx,
    colour,
    [
      [BOX_RIGHT, fromY],
      [BEND_X, fromY],
      [BEND_X, enterY],
      [PROFILE_LEFT, enterY],
    ],
    paused
  );
};

const draw = (scene: DrawContext, step: number): void => {
  const {ctx, palette: p} = scene;
  const phase = PHASES[step] ?? PHASES[0];

  drawLabeledBox(ctx, p, {...READS, title: "Reads", sub: "discover"});
  drawLabeledBox(ctx, p, {...WRITES, title: "Writes", sub: "ingest · triage"});

  drawProfileCard(ctx, p, {
    ...PROFILE_A,
    name: "text-embedding-3-small",
    geometry: "768 dims",
    status: phase.aStatus,
    active: phase.active === "A",
  });
  if (phase.showB) {
    drawProfileCard(ctx, p, {
      ...PROFILE_B,
      name: "embeddinggemma",
      geometry: "768 dims",
      status: phase.bStatus,
      active: phase.active === "B",
    });
  }

  if (phase.worker) {
    drawLabeledBox(ctx, p, {
      ...WORKER,
      title: "Reindex worker",
      sub: phase.worker,
      dashed: true,
    });
    drawSpinner(ctx, p.muted, WORKER.x + WORKER.w - 18, WORKER.y + WORKER.h / 2 - 5);
  }

  // Read and write paths enter the active profile at its upper and lower third.
  const active = phase.active === "A" ? PROFILE_A : PROFILE_B;
  const readEnter = active.y + active.h / 3;
  const writeEnter = active.y + (active.h * 2) / 3;
  drawFeed(scene, READS.y + READS.h / 2, readEnter, false);
  drawFeed(scene, WRITES.y + WRITES.h / 2, writeEnter, phase.writesPaused);
  if (phase.writesPaused) {
    drawLabel(
      ctx,
      p.muted,
      "writes paused",
      WRITES.x + WRITES.w / 2,
      WRITES.y + WRITES.h + 16,
      "center"
    );
  }

  // The worker's connection to B: a backfill embed, or building B's index.
  if (phase.link) {
    drawElbow(
      ctx,
      p.muted,
      [
        [WORKER.x + WORKER.w, WORKER.y + WORKER.h / 2],
        [LINK_X, WORKER.y + WORKER.h / 2],
        [LINK_X, B_BOTTOM],
      ],
      true
    );
    drawLabel(ctx, p.muted, phase.link, LINK_X + 12, WORKER.y + WORKER.h / 2);
  }

  // The cutover lock, held only across the flip — a marker in the profile gap,
  // clear of the cards and their labels.
  if (phase.lock) {
    drawLabel(
      ctx,
      p.highlight,
      "cutover lock",
      PROFILE_LEFT + PROFILE_W / 2,
      GAP_MID,
      "center"
    );
  }
};

mountSteppedDiagram(
  "[data-diagram='migration']",
  "migration-step",
  {width: WIDTH, height: HEIGHT, draw},
  (step, root) => {
    const title = root.querySelector("[data-step-title]");
    const blurb = root.querySelector("[data-step-note]");
    if (title) {
      title.innerHTML = TITLES[step] ?? "";
    }
    if (blurb) {
      blurb.innerHTML = BLURBS[step] ?? "";
    }
  }
);
