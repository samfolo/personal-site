# Project Architecture

## Overview

This is an Astro 5 personal site using server-side rendering (SSR) with the Node.js adapter. It combines content collections for blog posts with static pages, all styled with Tailwind CSS v4.

## Technology Stack

| Layer               | Technology            | Version               |
| ------------------- | --------------------- | --------------------- |
| Framework           | Astro                 | 5.x                   |
| Rendering           | SSR (Node.js adapter) | Standalone mode       |
| Styling             | Tailwind CSS          | 4.x (via Vite plugin) |
| Content             | MDX                   | Via @astrojs/mdx      |
| Syntax Highlighting | Shiki                 | Built into Astro      |
| Animation           | p5.js                 | 2.x                   |
| Colour Utilities    | Culori                | 4.x (OKLCH parsing)   |
| Deployment          | Docker + Cloud Run    | Node 22 Alpine        |

## Key Configuration Files

### `astro.config.mjs`

- Site URL: `https://samfolorunsho.com`
- Output mode: `server` (SSR)
- Trailing slashes: disabled
- MDX integration enabled
- Custom rehype plugins for code blocks and heading anchors
- Shiki theme: Custom CSS variables theme (`src/lib/shiki/theme.ts`)
- Vite: External handling for `@resvg/resvg-js` (OG image generation)

### `tsconfig.json`

- Extends `astro/tsconfigs/strict`
- Strict TypeScript mode enabled

### `package.json`

- Type: ESM (`"type": "module"`)
- Scripts: `dev`, `build`, `preview`, `lint`, `check`, `fmt`, `fmt:check`

## Development Commands

```bash
npm run dev       # Start local dev server at localhost:4321
npm run build     # Build production site to ./dist/
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
npm run check     # Run Astro type checking
npm run fmt       # Format code with Prettier
npm run fmt:check # Check formatting without modifying
```

## Project Structure

```
personal-site/
├── .github/workflows/      # CI/CD (deploy.yml)
├── context/                # Project documentation (this directory)
├── public/                 # Static assets
│   ├── fonts/              # Switzer, CommitMono
│   ├── rss/                # RSS stylesheet
│   ├── sf-*.ico            # Theme-specific favicons
│   └── robots.txt
├── scripts/                # Cloud Run utility scripts
├── src/
│   ├── components/         # Astro components (organised by domain)
│   │   ├── blog/           # BlogList, PostMeta, PostNav, PostTags
│   │   ├── chrome/         # FixedHeader, FixedFooter
│   │   ├── hero/           # Boids, Hero, HeroWordmark
│   │   ├── navigation/     # LogoMark, Nav, NavLink
│   │   ├── seo/            # SEO, JSONLD
│   │   ├── theme/          # ThemeSwitcher, ThemeSwitcherButton
│   │   └── typography/     # SheenText, Overline, Caption, Body
│   ├── config/             # Configuration constants
│   │   ├── dom/            # DOM IDs and selectors
│   │   ├── cache.ts        # Cache duration constants
│   │   ├── navigation.ts   # Nav link definitions
│   │   ├── sheen.ts        # Sheen animation presets
│   │   ├── storage.ts      # localStorage key definitions
│   │   └── themes.ts       # Theme order, labels, classes
│   ├── content/
│   │   └── blog/           # MDX blog posts
│   ├── layouts/            # Page layouts (Base, Prose, Post)
│   ├── lib/                # Shared utilities
│   │   ├── og/             # OG image generation
│   │   ├── shiki/          # Shiki theme configuration
│   │   └── theme/          # Theme colour utilities
│   ├── pages/              # File-based routing
│   ├── plugins/            # Rehype plugins
│   ├── scripts/            # Client-side TypeScript
│   │   └── sheen/          # Sheen animation modules
│   ├── styles/             # CSS
│   │   ├── tokens/         # Design tokens
│   │   └── components/     # Component-specific styles
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Helper functions
├── src/content.config.ts   # Content collection schema
└── src/config.ts           # Site configuration
```

## Configuration Central (`src/config.ts`)

Site-wide constants are centralised:

```typescript
export const SITE = {
  name: "Sam Folorunsho",
  url: "https://samfolorunsho.com",
  description: "...",
  locale: "en-GB",
  ogLocale: "en_GB",
  author: {
    name: "Sam Folorunsho",
    jobTitle: "Software Engineer",
    github: "https://github.com/samfolo",
    linkedin: "https://www.linkedin.com/in/sam-folorunsho",
  },
};
```

## Component Organisation

Components are grouped by domain with barrel exports:

```typescript
// Import pattern
import {BlogList, PostMeta} from "../components/blog";
import {FixedHeader, FixedFooter} from "../components/chrome";
import {SheenText, Overline} from "../components/typography";
```

Each group has an `index.ts` barrel file that exports all components.

## File-Based Routing

| Route          | Page                          | Description                  |
| -------------- | ----------------------------- | ---------------------------- |
| `/`            | `src/pages/index.astro`       | Home with Hero and blog list |
| `/blog`        | `src/pages/blog/index.astro`  | Blog index                   |
| `/blog/[slug]` | `src/pages/blog/[slug].astro` | Individual posts (SSR)       |
| `/about`       | `src/pages/about.astro`       | About page                   |
| `/uses`        | `src/pages/uses.astro`        | Uses page                    |
| `/rss.xml`     | `src/pages/rss.xml.ts`        | RSS feed                     |
| `/sitemap.xml` | `src/pages/sitemap.xml.ts`    | XML sitemap                  |
| `/og/*.png`    | `src/pages/og/[...slug].png.ts` | Dynamic OG images          |

## Layouts

### `Base.astro`

The root layout providing:

- HTML document structure
- SEO component injection
- JSON-LD structured data (WebSite schema)
- Theme class on `<html>` element
- Fixed header and footer
- Initial theme switcher (visible on home page when header is hidden)
- Font preloading (Switzer)
- View transitions (Astro ClientRouter)
- Theme persistence via localStorage

### `Prose.astro`

Shared layout for prose content pages (extends Base):

- Consistent container structure with header and content sections
- Named slots: `meta`, `before`, `after`
- SheenText heading with configurable animation
- Used by: About, Uses, Blog index, individual blog posts

### `Post.astro`

Blog post layout (extends Prose):

- Article JSON-LD schema
- Post metadata (date, reading time)
- Post tags
- Previous/next navigation
- Loads blog-specific client scripts (code-copy, heading-anchors, sheen)

## View Transitions

Astro's View Transitions API is enabled via `ClientRouter`. All client scripts that modify DOM must reinitialise after transitions using:

```typescript
document.addEventListener("astro:after-swap", init);
```

Scripts using this pattern:

- `scroll-header.ts`
- `boids.ts`
- `sheen/controller.ts`
- `ThemeSwitcher.astro`
- `code-copy.ts`
- `heading-anchors.ts`
- `favicon.ts` / `theme-color.ts` (via inline scripts)

## Build Output

The build produces a standalone Node.js server:

```
dist/
├── server/
│   └── entry.mjs    # Server entry point
└── client/          # Static assets
```

Entry point for Docker: `node dist/server/entry.mjs`
