# Interactive Features

## Overview

The site includes several interactive elements:
1. **Boids Animation** - Flocking background on home page
2. **Sheen Text Effect** - Colour sweep on hover
3. **Theme Switching** - Real-time theme changes
4. **View Transitions** - Smooth page navigation
5. **Scroll-Aware Header** - Shows/hides based on scroll position
6. **Code Block Enhancement** - Copy button, language labels

## Boids Animation

### Location
- Component: `src/components/Boids.astro`
- Logic: `src/scripts/boids.ts`

### Implementation
Uses p5.js in instance mode for a flocking simulation:
- Paper aeroplane boids with network lines
- Three flocking forces: separation, alignment, cohesion
- Centre-fade to keep content readable
- Scroll-triggered scatter/respawn behaviour

### Key Constants
```typescript
const POPULATION = 80;           // Desktop
const POPULATION_MOBILE = 50;    // Mobile
const PERCEPTION_RADIUS = 70;    // Flocking awareness
const MAX_SPEED = 3.2;
const MAX_FORCE = 0.12;
const CENTRE_CLEAR_ZONE = 360;   // Content column half-width
```

### Theme Integration
Boids colour matches theme via hardcoded RGB values:
```typescript
const THEME_COLOURS = {
  steel: { r: 58, g: 64, b: 74 },
  purple: { r: 41, g: 32, b: 54 },
  charcoal: { r: 75, g: 75, b: 75 },
  teal: { r: 45, g: 65, b: 65 },
};
```

**Note**: When adding themes, update this object.

### Scroll Behaviour
Uses Intersection Observer on hero wordmark:
- **Wordmark visible**: Boids respawn with fade-in
- **Wordmark hidden**: Boids scatter to edges with fade-out

### Performance Optimisations
- Skip rendering when document hidden (`document.hidden`)
- Skip when all boids have exited
- Frame rate capped at 30 FPS
- Network lines disabled during scatter
- Mobile has fewer boids

### Reinitialisation
After View Transitions:
```typescript
document.addEventListener('astro:after-swap', init);
```

## Sheen Text Effect

### Location
- Component: `src/components/SheenText.astro`
- Core logic: `src/scripts/sheen-core.ts`
- Applied to links: `src/scripts/sheen-links.ts`
- Applied to headings: `src/scripts/sheen-headings.ts`

### How It Works
1. Text split into individual character spans at build time
2. On hover/focus, characters animate colour left-to-right
3. Highlight colour applied to centre character
4. Adjacent characters get blended colours

### Component Props
```typescript
interface Props {
  text: string;               // Text to display
  tag?: HTMLElementTagNameMap; // HTML tag (default: 'span')
  interval?: number;          // Animation speed (default: 15ms)
  spread?: number;            // Characters to highlight (default: 2)
}
```

### CSS Requirements
```css
.sheen-char {
  display: inline-block;
  transition: color var(--transition-instant);
}
```

### Usage in Components
```astro
<SheenText text="Sam Folorunsho" tag="h1" interval={30} spread={3} />
```

### Automatic Application
- `sheen-links.ts`: Applies to prose links on blog posts
- `sheen-headings.ts`: Applies to h2-h6 in prose

## Theme Switching

### Location
`src/components/ThemeSwitcher.astro`

### Implementation
- Four-button selector with diagonal colour preview
- Background shows theme `--bg`, foreground shows theme `--fg`
- Persists selection to localStorage
- Updates body class and active button state

### Integration Points
1. **Base layout**: Initial switcher in top-right (visible with hero)
2. **Fixed header**: Compact switcher when scrolled

### Theme Persistence Pattern
```javascript
// Write
localStorage.setItem('theme', themeId);
document.body.classList.add(`theme-${themeId}`);

// Read (inline script, runs before paint)
const saved = localStorage.getItem('theme');
if (saved) document.body.classList.add(`theme-${saved}`);

// After View Transitions
document.addEventListener('astro:after-swap', applyStoredTheme);
```

