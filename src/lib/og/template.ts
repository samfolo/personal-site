/**
 * OG Image HTML Template
 *
 * Creates satori-html markup for OG image generation.
 * Two layouts: default (site-level) and blog post.
 *
 * Canvas: 1200×630px, 56px padding
 */

import { html } from 'satori-html';

import type { Theme } from '../../types';
import { THEME_COLOURS, THEME_LABELS } from './theme';

export interface OgTemplateOptions {
  title: string;
  date?: Date;
  theme: Theme;
}

/**
 * Format date as DD.MM.YYYY
 */
function formatOgDate(date: Date): string {
  return date
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .replace(/\//g, '.');
}


/**
 * Get button outline style if this is the active theme.
 */
function getButtonStyle(theme: Theme, activeTheme: Theme, activeFg: string): string {
  // Use border instead of outline since Satori doesn't support outline well
  // Active button gets a 4px border with 4px padding to create offset effect
  if (theme === activeTheme) {
    return `border: 4px solid ${activeFg}; padding: 4px;`;
  }
  // Inactive buttons get transparent border to maintain consistent sizing
  return 'border: 4px solid transparent; padding: 4px;';
}

/**
 * Create HTML template for OG image.
 *
 * @param options - Title, optional date, and theme
 * @returns satori-html virtual DOM node
 */
export function createOgTemplate(options: OgTemplateOptions): ReturnType<typeof html> {
  const { title, date, theme } = options;
  const colours = THEME_COLOURS[theme];

  // Check if this is the default (site-level) OG image
  const isDefault = title === 'Sam Folorunsho';

  // Default layout: wordmark bottom-left, buttons top-right
  if (isDefault) {
    return html`
      <div
        style="display: flex; flex-direction: column; width: 1200px; height: 630px; background-color: ${colours.bg}; padding: 56px; font-family: 'Switzer';"
      >
        <div style="display: flex; justify-content: flex-end;">
          <div style="display: flex; gap: 4px;">
            <div style="display: flex; ${getButtonStyle('steel', theme, colours.fg)}">
              <div style="display: flex; width: 60px; height: 60px; border: 4px solid ${THEME_COLOURS.steel.fg}; background: linear-gradient(135deg, ${THEME_COLOURS.steel.bg} 50%, ${THEME_COLOURS.steel.fg} 50%);"></div>
            </div>
            <div style="display: flex; ${getButtonStyle('purple', theme, colours.fg)}">
              <div style="display: flex; width: 60px; height: 60px; border: 4px solid ${THEME_COLOURS.purple.fg}; background: linear-gradient(135deg, ${THEME_COLOURS.purple.bg} 50%, ${THEME_COLOURS.purple.fg} 50%);"></div>
            </div>
            <div style="display: flex; ${getButtonStyle('charcoal', theme, colours.fg)}">
              <div style="display: flex; width: 60px; height: 60px; border: 4px solid ${THEME_COLOURS.charcoal.fg}; background: linear-gradient(135deg, ${THEME_COLOURS.charcoal.bg} 50%, ${THEME_COLOURS.charcoal.fg} 50%);"></div>
            </div>
            <div style="display: flex; ${getButtonStyle('teal', theme, colours.fg)}">
              <div style="display: flex; width: 60px; height: 60px; border: 4px solid ${THEME_COLOURS.teal.fg}; background: linear-gradient(135deg, ${THEME_COLOURS.teal.bg} 50%, ${THEME_COLOURS.teal.fg} 50%);"></div>
            </div>
          </div>
        </div>
        <div style="display: flex; flex: 1; align-items: flex-end;">
          <div
            style="display: flex; flex-direction: column; color: ${colours.fg}; font-size: 128px; font-weight: 700; line-height: 0.833; letter-spacing: -0.03em;"
          >
            <div style="display: flex;">Sam</div>
            <div style="display: flex;">Folorunsho.</div>
          </div>
        </div>
      </div>
    `;
  }

  // Blog post layout
  const formattedDate = date ? formatOgDate(date) : '';
  const themeLabel = THEME_LABELS[theme];

  return html`
    <div
      style="display: flex; flex-direction: column; width: 1200px; height: 630px; background-color: ${colours.bg}; padding: 56px; font-family: 'Switzer';"
    >
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div
          style="display: flex; flex-direction: column; color: ${colours.fg}; font-size: 64px; font-weight: 700; line-height: 0.833; letter-spacing: -0.03em;"
        >
          <div style="display: flex;">Sam</div>
          <div style="display: flex;">Folorunsho.</div>
        </div>
        <div style="display: flex; gap: 4px;">
          <div style="display: flex; ${getButtonStyle('steel', theme, colours.fg)}">
            <div style="display: flex; width: 60px; height: 60px; border: 4px solid ${THEME_COLOURS.steel.fg}; background: linear-gradient(135deg, ${THEME_COLOURS.steel.bg} 50%, ${THEME_COLOURS.steel.fg} 50%);"></div>
          </div>
          <div style="display: flex; ${getButtonStyle('purple', theme, colours.fg)}">
            <div style="display: flex; width: 60px; height: 60px; border: 4px solid ${THEME_COLOURS.purple.fg}; background: linear-gradient(135deg, ${THEME_COLOURS.purple.bg} 50%, ${THEME_COLOURS.purple.fg} 50%);"></div>
          </div>
          <div style="display: flex; ${getButtonStyle('charcoal', theme, colours.fg)}">
            <div style="display: flex; width: 60px; height: 60px; border: 4px solid ${THEME_COLOURS.charcoal.fg}; background: linear-gradient(135deg, ${THEME_COLOURS.charcoal.bg} 50%, ${THEME_COLOURS.charcoal.fg} 50%);"></div>
          </div>
          <div style="display: flex; ${getButtonStyle('teal', theme, colours.fg)}">
            <div style="display: flex; width: 60px; height: 60px; border: 4px solid ${THEME_COLOURS.teal.fg}; background: linear-gradient(135deg, ${THEME_COLOURS.teal.bg} 50%, ${THEME_COLOURS.teal.fg} 50%);"></div>
          </div>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; flex: 1; justify-content: flex-end; gap: 16px;">
        <div
          style="display: flex; color: ${colours.fg}; font-size: 88px; font-weight: 700; line-height: 1; letter-spacing: -0.03em;"
        >
          ${title}
        </div>
        <div style="display: flex; align-items: center; gap: 32px;">
          <div
            style="display: flex; color: ${colours.muted}; font-size: 24px; font-weight: 600; font-variant-numeric: tabular-nums; letter-spacing: 0.08em;"
          >
            ${formattedDate}
          </div>
          <div style="display: flex; flex: 1; height: 2px; background-color: ${colours.rule};"></div>
        </div>
        <div style="display: flex; justify-content: flex-end;">
          <div
            style="display: flex; color: ${colours.muted}; font-size: 24px; font-weight: 600; letter-spacing: 0.08em;"
          >
            ${themeLabel}
          </div>
        </div>
      </div>
    </div>
  `;
}
