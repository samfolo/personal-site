# Design System and Theming

## Overview

The design system is built on CSS custom properties (design tokens) with Tailwind CSS v4 integration. It supports four colour themes that can be switched at runtime.

## CSS Architecture

### Layer Order (`src/styles/global.css`)

```css
@layer reset, tokens, base, components, utilities;
```

Proper cascade ordering ensures:

1. Reset normalises browser defaults
2. Tokens define design variables
3. Base applies fundamental styles
4. Components are specific UI elements
5. Utilities provide atomic overrides

### File Structure

```
src/styles/
├── global.css              # Main entry, imports all styles
├── prose.css               # Typography for blog content
├── transitions.css         # View transition animations
├── tokens/
│   ├── index.css           # Token barrel file
│   ├── colours.css         # Theme colour definitions
│   ├── typography.css      # Fonts, sizes, line heights
│   ├── spacing.css         # Spacing scale
│   ├── sizing.css          # Fixed sizes
│   ├── layout.css          # Safe area insets
│   ├── z-index.css         # Stacking context
│   ├── transitions.css     # Animation timings
│   └── borders.css         # Border widths
└── components/
    └── shiki.css           # Code block styling
```

## Colour Themes

### Available Themes

Four themes defined in `src/config/themes.ts`:

| Theme    | Class             | Background  | Foreground | Accent         |
| -------- | ----------------- | ----------- | ---------- | -------------- |
| Steel    | `.theme-steel`    | Blue-grey   | Warm cream | Cool highlight |
| Purple   | `.theme-purple`   | Dark purple | Gold       | Magenta        |
| Charcoal | `.theme-charcoal` | Warm grey   | Off-white  | Neutral        |
| Teal     | `.theme-teal`     | Dark teal   | Coral      | Cyan           |

### Theme Configuration (`src/config/themes.ts`)

```typescript
export const THEME_ORDER = ["steel", "purple", "charcoal", "teal"] as const;
export type Theme = (typeof THEME_ORDER)[number];

export const THEME_LABELS: Record<Theme, string> = {
  steel: "STEEL GREY + WARM CREAM",
  purple: "DARK PURPLE + GOLD",
  charcoal: "WARM CHARCOAL + OFF-WHITE",
  teal: "DARK TEAL + CORAL",
};

export const THEME_CLASSES: string[] = THEME_ORDER.map((id) => `theme-${id}`);
```

### Theme Tokens (`src/styles/tokens/colours.css`)

Each theme defines six semantic colours using OKLCH colour space:

```css
.theme-steel {
  --bg: oklch(0.2293 0.009 255.6); /* Background */
  --fg: oklch(0.9615 0.0098 87.47); /* Foreground/text */
  --muted: oklch(0.6334 0 0); /* Secondary text */
  --rule: oklch(0.359 0.0095 260.72); /* Borders, dividers */
  --highlight: oklch(0.75 0.02 250); /* Links, accents */
  --emphasis: oklch(0.99 0.015 87.47); /* Strong emphasis */
}
```

### OKLCH Colour Space

All colours use OKLCH for perceptual uniformity:

- `L` - Lightness (0-1)
- `C` - Chroma (saturation)
- `H` - Hue angle (degrees)

### Theme Application

Theme class applied to `<html>` element (not `<body>`):

```html
<html class="theme-steel"></html>
```

This ensures CSS variables are available to view transition pseudo-elements.

### Theme Persistence

Using localStorage with namespaced key from `src/config/storage.ts`:

```typescript
// Storage key
export const STORAGE_KEYS = {
  THEME: "sf.site.theme",
} as const;

// Set theme
localStorage.setItem(STORAGE_KEYS.THEME, themeId);
document.documentElement.classList.add(`theme-${themeId}`);

// Restore on load (inline script in Base.astro)
const saved = localStorage.getItem("sf.site.theme");
if (saved) document.documentElement.classList.add(`theme-${saved}`);
```

Theme restoration also handles View Transitions via `astro:after-swap`.

## Typography

### Font Families

| Token         | Font               | Fallbacks                 |
| ------------- | ------------------ | ------------------------- |
| `--font-sans` | Switzer (variable) | system-ui, sans-serif     |
| `--font-mono` | CommitMono         | JetBrains Mono, monospace |

