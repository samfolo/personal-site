/**
 * Text measure pass
 *
 * Freestanding text is the one part of a figure without a frame to guard
 * it, and every text defect the guards have missed lived there. This module
 * gives each rendered text a measured bounding box and checks the things a
 * frame would have checked: the box stays on the canvas, clears every
 * shape, crosses no edge, and touches no other text. A violation fails the
 * build with the geometry; near-misses (crowding) remain a judgement for
 * eyes on /dev/diagrams.
 *
 * Vertical extent is modelled from the mono cap and descender metrics for
 * both voices — accurate to a pixel or two, and deliberately smaller than
 * the label gap tokens, so text sitting a standard gap from its edge never
 * trips the guard. The pass is self-consistent: boxes come from the same
 * deterministic metrics on every build, never from rendered pixels.
 */

import {measureMono, measureTracked, track} from "./metrics";
import {MONO_CAP_HEIGHT, MONO_DESCENDER, TEXT_SIZE_SECONDARY} from "./tokens";
import type {Point, ShapeHandle, TextItem} from "./types";

/**
 * A measured text bounding box, carrying its text for error messages.
 */
export interface TextBox {
  /**
   * The text, for naming the box in guard failures.
   */
  text: string;

  /**
   * Left edge.
   */
  x0: number;

  /**
   * Top edge.
   */
  y0: number;

  /**
   * Right edge.
   */
  x1: number;

  /**
   * Bottom edge.
   */
  y1: number;
}

/**
 * Half the modelled text height, used for vertically centred text.
 */
const HALF_HEIGHT = (MONO_CAP_HEIGHT + MONO_DESCENDER) / 2;

const anchorOffset = (item: TextItem, width: number): number => {
  if (item.anchor === "middle") {
    return width / 2;
  }
  if (item.anchor === "end") {
    return width;
  }
  return 0;
};

/**
 * Measure a text item into its bounding box. Tracked labels measure through
 * the glyph table; annotations through the fixed mono pitch.
 */
export const textBox = (item: TextItem): TextBox => {
  const width =
    item.voice === "label"
      ? measureTracked(track(item.text))
      : measureMono(item.text, TEXT_SIZE_SECONDARY);
  const x0 = item.x - anchorOffset(item, width);
  const y0 = item.centred ? item.y - HALF_HEIGHT : item.y - MONO_CAP_HEIGHT;
  const y1 = item.centred ? item.y + HALF_HEIGHT : item.y + MONO_DESCENDER;
  return {text: item.text, x0, y0, x1: x0 + width, y1};
};

/**
 * Whether a text box overlaps a frame. Touching edges is allowed — the
 * guard catches crossings, not proximity.
 */
const boxOverlapsFrame = (box: TextBox, f: ShapeHandle): boolean =>
  box.x0 < f.x + f.w && box.x1 > f.x && box.y0 < f.y + f.h && box.y1 > f.y;

/**
 * Whether two text boxes overlap. Touching is allowed.
 */
const boxesOverlap = (a: TextBox, b: TextBox): boolean =>
  a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

/**
 * Whether the segment a→b passes through the box (Liang–Barsky clip).
 * Handles the diagonals `direct` edges draw, not just orthogonal runs.
 */
const segmentCrossesBox = (a: Point, b: Point, box: TextBox): boolean => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let t0 = 0;
  let t1 = 1;
  const clip = (p: number, q: number): boolean => {
    if (p === 0) {
      return q >= 0;
    }
    const t = q / p;
    if (p < 0) {
      if (t > t1) {
        return false;
      }
      if (t > t0) {
        t0 = t;
      }
    } else {
      if (t < t0) {
        return false;
      }
      if (t < t1) {
        t1 = t;
      }
    }
    return true;
  };
  return (
    clip(-dx, a.x - box.x0) &&
    clip(dx, box.x1 - a.x) &&
    clip(-dy, a.y - box.y0) &&
    clip(dy, box.y1 - a.y)
  );
};

/**
 * An edge as the measure pass sees it: its endpoints' ids for error
 * messages, and the resolved polyline.
 */
export interface GuardedEdge {
  /**
   * Source shape id.
   */
  from: string;

  /**
   * Target shape id.
   */
  to: string;

  /**
   * Resolved path points.
   */
  points: Point[];
}

const extent = (box: TextBox): string =>
  `x ${Math.round(box.x0)}–${Math.round(box.x1)}, y ${Math.round(box.y0)}–${Math.round(box.y1)}`;

/**
 * Guard the whole text layer of a scene: every freestanding text must sit
 * inside the canvas, clear of every shape frame, every edge segment, and
 * every other text. Callers exclude boundary frames — text inside a
 * boundary's region is normal composition.
 */
export const guardTextLayer = (
  items: TextItem[],
  edges: GuardedEdge[],
  shapes: ShapeHandle[],
  width: number,
  height: number
): void => {
  const boxes = items.map(textBox);
  for (const box of boxes) {
    if (box.x0 < 0 || box.y0 < 0 || box.x1 > width || box.y1 > height) {
      throw new Error(
        `diagram scene: text "${box.text}" spans ${extent(box)} — outside the ${width}×${height} canvas`
      );
    }
    for (const shape of shapes) {
      if (boxOverlapsFrame(box, shape)) {
        throw new Error(
          `diagram scene: text "${box.text}" (${extent(box)}) overlaps shape "${shape.id}" — move the text or recompose`
        );
      }
    }
    for (const edge of edges) {
      for (let i = 0; i < edge.points.length - 1; i++) {
        const a = edge.points[i];
        const b = edge.points[i + 1];
        if (a && b && segmentCrossesBox(a, b, box)) {
          throw new Error(
            `diagram scene: text "${box.text}" (${extent(box)}) crosses the edge "${edge.from}" → "${edge.to}" — move the text or reroute the edge`
          );
        }
      }
    }
  }
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      if (a && b && boxesOverlap(a, b)) {
        throw new Error(
          `diagram scene: texts "${a.text}" (${extent(a)}) and "${b.text}" (${extent(b)}) overlap`
        );
      }
    }
  }
};
