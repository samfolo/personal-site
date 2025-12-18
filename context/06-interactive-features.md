# Interactive Features

## Overview

The site includes several interactive elements:

1. **Boids Animation** - Flocking background on home page
2. **Sheen Text Effect** - Colour sweep on hover
3. **Theme Switching** - Real-time theme changes
4. **View Transitions** - Smooth page navigation
5. **Scroll-Aware Header** - Shows/hides based on scroll position
6. **Code Block Enhancement** - Copy button, language labels
7. **Heading Anchors** - Clickable section links with URL copy

## Boids Animation

### Location

- Component: `src/components/hero/Boids.astro`
- Logic: `src/scripts/boids.ts`

### Implementation

Uses p5.js in instance mode for a flocking simulation:

- Paper aeroplane boids with network lines
- Three flocking forces: separation, alignment, cohesion
- Centre-fade to keep content readable
- Scroll-triggered scatter/respawn behaviour

### Key Constants

```typescript
const POPULATION = 80; // Desktop
const POPULATION_MOBILE = 50; // Mobile
const PERCEPTION_RADIUS = 70; // Flocking awareness
const MAX_SPEED = 3.2;
const MAX_FORCE = 0.12;
const CENTER_CLEAR_ZONE = 360; // Content column half-width
```

### Theme Integration

Boids colour is read dynamically from CSS at runtime:

```typescript
const getColourFromProperty = (propertyName: string): RGBColour => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(propertyName)
    .trim();
  return parseComputedColour(value);
};

const updateColours = (): void => {
  state.colour = getColourFromProperty("--rule");
};
```

The `--rule` CSS custom property is parsed using a canvas-based approach that handles OKLCH values by forcing the browser to convert them to RGB.

**Note**: No manual colour sync needed when adding themes - boids read from CSS automatically.

### Scroll Behaviour

Uses Intersection Observer on hero wordmark (`#hero-wordmark`):

- **Wordmark visible**: Boids respawn with fade-in
- **Wordmark hidden**: Boids scatter to edges with fade-out

### Performance Optimisations

- Skip rendering when document hidden (`document.hidden`)
- Skip when all boids have exited
- Frame rate capped at 30 FPS
- Network lines disabled during scatter
- Mobile has fewer boids

### Theme Change Detection

Uses MutationObserver on `<html>` element to detect class changes:

```typescript
observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["class"],
});
```

### Reinitialisation

After View Transitions:

```typescript
document.addEventListener("astro:after-swap", init);
```

## Sheen Text Effect

### Location

- Component: `src/components/typography/SheenText.astro`
- Core logic: `src/scripts/sheen/core.ts`
- Controller: `src/scripts/sheen/controller.ts`
- Applied to links: `src/scripts/sheen/links.ts`
- Applied to headings: `src/scripts/sheen/headings.ts`
- Configuration: `src/config/sheen.ts`

### How It Works

1. Text split into individual character spans **at build time** (server-side)
2. Component adds `data-sheen-ready` attribute
3. On hover, JavaScript animates character colours left-to-right
4. Highlight colour applied to centre character
5. Adjacent characters get blended colours via `color-mix()`

### Sheen Configuration (`src/config/sheen.ts`)

```typescript
// Slow, dramatic effect for large headings
export const LARGE_SHEEN = {
  interval: 30, // ms per frame
  spread: 2, // characters on each side
} as const;

// Faster, wider spread for interactive elements
export const MEDIUM_SHEEN = {
  interval: 18,
  spread: 3,
} as const;
```

### Component Props

```typescript
interface Props extends astroHTML.JSX.HTMLAttributes {
  text: string; // Text to display
  tag?: keyof HTMLElementTagNameMap; // HTML tag (default: 'span')
  interval: number; // Animation speed in ms per character
  spread: number; // Characters to highlight on each side
}
```

### Usage

```astro
import {SheenText} from "../components/typography";
import {LARGE_SHEEN} from "../config/sheen";

<SheenText
  text="Sam Folorunsho"
  tag="h1"
  interval={LARGE_SHEEN.interval}
  spread={LARGE_SHEEN.spread}
/>
```