### Type Scale (Minor Third - 1.2 ratio)

| Token         | Size      | Pixels |
| ------------- | --------- | ------ |
| `--text-xs`   | 0.6875rem | 11px   |
| `--text-sm`   | 0.8125rem | 13px   |
| `--text-base` | 1rem      | 16px   |
| `--text-md`   | 1.1875rem | 19px   |
| `--text-lg`   | 1.4375rem | 23px   |
| `--text-xl`   | 1.75rem   | 28px   |
| `--text-2xl`  | 2.0625rem | 33px   |
| `--text-3xl`  | 2.5rem    | 40px   |

### Line Heights (8px Grid)

| Token          | Value  | Pixels |
| -------------- | ------ | ------ |
| `--leading-16` | 1rem   | 16px   |
| `--leading-24` | 1.5rem | 24px   |
| `--leading-32` | 2rem   | 32px   |
| `--leading-40` | 2.5rem | 40px   |
| `--leading-48` | 3rem   | 48px   |

### Letter Spacing

| Token                | Value   | Use              |
| -------------------- | ------- | ---------------- |
| `--tracking-display` | -0.03em | Headings         |
| `--tracking-labels`  | 0.1em   | Uppercase labels |
| `--tracking-body`    | 0.01em  | Body text        |

## Typography Components

Located in `src/components/typography/`:

| Component   | Purpose                           | Default Colour |
| ----------- | --------------------------------- | -------------- |
| `Overline`  | Uppercase labels, section headers | muted          |
| `Caption`   | Dates, metadata, supporting text  | muted          |
| `Body`      | Taglines, descriptions            | muted          |
| `SheenText` | Interactive text with animation   | fg             |

### Common Props

All typography components accept:

- `tag` - HTML element to render (default varies by component)
- `color` - `fg` or `muted`
- `class` - Additional CSS classes
- Spread attributes for flexibility

### Caption Specific

- `numeric` prop enables `font-variant-numeric: tabular-nums` for aligned numbers

## Container Queries

The site uses container queries for responsive layout.

### Page Container

The `<body>` element is a named container:

```html
<body class="@container/page min-h-screen"></body>
```

### Usage in CSS

```css
@container page (min-width: 32rem) {
  .element {
    /* wider container styles */
  }
}
```

### Breakpoint Values

Defined in `@theme` block of `global.css`:

```css
--container-md: 28rem; /* 448px */
--container-lg: 32rem; /* 512px */
```

### Media Queries (Preserved)

User preference queries remain as `@media`:

- `@media (prefers-reduced-motion: reduce)` - Accessibility
- `@media print` - Print styles

## LogoMark Component

Located at `src/components/navigation/LogoMark.astro`.

### Specification

The logomark is **"SF."** (initials plus period), matching the full "Sam Folorunsho." wordmark style.

### Responsive Behaviour

- Shows "SF." on containers < 32rem (512px)
- Shows "Sam Folorunsho." on containers ≥ 32rem

### Props

| Prop      | Type     | Default  | Description                       |
| --------- | -------- | -------- | --------------------------------- |
| `href`    | `string` | required | Link destination                  |
| `label`   | `string` | required | Accessible label (aria-label)     |
| `onClick` | `string` | -        | Handler identifier (data-onclick) |

### Usage

```astro
<LogoMark href="/" label="Go to home" onClick="scrollToTop" />
```

**Locations:** Fixed header, uses `page` container for responsive breakpoint

## Spacing Scale (Base-8)

| Token        | Value   | Pixels |
| ------------ | ------- | ------ |
| `--space-05` | 0.25rem | 4px    |
| `--space-1`  | 0.5rem  | 8px    |
| `--space-2`  | 1rem    | 16px   |
| `--space-3`  | 1.5rem  | 24px   |
| `--space-4`  | 2rem    | 32px   |
| `--space-5`  | 2.5rem  | 40px   |
| `--space-6`  | 3rem    | 48px   |
| `--space-7`  | 4rem    | 64px   |
| `--space-8`  | 5rem    | 80px   |
| `--space-9`  | 6rem    | 96px   |

## Layout Tokens

Safe area insets for mobile devices (`src/styles/tokens/layout.css`):

