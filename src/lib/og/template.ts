/**
 * OG Image HTML Template
 *
 * Creates satori-html markup for OG image generation.
 * Two layouts: default (site-level) and blog post.
 *
 * Canvas: 1200×630px, 56px padding
 */

import {html} from "satori-html";

import {THEME_LABELS} from "../../config/themes";
import type {Theme} from "../../config/themes";
import {formatDate} from "../../utils/format-date";

import {THEME_COLOURS} from "../theme";
import type {ThemeColours} from "../theme";

/**
 * Canvas dimensions for OG images.
 */
const OG = {
  width: 1200,
  height: 630,
  padding: 56,
} as const;

/**
 * Theme button dimensions.
 */
const BUTTON = {
  inner: 60,
  border: 4,
  gap: 4,
} as const;

/**
 * Typography scales for OG images.
 */
const TYPOGRAPHY = {
  wordmark: {
    lg: {size: 128, weight: 700, lineHeight: 0.833, letterSpacing: "-0.03em"},
    sm: {size: 64, weight: 700, lineHeight: 0.833, letterSpacing: "-0.03em"},
  },
  title: {size: 88, weight: 700, lineHeight: 1, letterSpacing: "-0.03em"},
  meta: {size: 24, weight: 600, letterSpacing: "0.08em"},
} as const;

export interface OgTemplateOptions {
  /**
   * The page title to display.
   */
  title: string;

  /**
   * Publication date for blog posts.
   */
  date?: Date;

  /**
   * Theme to use for the OG image colours.
   */
  theme: Theme;

  /**
   * Whether this is the default site-level OG image.
   */
  isDefault?: boolean;
}

/**
 * Get button outline style if this is the active theme.
 */
const getButtonStyle = (
  theme: Theme,
  activeTheme: Theme,
  activeFg: string
): string => {
  // Use border instead of outline since Satori doesn't support outline well
  // Active button gets a border with padding to create offset effect
  if (theme === activeTheme) {
    return `border: ${BUTTON.border}px solid ${activeFg}; padding: ${BUTTON.border}px;`;
  }

  // Inactive buttons get transparent border to maintain consistent sizing
  return `border: ${BUTTON.border}px solid transparent; padding: ${BUTTON.border}px;`;
};

/**
 * Create default (site-level) OG template.
 * Wordmark bottom-left, theme buttons top-right.
 */
const createDefaultTemplate = (
  theme: Theme,
  colours: ThemeColours
): ReturnType<typeof html> => html`
    <div
      style="display: flex; flex-direction: column; width: ${OG.width}px; height: ${OG.height}px; background-color: ${colours.bg}; padding: ${OG.padding}px; font-family: 'Switzer';"
    >
      <div style="display: flex; justify-content: flex-end;">
        <div style="display: flex; gap: ${BUTTON.gap}px;">
          <div
            style="display: flex; ${getButtonStyle("steel", theme, colours.fg)}"
          >
            <div
              style="display: flex; width: ${BUTTON.inner}px; height: ${BUTTON.inner}px; border: ${BUTTON.border}px solid ${THEME_COLOURS
                .steel
                .fg}; background: linear-gradient(135deg, ${THEME_COLOURS.steel
                .bg} 50%, ${THEME_COLOURS.steel.fg} 50%);"
            ></div>
          </div>
          <div
            style="display: flex; ${getButtonStyle(
              "purple",
              theme,
              colours.fg
            )}"
          >
            <div
              style="display: flex; width: ${BUTTON.inner}px; height: ${BUTTON.inner}px; border: ${BUTTON.border}px solid ${THEME_COLOURS
                .purple
                .fg}; background: linear-gradient(135deg, ${THEME_COLOURS.purple
                .bg} 50%, ${THEME_COLOURS.purple.fg} 50%);"
            ></div>
          </div>
          <div
            style="display: flex; ${getButtonStyle(
              "charcoal",
              theme,
              colours.fg
            )}"
          >
            <div
              style="display: flex; width: ${BUTTON.inner}px; height: ${BUTTON.inner}px; border: ${BUTTON.border}px solid ${THEME_COLOURS
                .charcoal
                .fg}; background: linear-gradient(135deg, ${THEME_COLOURS
                .charcoal.bg} 50%, ${THEME_COLOURS.charcoal.fg} 50%);"
            ></div>
          </div>
          <div
            style="display: flex; ${getButtonStyle("teal", theme, colours.fg)}"
          >
            <div
              style="display: flex; width: ${BUTTON.inner}px; height: ${BUTTON.inner}px; border: ${BUTTON.border}px solid ${THEME_COLOURS
                .teal.fg}; background: linear-gradient(135deg, ${THEME_COLOURS
                .teal.bg} 50%, ${THEME_COLOURS.teal.fg} 50%);"
            ></div>
          </div>
        </div>
      </div>
      <div style="display: flex; flex: 1; align-items: flex-end;">
        <div
          style="display: flex; flex-direction: column; color: ${colours.fg}; font-size: ${TYPOGRAPHY
            .wordmark.lg.size}px; font-weight: ${TYPOGRAPHY.wordmark.lg
            .weight}; line-height: ${TYPOGRAPHY.wordmark.lg
            .lineHeight}; letter-spacing: ${TYPOGRAPHY.wordmark.lg
            .letterSpacing};"
        >
          <div style="display: flex;">Sam</div>
          <div style="display: flex;">Folorunsho.</div>
        </div>
      </div>
    </div>
  `;

