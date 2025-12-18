# CLAUDE.md

Guidance for Claude Code when working with this repository.

## Commands

```bash
npm run dev      # Development server (localhost:4321)
npm run build    # Production build to ./dist/
npm run preview  # Preview production build locally
npm run lint     # ESLint (add --fix to auto-fix)
npm run check    # Astro + TypeScript checks
```

## Tech Stack

Astro 5 (SSR mode, Node.js adapter), TypeScript, Tailwind CSS v4, MDX for blog content, Shiki for syntax highlighting, p5.js for canvas animations.

Deployment: Docker → Google Cloud Run via GitHub Actions.

## Skills

Consult **coding-standards** when implementing features, reviewing code, or refactoring. Contains type discipline, naming conventions, Astro patterns, JSDoc standards, and review checklists.

Consult **writing-content** when adding blog posts or static pages. Contains frontmatter schema, MDX patterns, Shiki transformer usage, and sitemap requirements.

Consult **managing-seo** when working with meta tags, structured data, or feeds. Contains SEO component usage, JSON-LD schemas, RSS configuration, and OG image generation.

Consult **managing-deployment** when working with CI/CD, infrastructure, or monitoring. Contains GitHub Actions workflow, Cloud Run configuration, Docker setup, and Cloudflare/UptimeRobot details.

Consult **maintaining-design-system** when modifying colours, typography, or spacing. Contains token locations, theme definitions, synchronisation requirements, and Shiki theme configuration.

## Imports

Prefer relative imports within component directories. Use `../` for cross-directory imports within `src/`.

Import order: third-party → Astro → parent (`../`) → sibling (`./`) → styles. Run `npm run lint -- --fix` to auto-organise.

Separate `import type` onto its own line:

```typescript
import type {Theme} from '../config/themes';
import {THEME_ORDER, THEME_LABELS} from '../config/themes';
```

## File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase.astro | `BlogList.astro` |
| Utilities | kebab-case.ts | `format-date.ts` |
| Config | kebab-case.ts | `navigation.ts` |
| Types | types.ts | `types.ts` |
| Scripts | kebab-case.ts | `scroll-header.ts` |
| Blog posts | kebab-case.mdx | `structured-outputs.mdx` |

Astro special files: `[...slug].astro`, `rss.xml.ts`, `sitemap.xml.ts`

## Conventions

British English throughout—code, comments, documentation, content.

Four themes: steel (default), purple, charcoal, teal. Theme class applied to `<html>`.

Design tokens in `src/styles/tokens/`. Semantic colour variables: `--bg`, `--fg`, `--muted`, `--rule`, `--highlight`, `--emphasis`.

## Gotchas

Static pages require manual sitemap entry in `src/pages/sitemap.xml.ts`.

Shiki theme uses CSS variables (`src/lib/shiki-theme.ts`) with per-theme overrides in `src/styles/components/shiki.css`. When adding themes, update both token definitions and Shiki overrides.

Components using `transition:persist` (FixedHeader, FixedFooter) require scripts to reinitialise after view transitions via `astro:after-swap` event.

## Documentation Style

All documentation must be:

- **Brief**: No superfluous text or formatting
- **Concise**: Highest signal-to-noise ratio
- **Precise**: Exact terminology, no ambiguity
- **Effective**: Actionable information only

Code examples must follow all style conventions. Never reference explicit values in JSDoc comments—values change and cause drift.

## Development Approach

This is a personal project. Iterate freely, refactor aggressively. No backwards compatibility concerns.