```css
:root {
  --safe-area-top: env(safe-area-inset-top, 0);
  --safe-area-right: env(safe-area-inset-right, 0);
  --safe-area-bottom: env(safe-area-inset-bottom, 0);
  --safe-area-left: env(safe-area-inset-left, 0);
}
```

Used by FixedHeader and FixedFooter for iOS notch/home indicator avoidance.

## Tailwind Integration

### Configuration (`global.css`)

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  --color-bg: var(--bg);
  --color-fg: var(--fg);
  /* ... maps tokens to Tailwind theme */
}
```

### Using Tokens in Tailwind

```html
<div class="bg-bg text-fg p-spacing-4"></div>
```

### Typography Plugin

Prose styles customised in `prose.css` to use design tokens.

## Syntax Highlighting

### Custom Shiki Theme

Located at `src/lib/shiki/theme.ts`, maps TextMate scopes to CSS variables.

### Token Architecture

Three-level cascade in `src/styles/components/shiki.css`:

1. **Global defaults** (`:root`)
2. **Per-theme overrides** (`.theme-*`)
3. **Per-language-per-theme** (`.theme-* [data-language="*"]`)

### Variable Naming

```
--syn-*         → Foundation semantic tokens
--shiki-*       → Shiki integration tokens
--astro-code-*  → Astro output tokens
```

### Token Categories

| Category    | Example Variables                           |
| ----------- | ------------------------------------------- |
| Keywords    | `--syn-keyword`                             |
| Functions   | `--syn-function`                            |
| Strings     | `--syn-string`, `--syn-string-alt`          |
| Constants   | `--syn-constant`                            |
| Numbers     | `--syn-number`                              |
| Types       | `--syn-type`                                |
| Comments    | `--syn-comment`                             |
| Punctuation | `--syn-punctuation`                         |
| Diff        | `--syn-diff-add-bg`, `--syn-diff-remove-bg` |

## Animations and Transitions

### Transition Tokens

```css
--transition-instant: 50ms ease;
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .element {
    transition: none;
  }
}
```

Applied throughout for accessibility.

## Z-Index Scale

```css
--z-behind: -1;
--z-base: 0;
--z-raised: 10;
--z-dropdown: 100;
--z-sticky: 200;
--z-overlay: 300;
--z-modal: 400;
--z-popover: 500;
--z-tooltip: 600;
--z-header: 900;
--z-max: 9999;
```

## Modifying Themes

### Adding a New Theme

1. Add to `src/config/themes.ts`:

   ```typescript
   export const THEME_ORDER = [
     "steel",
     "purple",
     "charcoal",
     "teal",
     "new",
   ] as const;
   export const THEME_LABELS: Record<Theme, string> = {
     // ... existing
     new: "NEW THEME DESCRIPTION",
   };
   ```

2. Add colour definitions in `src/styles/tokens/colours.css`:

   ```css
   .theme-new {
     --bg: oklch(...);
     --fg: oklch(...);
     --muted: oklch(...);
     --rule: oklch(...);
     --highlight: oklch(...);
     --emphasis: oklch(...);
   }
   ```

3. Add syntax tokens in `src/styles/components/shiki.css`:

   ```css
   .theme-new {
     --syn-keyword: oklch(...);
     /* ... */
   }
   ```

4. Add hex colours in `src/lib/theme/palette.ts` for OG images and theme-color meta:

   ```typescript
   export const THEME_COLOURS: Record<Theme, ThemeColours> = {
     // ... existing
     new: {
       bg: oklchToHex(...),
       fg: oklchToHex(...),
       muted: oklchToHex(...),
       rule: oklchToHex(...),
     },
   };
   ```

5. Add favicon at `public/sf-new.ico`

### Cross-Component Colour Sync

When modifying theme colours, update:

- [ ] `src/config/themes.ts` - Theme metadata
- [ ] `src/styles/tokens/colours.css` - Base theme CSS
- [ ] `src/styles/components/shiki.css` - Syntax highlighting
- [ ] `src/lib/theme/palette.ts` - Hex values for JS usage
- [ ] `public/sf-*.ico` - Theme favicon
- [ ] `public/rss/styles.xsl` - RSS feed (optional, uses steel)

**Note:** Boids animation reads `--rule` dynamically from CSS at runtime, so no manual colour sync needed.
