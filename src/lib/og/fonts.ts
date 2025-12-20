/**
 * Font Loading for OG Image Generation
 *
 * Imports Switzer fonts embedded as base64 for use with Satori.
 * Font weights 400 (regular) and 700 (bold) are included.
 */

import {SWITZER_BOLD_B64} from "./switzer-bold";
import {SWITZER_REGULAR_B64} from "./switzer-regular";
import type {FontStyle, FontWeight} from "./types";

/**
 * Font data for Satori rendering.
 */
export interface FontData {
  /**
   * Font family name.
   */
  name: string;

  /**
   * Font file data as ArrayBuffer.
   */
  data: ArrayBuffer;

  /**
   * Font weight.
   */
  weight: FontWeight;

  /**
   * Font style.
   */
  style: FontStyle;
}

/**
 * Font family name for OG images.
 */
const FONT_NAME = "Switzer";

/**
 * Convert base64 string to ArrayBuffer.
 */
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
};

/**
 * Font data decoded from embedded base64.
 * No filesystem access needed at runtime.
 */
export const FONTS: FontData[] = [
  {
    name: FONT_NAME,
    data: base64ToArrayBuffer(SWITZER_REGULAR_B64),
    weight: 400,
    style: "normal",
  },
  {
    name: FONT_NAME,
    data: base64ToArrayBuffer(SWITZER_BOLD_B64),
    weight: 700,
    style: "normal",
  },
];
