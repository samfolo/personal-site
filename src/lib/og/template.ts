/**
 * OG Image HTML Template
 *
 * Creates satori-html markup for OG image generation.
 * Layout: 1200x630px with title, optional date, and branding.
 */

import { html } from 'satori-html';

import type { Theme } from '../../types';
import { themeColours } from './theme';

export interface OgTemplateOptions {
  title: string;
  date?: string;
  theme: Theme;
}

/**
 * Create HTML template for OG image.
 *
 * @param options - Title, optional date, and theme
 * @returns satori-html virtual DOM node
 */
export function createOgTemplate(options: OgTemplateOptions): ReturnType<typeof html> {
  const { title, date, theme } = options;
  const colours = themeColours[theme];

  return html`
    <div
      style="display: flex; flex-direction: column; width: 1200px; height: 630px; background-color: ${colours.bg}; padding: 80px; font-family: 'Switzer';"
    >
      <div
        style="display: flex; flex-direction: column; flex: 1; justify-content: center;"
      >
        <h1
          style="color: ${colours.fg}; font-size: 72px; font-weight: 700; line-height: 1.1; margin: 0;"
        >
          ${title}
        </h1>
        ${date
          ? html`<p
              style="color: ${colours.muted}; font-size: 32px; font-weight: 400; margin: 24px 0 0 0;"
            >
              ${date}
            </p>`
          : ''}
      </div>
      <div style="display: flex;">
        <p
          style="color: ${colours.muted}; font-size: 24px; font-weight: 400; margin: 0;"
        >
          samfolorunsho.com
        </p>
      </div>
    </div>
  `;
}
