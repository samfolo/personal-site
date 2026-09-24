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
 * Canvas dimensions per output variant. The default OG card is 1.91:1 (the
 * social-preview standard); the banner is 5:2, for article / cover headers; the
 * X header is 3:1 (1500×500) and the LinkedIn banner 4:1 (1584×396), both
 * rendered at 2× for retina sharpness. `scale` multiplies only the final raster
 * size — the layout is always authored at the logical width/height. New
 * platform banners are added here as named presets (no free-form w/h, so no
 * invalid aspect ratios are representable).
 */
export const OG_DIMENSIONS = {
  og: {width: 1200, height: 630, padding: 56, scale: 1},
  banner: {width: 1500, height: 600, padding: 64, scale: 1},
  xheader: {width: 1500, height: 500, padding: 64, scale: 2},
  linkedin: {width: 1584, height: 396, padding: 64, scale: 2},
} as const;

export type OgVariant = keyof typeof OG_DIMENSIONS;

type Dimensions = (typeof OG_DIMENSIONS)[OgVariant];

/**
 * Theme button dimensions.
 */
const BUTTON = {
  inner: 60,
  border: 4,
  gap: 4,
} as const;

/**
 * X-header theme squares — a small, self-contained proportional system (the OG
 * cards use the larger BUTTON mark). `size` is the total box edge-to-edge; the
 * gap between squares is size ÷ 3 and the active ring scales off `border`, so
 * the whole mark scales by changing `size` alone (Sam's 1:3 box-to-gap ratio).
 */
const XHEADER_SQUARE = {size: 24, border: 2} as const;

/**
 * Typography scales for OG images.
 */
const TYPOGRAPHY = {
  wordmark: {
    lg: {size: 128, weight: 700, lineHeight: 0.833, letterSpacing: "-0.03em"},
    md: {size: 80, weight: 700, lineHeight: 0.833, letterSpacing: "-0.03em"},
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

  /**
   * Output variant: the 1.91:1 OG card (default) or the 5:2 banner.
   */
  variant?: OgVariant;

  /**
   * X-header only: override the wordmark font size in px, to explore the
   * square-to-type proportion. Defaults to TYPOGRAPHY.wordmark.md.
   */
  wordmarkSize?: number;
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
  colours: ThemeColours,
  dims: Dimensions
): ReturnType<typeof html> => html`
  <div
    style="display: flex; flex-direction: column; width: ${dims.width}px; height: ${dims.height}px; background-color: ${colours.bg}; padding: ${dims.padding}px; font-family: 'Switzer';"
  >
    <div style="display: flex; justify-content: flex-end;">
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
          style="display: flex; ${getButtonStyle("purple", theme, colours.fg)}"
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
              .charcoal.fg}; background: linear-gradient(135deg, ${THEME_COLOURS
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
  colours: ThemeColours,
  dims: Dimensions
): ReturnType<typeof html> => {
  const {title, date, theme} = options;
  const formattedDate = date ? formatDate(date, "dot-separated") : "";
  const themeLabel = THEME_LABELS[theme];

  return html`
    <div
      style="display: flex; flex-direction: column; width: ${dims.width}px; height: ${dims.height}px; background-color: ${colours.bg}; padding: ${dims.padding}px; font-family: 'Switzer';"
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
 * Create the shared profile-banner lockup (X header 1500×500 3:1; LinkedIn
 * 1584×396 4:1).
 *
 * A centred compact lockup: the smaller four-square mark sits on top of the
 * two-tier wordmark ("Sam" over "Folorunsho."), the squares right-flush to the
 * wordmark's right edge, the wordmark left-aligned, the whole block centred on
 * both axes. Centring keeps it clear of the bottom-left avatar/photo both
 * platforms drop there, and inside their safe zones. `wordmarkSize` sets the
 * font px (default 80); the square mark scales off XHEADER_SQUARE. Teal default.
 */
const createXHeaderTemplate = (
  theme: Theme,
  colours: ThemeColours,
  dims: Dimensions,
  wordmarkSize: number
): ReturnType<typeof html> => {
  const fill = XHEADER_SQUARE.size - 2 * XHEADER_SQUARE.border; // gradient area
  const gap = XHEADER_SQUARE.size / 3; // 1:3 box-to-gap ratio

  // The active square gets a layout-neutral ring (box-shadow, not a wrapper) so
  // it reads like the site switcher's outline without padding the spacing: a
  // bg-coloured gap then an fg-coloured ring. Only the current theme's square.
  const ring = (squareTheme: Theme): string =>
    squareTheme === theme
      ? ` box-shadow: 0 0 0 ${XHEADER_SQUARE.border}px ${colours.bg}, 0 0 0 ${XHEADER_SQUARE.border * 2}px ${colours.fg};`
      : "";

  const square = (squareTheme: Theme): string =>
    `display: flex; width: ${fill}px; height: ${fill}px; border: ${XHEADER_SQUARE.border}px solid ${THEME_COLOURS[squareTheme].fg}; background: linear-gradient(135deg, ${THEME_COLOURS[squareTheme].bg} 50%, ${THEME_COLOURS[squareTheme].fg} 50%);${ring(squareTheme)}`;

  return html`
    <div
      style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: ${dims.width}px; height: ${dims.height}px; background-color: ${colours.bg}; padding: ${dims.padding}px; font-family: 'Switzer';"
    >
      <div style="display: flex; flex-direction: column;">
        <div
          style="display: flex; justify-content: flex-end; gap: ${gap}px; margin-bottom: ${XHEADER_SQUARE.size}px;"
        >
          <div style="${square("steel")}"></div>
          <div style="${square("purple")}"></div>
          <div style="${square("charcoal")}"></div>
          <div style="${square("teal")}"></div>
        </div>
        <div
          style="display: flex; flex-direction: column; align-items: flex-start; color: ${colours.fg}; font-size: ${wordmarkSize}px; font-weight: ${TYPOGRAPHY
            .wordmark.md.weight}; line-height: ${TYPOGRAPHY.wordmark.md
            .lineHeight}; letter-spacing: ${TYPOGRAPHY.wordmark.md
            .letterSpacing};"
        >
          <div style="display: flex;">Sam</div>
          <div style="display: flex;">Folorunsho.</div>
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
  const {theme, isDefault = false, variant = "og"} = options;
  const colours = THEME_COLOURS[theme];
  const dims = OG_DIMENSIONS[variant];

  if (variant === "xheader" || variant === "linkedin") {
    return createXHeaderTemplate(
      theme,
      colours,
      dims,
      options.wordmarkSize ?? TYPOGRAPHY.wordmark.md.size
    );
  }

  return isDefault
    ? createDefaultTemplate(theme, colours, dims)
    : createBlogPostTemplate(options, colours, dims);
};
