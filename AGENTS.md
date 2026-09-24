# AGENTS.md

Guidance for coding agents working with this repository.

## Commands

```bash
npm run dev       # Development server (localhost:4321)
npm run build     # Production build to ./dist/
npm run preview   # Preview production build locally
npm run lint      # ESLint (npm run lint -- --fix to auto-fix)
npm run check     # Astro + TypeScript checks
npm run fmt       # Format code with Prettier
npm run fmt:check # Check formatting without changes
```

## Skills (Invoke Proactively)

Skills distil the essence of this codebase into agent-parsable context. Leverage them—they exist to make you effective. Check skill guidance first before applying general knowledge; the codebase has specific conventions that may differ from common patterns.

**coding-standards** — Invoke before implementing features, reviewing code, or refactoring. Contains type discipline, naming conventions, Astro patterns, and review checklists. This is the primary reference for how code should be written.

**managing-seo** — Invoke before adding pages or content, modifying meta tags, structured data, or feeds. Contains SEO component usage, JSON-LD schemas, RSS configuration, and OG image generation.

**maintaining-design-system** — Invoke before designing or refining components, or modifying colours, typography, spacing, or themes. Contains token architecture, component design principles, theme synchronisation, and Shiki configuration.

**drawing-diagrams** — Invoke before drawing a new blog figure, changing a scene, or extending the diagram SDK. Contains the diagram's responsibility to the reader, the design contract the SDK enforces, the verification workflow, and extension principles.

**managing-deployment** — Invoke when troubleshooting deployments or modifying CI/CD. Contains workflow structure, Docker build, Cloud Run configuration, and build diagnostics.

Skip skill invocation only for trivial tasks (typo fixes, removing whitespace).

## Tech Stack

Astro 5 (SSR mode, Node.js adapter), TypeScript, Tailwind CSS v4, MDX for blog content, Shiki for syntax highlighting.

- **Blog figures:** an in-house SVG diagram SDK (`src/lib/diagrams`), rendered at build time.
- **OG images and banners:** satori and resvg, rendered on request (`src/lib/og`).
- **Home-page animation:** p5.js drives the canvas.

Deployment: Docker → Google Cloud Run via GitHub Actions.

## Agent Context

This file is the single source of project guidance for every agent. `CLAUDE.md` only imports it.

- **Skills** live in `.agents/skills/`. `.claude/skills` is a symlink to it, so edit the skills under `.agents/`.
- **Skills are evergreen.** They hold durable judgement and contracts, and point at the code as documentation. Never record what happened in a session, name internal helpers, or document removed systems.
- **MCP servers** are declared twice, because each tool has its own format: `.mcp.json` (Claude Code) and `.codex/config.toml` (Codex). Change them together.
