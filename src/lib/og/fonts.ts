/**
 * Font Loading for OG Image Generation
 *
 * Loads Switzer static fonts for use with Satori.
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
const FONTS_DIR = join(process.cwd(), 'public', 'fonts');
const FONT_REGULAR_PATH = join(FONTS_DIR, 'Switzer-Regular.otf');
const FONT_BOLD_PATH = join(FONTS_DIR, 'Switzer-Bold.otf');

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
  const [regularBuffer, boldBuffer] = await Promise.all([
    readFile(FONT_REGULAR_PATH),
    readFile(FONT_BOLD_PATH),
  ]);

  return [
    {
      name: FONT_NAME,
      data: bufferToArrayBuffer(regularBuffer),
      weight: 400,
      style: 'normal',
    },
    {
      name: FONT_NAME,
      data: bufferToArrayBuffer(boldBuffer),
      weight: 700,
      style: 'normal',
    },
  ];
}
