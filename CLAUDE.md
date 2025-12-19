# CLAUDE.md

Guidance for Claude Code when working with this repository.

## Commands

```bash
npm run dev       # Development server (localhost:4321)
npm run build     # Production build to ./dist/
npm run preview   # Preview production build locally
npm run lint      # ESLint (add --fix to auto-fix)
npm run check     # Astro + TypeScript checks
npm run fmt       # Format code with Prettier
npm run fmt:check # Check formatting without changes
```

## Skills (Invoke Proactively)

Skills distil the essence of this codebase into agent-parsable context. Leverage them—they exist to make you effective. Check skill guidance first before applying general knowledge; the codebase has specific conventions that may differ from common patterns.

**coding-standards** — Invoke before implementing features, reviewing code, or refactoring. Contains type discipline, naming conventions, Astro patterns, and review checklists. This is the primary reference for how code should be written.

**managing-seo** — Invoke before adding pages or content, modifying meta tags, structured data, or feeds. Contains SEO component usage, JSON-LD schemas, RSS configuration, and OG image generation.

**maintaining-design-system** — Invoke before designing or refining components, or modifying colours, typography, spacing, or themes. Contains token architecture, component design principles, theme synchronisation, and Shiki configuration.

**managing-deployment** — Invoke when troubleshooting deployments or modifying CI/CD. Contains workflow structure, Docker build, Cloud Run configuration, and build diagnostics.

Skip skill invocation only for trivial tasks (typo fixes, removing whitespace).

## Tech Stack

Astro 5 (SSR mode, Node.js adapter), TypeScript, Tailwind CSS v4, MDX for blog content, Shiki for syntax highlighting, p5.js for canvas animations.

Deployment: Docker → Google Cloud Run via GitHub Actions.