## View Transitions

### Location
- Enabled in: `src/layouts/Base.astro`
- Styles: `src/styles/transitions.css`
- Handler: `src/scripts/view-transitions.ts`

### Implementation
Uses Astro's `<ClientRouter />` component for native View Transitions API.

### Critical Pattern
All scripts modifying DOM must reinitialise after transitions:
```typescript
function init() {
  // Setup code
}

init();
document.addEventListener('astro:after-swap', init);
```

### Scripts Using This Pattern
- `scroll-header.ts`
- `boids.ts`
- `sheen.ts` (and related)
- `ThemeSwitcher.astro`
- `code-copy.ts`
- `heading-anchors.ts`

## Scroll-Aware Header

### Location
- Component: `src/components/FixedHeader.astro`
- Controller: `src/scripts/scroll-header.ts`

### Behaviour
- **Home page** (with hero): Header hidden until wordmark scrolls out
- **Other pages**: Header always visible

### Detection
Uses `data-scroll-trigger` attribute on hero wordmark:
```typescript
const scrollTrigger = document.querySelector('[data-scroll-trigger]');
const isHomePage = scrollTrigger !== null;
```

### Intersection Observer
```typescript
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        header.classList.remove('visible');
      } else {
        header.classList.add('visible');
      }
    });
  },
  { rootMargin: '-80px 0px 0px 0px' }
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
2. Populates language label in sentence case
3. Adds clipboard copy functionality
4. Shows "Copied" feedback for 2 seconds

### Copy Button Styling
- Hidden by default (`opacity: 0`)
- Shows on block hover/focus
- Keyboard accessible

## Heading Anchors

### Location
- Rehype plugin: `src/plugins/rehype-heading-anchors.ts`
- Client script: `src/scripts/heading-anchors.ts`
- Styles: `src/styles/prose.css`

### Build-Time Processing
Adds to h2-h6:
- `id` attribute (URL-safe slug)
- Anchor link with `§` symbol

### Styling
```css
.heading-anchor {
  position: absolute;
  left: calc(-1 * var(--space-5));
  opacity: 0;
}

h2:hover .heading-anchor { opacity: 1; }
```

## Accessibility Considerations

### Reduced Motion
All animations respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  .animated-element { transition: none; }
}
```

### Keyboard Navigation
- Theme switcher buttons focusable
- Code copy buttons focusable
- Heading anchors focusable
- Skip to content (header navigation)

### ARIA Labels
- Theme buttons: "Steel grey + warm cream", etc.
- Copy button: "Copy code to clipboard"
- Heading anchors: "Link to section: {heading text}"

## Performance Notes

### Boids Animation
- Most computationally intensive feature
- Disabled on tab blur (`document.hidden`)
- Reduced population on mobile
- Consider disabling for users preferring reduced motion

### Sheen Effect
- Pre-split characters at build time (no runtime DOM manipulation)
- CSS transitions only (GPU accelerated)
- Minimal JavaScript (just colour calculations)

### View Transitions
- Native browser API when supported
- Fallback to immediate navigation when not
- Styles scoped to transition duration

## Debugging Interactive Features

### Boids Not Appearing
1. Check container exists: `#boids-canvas`
2. Check hero wordmark exists: `#hero-wordmark`
3. Check console for p5.js errors
4. Verify not on mobile with reduced motion

### Sheen Not Working
1. Check `[data-sheen-ready]` attribute exists
2. Verify character spans present: `.sheen-char`
3. Check CSS transitions not disabled

### Header Not Showing
1. Verify `#fixed-header` exists
2. Check `[data-scroll-trigger]` on home page
3. Inspect Intersection Observer in DevTools

### Theme Not Persisting
1. Check localStorage in DevTools
2. Verify inline script runs before paint
3. Check `astro:after-swap` listener registered
