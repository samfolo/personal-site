/**
 * OG Image Generation
 *
 * Converts HTML template to PNG using satori and resvg-js.
 * Pipeline: satori-html → satori (SVG) → resvg-js (PNG)
 */

import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';

import { loadFonts } from './fonts';
import { createOgTemplate } from './template';
import type { OgTemplateOptions } from './template';

const WIDTH = 1200;
const HEIGHT = 630;

/**
 * Generate OG image as PNG buffer.
 *
 * @param options - Template options (title, date, theme)
 * @returns PNG image as Buffer
 */
export async function generateOgImage(options: OgTemplateOptions): Promise<Buffer> {
  // Create HTML template using satori-html
  const template = createOgTemplate(options);

  // Load fonts (singleton pattern ensures efficient loading)
  const fonts = await loadFonts();

  // Convert to SVG using Satori
  const svg = await satori(template, {
    width: WIDTH,
    height: HEIGHT,
    fonts,
  });

  // Convert SVG to PNG using resvg-js
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: WIDTH,
    },
  });

  const pngData = resvg.render();
  return pngData.asPng();
}
