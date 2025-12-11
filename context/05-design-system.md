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
│   ├── z-index.css         # Stacking context
│   ├── transitions.css     # Animation timings
│   └── borders.css         # Border widths
└── components/
    └── shiki.css           # Code block styling
```

## Colour Themes

### Available Themes
| Theme | Class | Background | Foreground | Accent |
|-------|-------|------------|------------|--------|
| Steel | `.theme-steel` | Blue-grey | Warm cream | Cool highlight |
| Purple | `.theme-purple` | Dark purple | Gold | Magenta |
| Charcoal | `.theme-charcoal` | Warm grey | Off-white | Neutral |
| Teal | `.theme-teal` | Dark teal | Coral | Cyan |

### Theme Tokens
Each theme defines six semantic colours:
```css
.theme-steel {
  --bg: oklch(0.2293 0.009 255.6);      /* Background */
  --fg: oklch(0.9615 0.0098 87.47);     /* Foreground/text */
  --muted: oklch(0.6334 0 0);           /* Secondary text */
  --rule: oklch(0.359 0.0095 260.72);   /* Borders, dividers */
  --highlight: oklch(0.75 0.02 250);    /* Links, accents */
  --emphasis: oklch(0.99 0.015 87.47);  /* Strong emphasis */
}
```

### OKLCH Colour Space
All colours use OKLCH for perceptual uniformity:
- `L` - Lightness (0-1)
- `C` - Chroma (saturation)
- `H` - Hue angle (degrees)

### Theme Application
Theme class applied to `<body>`:
```html
<body class="theme-steel">
```

Changed via `ThemeSwitcher` component, persisted to localStorage.

### Theme Persistence
```javascript
// Set theme
localStorage.setItem('theme', themeId);
document.body.classList.add(`theme-${themeId}`);

// Restore on load (inline script in Base.astro)
const saved = localStorage.getItem('theme');
if (saved) document.body.classList.add(`theme-${saved}`);

// Restore after View Transitions
document.addEventListener('astro:after-swap', applyStoredTheme);
```

## Typography

### Font Families
| Token | Font | Fallbacks |
|-------|------|-----------|
| `--font-sans` | Switzer (variable) | system-ui, sans-serif |
| `--font-mono` | CommitMono | JetBrains Mono, monospace |

### Type Scale (Minor Third - 1.2 ratio)
| Token | Size | Pixels |
|-------|------|--------|
| `--text-xs` | 0.6875rem | 11px |
| `--text-sm` | 0.8125rem | 13px |
| `--text-base` | 1rem | 16px |
| `--text-md` | 1.1875rem | 19px |
| `--text-lg` | 1.4375rem | 23px |
| `--text-xl` | 1.75rem | 28px |
| `--text-2xl` | 2.0625rem | 33px |
| `--text-3xl` | 2.5rem | 40px |

### Line Heights (8px Grid)
| Token | Value | Pixels |
|-------|-------|--------|
| `--leading-16` | 1rem | 16px |
| `--leading-24` | 1.5rem | 24px |
| `--leading-32` | 2rem | 32px |
| `--leading-40` | 2.5rem | 40px |
| `--leading-48` | 3rem | 48px |

### Letter Spacing
| Token | Value | Use |
|-------|-------|-----|
| `--tracking-display` | -0.03em | Headings |
| `--tracking-labels` | 0.1em | Uppercase labels |
| `--tracking-body` | 0.01em | Body text |

## Spacing Scale (Base-8)

| Token | Value | Pixels |
|-------|-------|--------|
| `--space-05` | 0.25rem | 4px |
| `--space-1` | 0.5rem | 8px |
| `--space-2` | 1rem | 16px |
| `--space-3` | 1.5rem | 24px |
| `--space-4` | 2rem | 32px |
| `--space-5` | 2.5rem | 40px |
| `--space-6` | 3rem | 48px |
| `--space-7` | 4rem | 64px |
| `--space-8` | 5rem | 80px |
| `--space-9` | 6rem | 96px |

## Tailwind Integration

### Configuration (`global.css`)
```css
@import 'tailwindcss';
@plugin "@tailwindcss/typography";

@theme {
  --color-bg: var(--bg);
  --color-fg: var(--fg);
  /* ... maps tokens to Tailwind theme */
}
```

### Using Tokens in Tailwind
```html
<div class="bg-bg text-fg p-spacing-4">
```

### Typography Plugin
Prose styles customised in `prose.css` to use design tokens.

## Syntax Highlighting

### Custom Shiki Theme
Located at `src/lib/shiki-theme.ts`, maps TextMate scopes to CSS variables.

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
| Category | Example Variables |
|----------|-------------------|
| Keywords | `--syn-keyword` |
| Functions | `--syn-function` |
| Strings | `--syn-string`, `--syn-string-alt` |
| Constants | `--syn-constant` |
| Numbers | `--syn-number` |
| Types | `--syn-type` |
| Comments | `--syn-comment` |
| Punctuation | `--syn-punctuation` |
| Diff | `--syn-diff-add-bg`, `--syn-diff-remove-bg` |

### Adding Language Overrides
```css
.theme-steel pre.astro-code[data-language="css"] {
  --shiki-token-keyword: var(--syn-string);
  --shiki-token-property: var(--syn-fg);
}
```

## Prose Typography (`prose.css`)

Extends Tailwind Typography with design tokens:
- Maps `--tw-prose-*` variables to theme colours
- Custom heading styles with proper line heights
- Anchor link styling with border-bottom
- Table formatting
- Code block spacing
- Blockquote styling
- List styling

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
  .element { transition: none; }
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
1. Add colour definitions in `colours.css`:
   ```css
   .theme-new {
     --bg: oklch(...);
     --fg: oklch(...);
     /* ... */
   }
   ```

2. Add syntax tokens in `shiki.css`:
   ```css
   .theme-new {
     --syn-keyword: oklch(...);
     /* ... */
   }
   ```

3. Add theme to switcher in `ThemeSwitcher.astro`:
   ```typescript
   const themes = [
     // ... existing
     { id: 'new', label: 'New theme description' },
   ];
   ```

4. Add boids colour in `boids.ts`:
   ```typescript
   const THEME_COLOURS = {
     // ... existing
     new: { r: 0, g: 0, b: 0 },
   };
   ```

### Cross-Component Colour Sync
When modifying theme colours, update:
- [ ] `src/styles/tokens/colours.css` - Base theme
- [ ] `src/styles/components/shiki.css` - Syntax highlighting
- [ ] `src/scripts/boids.ts` - Background animation
- [ ] `public/rss/styles.xsl` - RSS feed (optional, uses steel)
- [ ] `public/og-default.svg` - OG image (optional, uses steel)
