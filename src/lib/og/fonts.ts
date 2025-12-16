/**
 * Font Loading for OG Image Generation
 *
 * Loads Switzer variable font for use with Satori.
 * Font weights 400 (regular) and 700 (bold) are loaded.
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface FontData {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700;
  style: 'normal';
}

const FONT_NAME = 'Switzer';
const FONT_PATH = join(process.cwd(), 'public', 'fonts', 'Switzer-Variable.woff2');

/**
 * Singleton promise for font loading.
 * Ensures fonts are loaded only once and concurrent calls share the same promise.
 */
let fontPromise: Promise<FontData[]> | null = null;

/**
 * Convert Buffer to ArrayBuffer, handling the underlying memory correctly.
 */
function bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );
}

/**
 * Load Switzer font data for Satori rendering.
 *
 * Uses singleton pattern to ensure fonts are loaded only once.
 * Concurrent calls will share the same loading promise.
 *
 * @throws Error if font file cannot be read
 */
export async function loadFonts(): Promise<FontData[]> {
  if (!fontPromise) {
    fontPromise = loadFontsInternal();
  }
  return fontPromise;
}

async function loadFontsInternal(): Promise<FontData[]> {
  const fontBuffer = await readFile(FONT_PATH);
  const fontData = bufferToArrayBuffer(fontBuffer);

  return [
    {
      name: FONT_NAME,
      data: fontData,
      weight: 400,
      style: 'normal',
    },
    {
      name: FONT_NAME,
      data: fontData,
      weight: 700,
      style: 'normal',
    },
  ];
}