### Automatic Application

In prose content, sheen is applied automatically to:

- Links: `src/scripts/sheen/links.ts` targets `.prose a:not(.heading-anchor)`
- Headings: `src/scripts/sheen/headings.ts` targets `.prose h1, h2, h3, h4, h5`

## Theme Switching

### Location

- Component: `src/components/theme/ThemeSwitcher.astro`
- Button: `src/components/theme/ThemeSwitcherButton.astro`
- Configuration: `src/config/themes.ts`
- Storage keys: `src/config/storage.ts`

### Implementation

- Four-button selector (desktop) or single cycle button (mobile)
- Diagonal colour preview showing theme `--bg` and `--fg`
- Persists selection to localStorage with namespaced key
- Updates `<html>` class and active button state
- Updates favicon and theme-color meta tag

### Related Scripts

- `src/scripts/favicon.ts` - Updates favicon to match theme
- `src/scripts/theme-color.ts` - Updates `<meta name="theme-color">` for Safari

### Desktop vs Mobile

At container width ≥ 32rem (512px):
- Desktop: Four buttons showing all themes
- Mobile: Single button cycling through themes

### Theme Persistence Pattern

```typescript
import {STORAGE_KEYS} from "../config/storage";

// Write
localStorage.setItem(STORAGE_KEYS.THEME, themeId);
document.documentElement.classList.add(`theme-${themeId}`);

// Read (inline script, runs before paint)
const saved = localStorage.getItem("sf.site.theme");
if (saved) document.documentElement.classList.add(`theme-${saved}`);

// After View Transitions
document.addEventListener("astro:after-swap", applyStoredTheme);
```

## View Transitions

### Location

- Enabled in: `src/layouts/Base.astro`
- Styles: `src/styles/transitions.css`

### Implementation

Uses Astro's `<ClientRouter />` component for native View Transitions API.

### Critical Pattern

All scripts modifying DOM must reinitialise after transitions:

```typescript
function init() {
  // Setup code
}

init();
document.addEventListener("astro:after-swap", init);
```

### Scripts Using This Pattern

- `scroll-header.ts`
- `boids.ts`
- `sheen/controller.ts`
- `ThemeSwitcher.astro` (inline script)
- `code-copy.ts`
- `heading-anchors.ts`
- `FixedHeader.astro` (inline script)
- `FixedFooter.astro` (inline script)

## Scroll-Aware Header

### Location

- Component: `src/components/chrome/FixedHeader.astro`
- Controller: `src/scripts/scroll-header.ts`
- DOM config: `src/config/dom/selectors.ts`

### Behaviour

- **Home page** (with hero): Header hidden until wordmark scrolls out
- **Other pages**: Header always visible

### Detection

Uses `data-scroll-trigger` attribute on hero wordmark:

```typescript
import {DOM_SELECTORS} from "../config/dom";

const scrollTrigger = document.querySelector<HTMLElement>(
  DOM_SELECTORS.SCROLL_TRIGGER
);
const isHomePage = scrollTrigger !== null;
```

### Intersection Observer

```typescript
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        header.classList.remove("visible");
        initialSwitcher?.classList.remove("hidden");
      } else {
        header.classList.add("visible");
        initialSwitcher?.classList.add("hidden");
      }
    });
  },
  {rootMargin: "-80px 0px 0px 0px"}
);
```

### Initial Theme Switcher

On home page, a separate theme switcher shows in top-right when header is hidden. Both are synchronised via localStorage.

## Code Block Enhancement

### Location

- Rehype plugin: `src/plugins/rehype-code-blocks.ts`
- Client script: `src/scripts/code-copy.ts`
- Styles: `src/styles/components/shiki.css`

### Build-Time Processing

Rehype plugin wraps code blocks with:

```html
<div class="code-block">
  <span class="code-lang"></span>
  <pre>...</pre>
  <button class="code-copy">Copy</button>
</div>
```

### Client-Side Enhancement

`code-copy.ts`:

1. Reads `data-language` from Shiki's output
2. Populates language label
3. Adds clipboard copy functionality
4. Shows "Copied" feedback for 2 seconds

### Copy Button Behaviour

- Hidden by default (`opacity: 0`)
- Shows on block hover/focus
- Keyboard accessible
- Graceful error handling with "Error" feedback

## Heading Anchors

### Location

- Rehype plugin: `src/plugins/rehype-heading-anchors.ts`
- Client script: `src/scripts/heading-anchors.ts`
- Styles: `src/styles/prose.css`

### Build-Time Processing

Adds to h2-h6:

- `id` attribute (URL-safe slug via `github-slugger`)
- Anchor link with `§` symbol
- `data-heading-anchor` attribute for client-side enhancement

### Client-Side Enhancement

`heading-anchors.ts` provides:

1. **Click to copy URL**: Copies full URL with hash to clipboard
2. **Smooth scroll**: Scrolls to heading on click
3. **Hash navigation**: Handles initial page load with hash

### Styling

```css
.heading-anchor {
  position: absolute;
  left: calc(-1 * var(--space-5));
  opacity: 0;
}

h2:hover .heading-anchor {
  opacity: 1;
}
```

## DOM Selector Configuration

Centralised DOM identifiers prevent drift between components and scripts.

### Location

`src/config/dom/selectors.ts`

### Defined Constants

```typescript
export const DOM_IDS = {
  FIXED_HEADER: "fixed-header",
  INITIAL_THEME_SWITCHER: "initial-theme-switcher",
  THEME_NAME: "theme-name",
  FIXED_FOOTER: "fixed-footer",
} as const;

export const DATA_ATTRS = {
  SCROLL_TRIGGER: "data-scroll-trigger",
  SHEEN: {
    READY: "data-sheen-ready",
    LINK: "data-sheen-link",
    HEADING: "data-sheen-heading",
  },
} as const;

export const DOM_SELECTORS = {
  SCROLL_TRIGGER: `[${DATA_ATTRS.SCROLL_TRIGGER}]`,
  SHEEN: {
    READY: `[${DATA_ATTRS.SHEEN.READY}]`,
  },
  // etc.
} as const;
```

## Accessibility Considerations

### Reduced Motion

All animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  .animated-element {
    transition: none;
  }
}
```

### Keyboard Navigation

- Theme switcher buttons focusable
- Code copy buttons focusable
- Heading anchors focusable
- Navigation links with visible focus states

### ARIA Labels

- Theme buttons: "Steel grey + warm cream", etc.
- Copy button: "Copy code to clipboard"
- Heading anchors: "Link to section: {heading text}"
- LogoMark: Custom aria-label prop

## Performance Notes

### Boids Animation

- Most computationally intensive feature
- Disabled on tab blur (`document.hidden`)
- Reduced population on mobile
- Reads colours at runtime - no frame-by-frame parsing

### Sheen Effect

- Pre-split characters at build time (no runtime DOM manipulation)
- CSS transitions only (GPU accelerated)
- WeakMap used for state to avoid memory leaks

### View Transitions

- Native browser API when supported
- Fallback to immediate navigation when not
- Styles scoped to transition duration

## Debugging Interactive Features

### Boids Not Appearing

1. Check container exists: `#boids-canvas`
2. Check hero wordmark exists: `#hero-wordmark`
3. Check console for p5.js errors
4. Verify `--rule` CSS property is defined
5. Check document visibility state

### Sheen Not Working

1. Check `[data-sheen-ready]` attribute exists
2. Verify character spans present: `.sheen-char`
3. Check CSS transitions not disabled
4. Verify `data-sheen-interval` and `data-sheen-spread` attributes

### Header Not Showing

1. Verify `#fixed-header` exists
2. Check `[data-scroll-trigger]` on home page
3. Inspect Intersection Observer in DevTools

### Theme Not Persisting

1. Check localStorage for `sf.site.theme` key
2. Verify inline script runs before paint
3. Check `astro:after-swap` listener registered
4. Verify theme class applied to `<html>` not `<body>`
