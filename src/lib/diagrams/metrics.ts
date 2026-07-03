/**
 * Server-side text metrics
 *
 * Badges size themselves to their text, but the SDK renders at build time
 * where there is no canvas `measureText`. Tracked labels use Switzer 600 at
 * 11px, so a small cap-width table gives a deterministic measurement that is
 * accurate to within a couple of pixels — absorbed by the badge padding. The
 * table only needs the tracked-label alphabet: uppercase, digits, and the few
 * marks the vocabulary uses.
 */

/**
 * Glyph advance widths for Switzer 600 at 11px, tracked-label alphabet only.
 */
const LABEL_GLYPH_WIDTHS: Record<string, number> = {
  A: 7.6,
  B: 7.3,
  C: 7.8,
  D: 7.9,
  E: 6.9,
  F: 6.6,
  G: 8.1,
  H: 8.0,
  I: 3.4,
  J: 5.6,
  K: 7.4,
  L: 6.2,
  M: 9.6,
  N: 8.0,
  O: 8.2,
  P: 7.2,
  Q: 8.2,
  R: 7.3,
  S: 7.0,
  T: 6.8,
  U: 7.8,
  V: 7.4,
  W: 10.6,
  X: 7.2,
  Y: 7.0,
  Z: 6.9,
  "0": 6.7,
  "1": 4.6,
  "2": 6.7,
  "3": 6.7,
  "4": 6.7,
  "5": 6.7,
  "6": 6.7,
  "7": 6.7,
  "8": 6.7,
  "9": 6.7,
  " ": 2.9,
  "\u00a0": 2.9,
  "·": 3.3,
  "-": 4.4,
  "–": 6.0,
  "/": 4.4,
  ".": 2.8,
  "%": 9.5,
  "'": 2.2,
};

/**
 * Widen label text: uppercase, with a space between every character. Word
 * gaps become space–NBSP–space — SVG collapses runs of ordinary
 * whitespace, so the middle space must be a non-breaking one to survive
 * rendering.
 */
export const track = (text: string): string =>
  text
    .toUpperCase()
    .split("")
    .map((glyph) => (glyph === " " ? "\u00a0" : glyph))
    .join(" ");

/**
 * Measure an already-tracked label string in viewBox pixels. A glyph
 * missing from the table fails the build — sizing that can't be measured
 * can't be guarded, so the table extends rather than the measurement
 * guessing.
 */
export const measureTracked = (tracked: string): number =>
  Math.round(
    tracked.split("").reduce((width, glyph) => {
      const advance = LABEL_GLYPH_WIDTHS[glyph];
      if (advance === undefined) {
        throw new Error(
          `diagram metrics: no advance width for glyph "${glyph}" — add it to the tracked-label table`
        );
      }
      return width + advance;
    }, 0)
  );

/**
 * CommitMono's fixed advance width in ems.
 */
const MONO_ADVANCE_EM = 0.6;

/**
 * Measure monospace text at a given size, in viewBox pixels — exact, since
 * the face is fixed-pitch. Used by the overflow guards that keep labels
 * inside their frames.
 */
export const measureMono = (text: string, size: number): number =>
  Math.ceil(text.length * MONO_ADVANCE_EM * size);
