# samfolorunsho.com

Source code for my personal site—a portfolio, blog, and space for creative experiments.

## Prerequisites

- **Node.js 22+** (see Dockerfile for exact version) ([install](https://nodejs.org/en/download/))
- **npm** (or equivalent package manager, `npm` comes with Node.js)
- **Docker** for building production images ([install](https://www.docker.com/products/docker-desktop/))
- **gcloud CLI** for running deployment scripts ([install](https://cloud.google.com/sdk/docs/install))

## Quick Start

```bash
npm install
npm run dev
```

Open [localhost:4321](http://localhost:4321).

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build to `./dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint (add `--fix` to auto-fix) |
| `npm run check` | Astro + TypeScript type checking |
| `npm run fmt` | Format with Prettier |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Astro 5 (SSR, Node.js adapter) |
| Styling | Tailwind CSS 4 |
| Content | MDX |
| Syntax Highlighting | Shiki (custom CSS variables theme) |
| Animation | p5.js |
| Deployment | Docker → Google Cloud Run |

## Project Structure

```
src/
├── components/     # Astro components, organised by domain
├── config/         # Constants (themes, navigation, DOM selectors)
├── content/blog/   # MDX blog posts
├── layouts/        # Page layouts
├── lib/            # Internal libraries (OG image generation, Shiki theme)
├── pages/          # File-based routing
├── plugins/        # Rehype plugins
├── scripts/        # Client-side TypeScript
├── styles/         # Global CSS and design tokens
└── utils/          # Pure utility functions
```

Static assets in `public/`. Deployment config in `.github/workflows/`.

## Deployment

Every push triggers deployment via GitHub Actions:

- **main** → Production (100% traffic)
- **other branches** → Preview (tagged, no traffic)

### Required Secrets

| Secret | Description |
|--------|-------------|
| `GCP_PROJECT_ID` | Google Cloud project ID |
| `GCP_SA_KEY` | Service account JSON key |

### Utility Scripts

Requires gcloud CLI authenticated to the project.

```bash
./scripts/url.sh              # Get production URL
./scripts/logs.sh             # View Cloud Run logs
./scripts/revisions.sh        # List revisions
./scripts/cleanup-previews.sh # Remove preview tags
```

## AI Usage

This project is developed and maintained with assistance from Claude Code. Project-level configuration exists in the `.claude/` directory.

See [CLAUDE.md](./CLAUDE.md) for development guidance and available skills.

## Links

- [Uptime Robot](https://stats.uptimerobot.com/7YrzjwrjbR)
- [Google Cloud Console](https://console.cloud.google.com/home/dashboard)
