/**
 * OG Image Generation
 *
 * Converts HTML template to PNG using satori and resvg-js.
 * Pipeline: satori-html → satori (SVG) → resvg-js (PNG)
 */

import {Resvg} from "@resvg/resvg-js";
import satori from "satori";

import {FONTS} from "./fonts";
import {createOgTemplate, OG_DIMENSIONS} from "./template";
import type {OgTemplateOptions} from "./template";

/**
 * Generate OG image as PNG buffer.
 *
 * @param options - Template options (title, date, theme)
 * @returns PNG image as Buffer
 */
export const generateOgImage = async (
  options: OgTemplateOptions
): Promise<Buffer> => {
  const template = createOgTemplate(options);
  const {width, height, scale} = OG_DIMENSIONS[options.variant ?? "og"];

  const svg = await satori(template, {
    width,
    height,
    fonts: FONTS,
  });

  // Convert SVG to PNG using resvg-js. `scale` rasterises above the logical
  // width for retina sharpness (the SVG is vector, so it upscales cleanly).
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: width * scale,
    },
  });

  const pngData = resvg.render();
  return pngData.asPng();
};
