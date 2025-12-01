# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev       # Start local dev server at localhost:4321
npm run build     # Build production site to ./dist/
npm run preview   # Preview production build locally
```

## Architecture

This is an Astro 5 personal site using server-side rendering (SSR) with the Node.js adapter.

**Key Configuration:**
- Output mode: `server` (SSR via `@astrojs/node` in standalone mode)
- Styling: Tailwind CSS v4 via Vite plugin
- Content: MDX integration enabled
- TypeScript: Strict mode extending `astro/tsconfigs/strict`

**Project Structure:**
- `src/pages/` - Astro pages (file-based routing)
- `src/styles/global.css` - Global styles with Tailwind import
- `scripts/` - gcloud utility scripts for Cloud Run management

## Deployment

The site deploys to Google Cloud Run via GitHub Actions (`.github/workflows/deploy.yml`):

- **Production**: Pushes to `main` deploy to the live service
- **Preview**: Pushes to any other branch create tagged preview deployments (no traffic routing)

**Useful Scripts:**
- `scripts/cleanup-previews.sh` - Remove preview traffic tags
- `scripts/url.sh`, `scripts/logs.sh`, `scripts/revisions.sh` - Cloud Run utilities

**Docker**: Multi-stage build using Node 22 Alpine, exposes port 4321.
