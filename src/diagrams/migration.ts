/**
 * Zero-downtime embedding migration
 *
 * The seven-step walk-through from "Keeping system-shaped promises":
 * reads and writes ride the active profile while a reindex worker fills
 * the new one; there is no dual-write, and the drain happens at the flip
 * under a brief lock.
 *
 * Each step is one object — control chip, caption title and note, and the
 * scene overlay travel together.
 */

import {defineSteppedDiagram} from "../lib/diagrams";
import type {ProfileStatus, Scene} from "../lib/diagrams";

/**
 * Vertical rhythm unit shared by both columns.
 */
const UNIT = 28;

/**
 * Top edge of the first row.
 */
const TOP = 28;

/**
 * Left column x (Reads and Writes actors).
 */
const ACTORS_X = 24;

/**
 * Right column x (the profile stores).
 */
const STORES_X = 400;

/**
 * The reindex worker's frame, below profile B. Card-height: the corner row
 * carries the spinner, then title and sub rows with the shared container
 * spacing.
 */
const WORKER = {x: 205, y: 240, w: 180, h: 84};

/**
 * X of the worker link's vertical run into profile B.
 */
const LINK_X = 520;

/**
 * Which profile currently serves reads and writes.
 */
type ActiveProfile = "A" | "B";

/**
 * What the reindex worker's link into profile B represents.
 */
type WorkerLink = "backfill" | "index";

const declareBase = (d: Scene): void => {
  d.actor("reads", {title: "Reads", sub: "discover", x: ACTORS_X, y: TOP});
  d.actor("writes", {
    title: "Writes",
    sub: "ingest · triage",
    x: ACTORS_X,
    y: TOP + 5 * UNIT,
  });
  d.store("A", {
    name: "text-embedding-3-small",
    meta: "768 dims",
    x: STORES_X,
    y: TOP,
    active: true,
  });
};

const declareStoreB = (
  d: Scene,
  status: ProfileStatus = "building",
  active = false
): void => {
  d.store("B", {
    name: "embeddinggemma",
    meta: "768 dims",
    x: STORES_X,
    y: TOP + 4 * UNIT,
    status,
    active,
  });
};

// Read and write paths enter the active profile at its upper and lower
// third; the SDK routes them flat when aligned, elbowed when not.
const declareFeeds = (
  d: Scene,
  active: ActiveProfile,
  writesPaused = false
): void => {
  d.edge("reads", active, {ink: "fg", enter: "upper"});
  d.edge("writes", active, {
    ink: writesPaused ? "muted" : "fg",
    dash: writesPaused,
    enter: "lower",
  });
};

const declareWorker = (d: Scene, sub: string, link?: WorkerLink): void => {
  d.actor("worker", {
    title: "Reindex worker",
    sub,
    dashed: true,
    spinner: true,
    ...WORKER,
  });
  if (link) {
    d.edge("worker", "B", {
      dash: true,
      via: LINK_X,
      label: link,
      labelStyle: "label",
    });
  }
};

export const migration = defineSteppedDiagram({
  id: "migration",
  size: [672, 336],
  ariaLabel: "Zero-downtime embedding migration: a seven-step walkthrough.",
  base: declareBase,
  steps: [
    {
      tab: "Steady",
      title: "Steady state",
      note: "One profile, <code>A</code>, holds every embedding. Searches read from it and new writes land in it. The migration has to keep this working the whole way through.",
      scene(d) {
        declareFeeds(d, "A");
      },
    },
    {
      tab: "Kickoff",
      title: "Kickoff",
      note: "A second profile, <code>B</code>, is created for the new model – empty. <code>A</code> still handles everything; nothing has moved yet.",
      scene(d) {
        declareStoreB(d);
        declareFeeds(d, "A");
      },
    },
    {
      tab: "List",
      title: "List the backlog",
      note: "The worker lists what needs re-embedding, and keeps re-checking that list as it goes – so anything written from here on is picked up too.",
      scene(d) {
        declareStoreB(d);
        declareWorker(d, "listing the backlog");
        declareFeeds(d, "A");
      },
    },
    {
      tab: "Backfill",
      title: "Backfill – the moving target",
      note: "The worker re-embeds the corpus into <code>B</code>. New writes still go only to <code>A</code>, so they show up on the list as well, and <code>B</code> keeps chasing until it has caught up.",
      scene(d) {
        declareStoreB(d);
        declareWorker(d, "re-embedding into B", "backfill");
        declareFeeds(d, "A");
      },
    },
    {
      tab: "Index",
      title: "Build <code>B</code>'s index",
      note: "Once the rows are in, <code>B</code>'s search index is built. Searches still use <code>A</code> – <code>B</code> isn't ready to read from yet.",
      scene(d) {
        declareStoreB(d);
        declareWorker(d, "building B's index", "index");
        declareFeeds(d, "A");
      },
    },
    {
      tab: "Flip",
      title: "Reconcile and flip",
      note: "A brief lock catches any last writes and re-checks <code>B</code>, then switches it on. Writes pause for this moment; searches never do.",
      scene(d) {
        declareStoreB(d);
        declareWorker(d, "final sweep", "backfill");
        declareFeeds(d, "A", true);
        d.label("writes paused", {
          x: ACTORS_X + 75,
          y: TOP + 7 * UNIT + 16,
          anchor: "middle",
        });
        d.label("cutover lock", {
          x: STORES_X + 120,
          y: TOP + 3.5 * UNIT,
          anchor: "middle",
          ink: "highlight",
        });
      },
    },
    {
      tab: "After",
      title: "After",
      note: "<code>B</code> is now the live profile – searches and writes use it. <code>A</code> is just the old copy now, cleaned up later.",
      scene(d) {
        d.status("A", "superseded", {active: false});
        declareStoreB(d, "complete", true);
        declareFeeds(d, "B");
      },
    },
  ],
});
