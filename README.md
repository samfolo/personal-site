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

| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Development server with hot reload |
| `npm run build`     | Production build to `./dist/`      |
| `npm run preview`   | Preview production build locally   |
| `npm run lint`      | ESLint (add `--fix` to auto-fix)   |
| `npm run check`     | Astro + TypeScript type checking   |
| `npm run fmt`       | Format with Prettier               |
| `npm run fmt:check` | Check formatting without modifying |

## Tech Stack

| Layer               | Technology                         |
| ------------------- | ---------------------------------- |
| Framework           | Astro 5 (SSR, Node.js adapter)     |
| Styling             | Tailwind CSS 4                     |
| Content             | MDX                                |
| Syntax Highlighting | Shiki (custom CSS variables theme) |
| Animation           | p5.js                              |
| Deployment          | Docker → Google Cloud Run          |

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

## Routes

| Route          | Page                            | Description                  |
| -------------- | ------------------------------- | ---------------------------- |
| `/`            | `src/pages/index.astro`         | Home with hero and blog list |
| `/blog`        | `src/pages/blog/index.astro`    | Blog index                   |
| `/blog/[slug]` | `src/pages/blog/[slug].astro`   | Individual posts (SSR)       |
| `/about`       | `src/pages/about.astro`         | About page                   |
| `/uses`        | `src/pages/uses.astro`          | Uses page                    |
| `/rss.xml`     | `src/pages/rss.xml.ts`          | RSS feed                     |
| `/sitemap.xml` | `src/pages/sitemap.xml.ts`      | XML sitemap                  |
| `/og/*.png`    | `src/pages/og/[...slug].png.ts` | Dynamic OG images            |
| `/robots.txt`  | `public/robots.txt`             | Crawler directives           |
| `/llms.txt`    | `public/llms.txt`               | AI context file              |

## Deployment

Every push triggers deployment via GitHub Actions:

- **main** → Production (100% traffic)
- **other branches** → Preview (tagged, no traffic)

### Required Secrets

| Secret           | Description              |
| ---------------- | ------------------------ |
| `GCP_PROJECT_ID` | Google Cloud project ID  |
| `GCP_SA_KEY`     | Service account JSON key |

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

### MCP Servers

The project includes MCP server configuration in `.mcp.json`. Some servers require authentication:

**gcloud** — Google Cloud operations

```bash
gcloud auth login
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

**github** — GitHub API access ([create PAT](https://github.com/settings/personal-access-tokens/new) with `repo` scope)

This project uses [direnv](https://direnv.net/) to manage environment variables. Setup:

1. Install direnv:

   ```bash
   # macOS
   brew install direnv

   # Debian / Ubuntu
   sudo apt install direnv

   # Fedora
   sudo dnf install direnv

   # Arch
   sudo pacman -S direnv
   ```

2. Add the hook to your shell config (once):

   ```bash
   # For bash (~/.bashrc)
   eval "$(direnv hook bash)"

   # For zsh (~/.zshrc)
   eval "$(direnv hook zsh)"
   ```

3. Restart your shell or source your config
4. Create `.envrc` in the project root:
   ```bash
   export GITHUB_PAT="your_token_here"
   ```
5. Allow direnv to load the file:
   ```bash
   direnv allow
   ```

> **Note:** If you prefer a different environment management solution (dotenv, 1Password CLI, etc.), ensure `GITHUB_PAT` is available in your shell when running Claude Code.

For a self-hosted GitHub MCP alternative using Docker, see the [GitHub MCP installation guide](https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-claude.md).

## Links

- [Uptime Robot](https://stats.uptimerobot.com/7YrzjwrjbR)
- [Google Cloud Console](https://console.cloud.google.com/home/dashboard)
