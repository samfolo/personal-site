/**
 * Culori Type Declarations
 *
 * Subset of culori types used for OKLCH colour manipulation.
 */
declare module "culori" {
  /**
   * OKLCH colour representation.
   */
  export interface OklchColor {
    /**
     * Colour space identifier.
     */
    mode: "oklch";

    /**
     * Perceptual lightness.
     */
    l: number;

    /**
     * Chroma (colourfulness).
     */
    c: number;

    /**
     * Hue angle in degrees.
     */
    h: number;
  }

  export function oklch(color: OklchColor): OklchColor;
  export function formatHex(color: OklchColor): string | undefined;
}