/**
 * Create blog post OG template.
 * Wordmark top-left, title bottom-left, metadata below.
 */
const createBlogPostTemplate = (
  options: OgTemplateOptions,
  colours: ThemeColours
): ReturnType<typeof html> => {
  const {title, date, theme} = options;
  const formattedDate = date ? formatDate(date, "dot-separated") : "";
  const themeLabel = THEME_LABELS[theme];

  return html`
    <div
      style="display: flex; flex-direction: column; width: ${OG.width}px; height: ${OG.height}px; background-color: ${colours.bg}; padding: ${OG.padding}px; font-family: 'Switzer';"
    >
      <div
        style="display: flex; justify-content: space-between; align-items: flex-start;"
      >
        <div
          style="display: flex; flex-direction: column; color: ${colours.fg}; font-size: ${TYPOGRAPHY
            .wordmark.sm.size}px; font-weight: ${TYPOGRAPHY.wordmark.sm
            .weight}; line-height: ${TYPOGRAPHY.wordmark.sm
            .lineHeight}; letter-spacing: ${TYPOGRAPHY.wordmark.sm
            .letterSpacing};"
        >
          <div style="display: flex;">Sam</div>
          <div style="display: flex;">Folorunsho.</div>
        </div>
        <div style="display: flex; gap: ${BUTTON.gap}px;">
          <div
            style="display: flex; ${getButtonStyle("steel", theme, colours.fg)}"
          >
            <div
              style="display: flex; width: ${BUTTON.inner}px; height: ${BUTTON.inner}px; border: ${BUTTON.border}px solid ${THEME_COLOURS
                .steel.fg}; background: linear-gradient(135deg, ${THEME_COLOURS
                .steel.bg} 50%, ${THEME_COLOURS.steel.fg} 50%);"
            ></div>
          </div>
          <div
            style="display: flex; ${getButtonStyle(
              "purple",
              theme,
              colours.fg
            )}"
          >
            <div
              style="display: flex; width: ${BUTTON.inner}px; height: ${BUTTON.inner}px; border: ${BUTTON.border}px solid ${THEME_COLOURS
                .purple.fg}; background: linear-gradient(135deg, ${THEME_COLOURS
                .purple.bg} 50%, ${THEME_COLOURS.purple.fg} 50%);"
            ></div>
          </div>
          <div
            style="display: flex; ${getButtonStyle(
              "charcoal",
              theme,
              colours.fg
            )}"
          >
            <div
              style="display: flex; width: ${BUTTON.inner}px; height: ${BUTTON.inner}px; border: ${BUTTON.border}px solid ${THEME_COLOURS
                .charcoal
                .fg}; background: linear-gradient(135deg, ${THEME_COLOURS
                .charcoal.bg} 50%, ${THEME_COLOURS.charcoal.fg} 50%);"
            ></div>
          </div>
          <div
            style="display: flex; ${getButtonStyle("teal", theme, colours.fg)}"
          >
            <div
              style="display: flex; width: ${BUTTON.inner}px; height: ${BUTTON.inner}px; border: ${BUTTON.border}px solid ${THEME_COLOURS
                .teal.fg}; background: linear-gradient(135deg, ${THEME_COLOURS
                .teal.bg} 50%, ${THEME_COLOURS.teal.fg} 50%);"
            ></div>
          </div>
        </div>
      </div>
      <div
        style="display: flex; flex-direction: column; flex: 1; justify-content: flex-end; gap: 16px;"
      >
        <div
          style="display: flex; color: ${colours.fg}; font-size: ${TYPOGRAPHY
            .title.size}px; font-weight: ${TYPOGRAPHY.title
            .weight}; line-height: ${TYPOGRAPHY.title
            .lineHeight}; letter-spacing: ${TYPOGRAPHY.title.letterSpacing};"
        >
          ${title}
        </div>
        <div style="display: flex; align-items: center; gap: 32px;">
          <div
            style="display: flex; color: ${colours.muted}; font-size: ${TYPOGRAPHY
              .meta.size}px; font-weight: ${TYPOGRAPHY.meta
              .weight}; font-variant-numeric: tabular-nums; letter-spacing: ${TYPOGRAPHY
              .meta.letterSpacing};"
          >
            ${formattedDate}
          </div>
          <div
            style="display: flex; flex: 1; height: 2px; background-color: ${colours.rule};"
          ></div>
        </div>
        <div style="display: flex; justify-content: flex-end;">
          <div
            style="display: flex; color: ${colours.muted}; font-size: ${TYPOGRAPHY
              .meta.size}px; font-weight: ${TYPOGRAPHY.meta
              .weight}; letter-spacing: ${TYPOGRAPHY.meta.letterSpacing};"
          >
            ${themeLabel}
          </div>
        </div>
      </div>
    </div>
  `;
};

/**
 * Create HTML template for OG image.
 *
 * @param options - Title, optional date, theme, and isDefault flag
 * @returns satori-html virtual DOM node
 */
export const createOgTemplate = (
  options: OgTemplateOptions
): ReturnType<typeof html> => {
  const {theme, isDefault = false} = options;
  const colours = THEME_COLOURS[theme];

  return isDefault
    ? createDefaultTemplate(theme, colours)
    : createBlogPostTemplate(options, colours);
};
