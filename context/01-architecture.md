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
| Deployment          | Docker + Cloud Run    | Node 22 Alpine        |

## Key Configuration Files

### `astro.config.mjs`

- Site URL: `https://samfolorunsho.com`
- Output mode: `server` (SSR)
- Trailing slashes: disabled
- MDX integration enabled
- Custom rehype plugins for code blocks and heading anchors
- Shiki theme: Custom CSS variables theme (`src/lib/shiki-theme.ts`)

### `tsconfig.json`

- Extends `astro/tsconfigs/strict`
- Strict TypeScript mode enabled

### `package.json`

- Type: ESM (`"type": "module"`)
- Scripts: `dev`, `build`, `preview`

## Project Structure

```
personal-site/
├── .github/workflows/      # CI/CD (deploy.yml)
├── context/                # Project documentation (this directory)
├── public/                 # Static assets
│   ├── fonts/              # Switzer, CommitMono
│   ├── rss/                # RSS stylesheet
│   ├── favicon.svg
│   ├── og-default.svg
│   └── robots.txt
├── scripts/                # Cloud Run utility scripts
├── src/
│   ├── components/         # Astro components
│   ├── content/
│   │   └── blog/           # MDX blog posts
│   ├── layouts/            # Page layouts (Base, Post)
│   ├── lib/                # Shared utilities (shiki-theme)
│   ├── pages/              # File-based routing
│   ├── plugins/            # Rehype plugins
│   ├── scripts/            # Client-side TypeScript
│   ├── styles/             # CSS (global, prose, tokens, components)
│   └── utils/              # Helper functions
├── content.config.ts       # Content collection schema
└── config.ts               # Site configuration
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

## Layouts

### `Base.astro`

The root layout providing:

- HTML document structure
- SEO component injection
- JSON-LD structured data
- Theme class on `<body>`
- Fixed header and footer
- Font preloading (Switzer)
- View transitions (Astro ClientRouter)
- Theme persistence via localStorage

### `Post.astro`

Blog post layout extending Base with:

- Article JSON-LD schema
- Post header (title, date, tags)
- Reading time
- Previous/next navigation
- Prose typography styles

## View Transitions

Astro's View Transitions API is enabled via `ClientRouter`. All client scripts that modify DOM need to reinitialise after transitions using:

```typescript
document.addEventListener("astro:after-swap", init);
```

This pattern is used by:

- `scroll-header.ts`
- `sheen.ts` and related
- `boids.ts`
- `ThemeSwitcher.astro`
- `code-copy.ts`

## Build Output

The build produces a standalone Node.js server:

```
dist/
├── server/
│   └── entry.mjs    # Server entry point
└── client/          # Static assets
```

Entry point for Docker: `node dist/server/entry.mjs`
