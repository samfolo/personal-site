# Project Memory Notes

This document provides comprehensive context for the personal-site project. It serves as a knowledge base for contributors (human and AI) to understand how the site is built, deployed, and maintained.

## Quick Reference

| Area         | Key Files                                      | Maintenance Level |
| ------------ | ---------------------------------------------- | ----------------- |
| Blog Content | `src/content/blog/*.mdx`                       | Regular           |
| RSS Feed     | `src/pages/rss.xml.ts`                         | Automatic         |
| Sitemap      | `src/pages/sitemap.xml.ts`                     | Semi-automatic    |
| OG Images    | `src/pages/og/[...slug].png.ts`, `src/lib/og/` | Automatic         |
| SEO          | `src/components/SEO.astro`, `JsonLd.astro`     | Automatic         |
| Deployment   | `.github/workflows/deploy.yml`                 | Rare              |
| Theming      | `src/styles/tokens/colours.css`, `shiki.css`   | Rare              |

## Documentation Index

- **[01-architecture.md](./01-architecture.md)** - Project structure, Astro configuration, SSR setup
- **[02-blog-system.md](./02-blog-system.md)** - Content collections, MDX handling, blog architecture
- **[03-seo-feeds.md](./03-seo-feeds.md)** - SEO components, RSS feed, sitemap, OG images
- **[04-deployment.md](./04-deployment.md)** - GitHub Actions, Cloud Run, Docker, secrets
- **[05-design-system.md](./05-design-system.md)** - Design tokens, theming, Tailwind setup, syntax highlighting
- **[06-interactive-features.md](./06-interactive-features.md)** - Boids animation, sheen effects, view transitions

## Critical Maintenance Notes

### When Adding New Blog Posts

1. Create MDX file in `src/content/blog/` with required frontmatter:
   ```yaml
   ---
   title: "Post Title"
   description: "Post description for SEO"
   publishDate: 2024-12-08
   tags: ["tag1", "tag2"]
   draft: false # Set true to hide in production
   ---
   ```
2. RSS feed auto-updates (pulls from content collection)
3. Sitemap auto-updates (pulls from content collection)
4. SEO metadata auto-generates from frontmatter

### When Adding New Static Pages

1. Create `.astro` file in `src/pages/`
2. **Manual update required**: Add page to sitemap in `src/pages/sitemap.xml.ts`:
   ```typescript
   const pages = [
     {url: "", changefreq: "weekly", priority: "1.0"},
     {url: "blog", changefreq: "weekly", priority: "0.9"},
     {url: "about", changefreq: "monthly", priority: "0.8"},
     {url: "uses", changefreq: "monthly", priority: "0.6"},
     {url: "new-page", changefreq: "monthly", priority: "0.7"}, // Add here
   ];
   ```

### When Modifying Themes

1. Update colour tokens in `src/styles/tokens/colours.css`
2. **Must also update**: Syntax highlighting in `src/styles/components/shiki.css`
3. **Must also update**: Boids colours in `src/scripts/boids.ts` (THEME_COLOURS constant)
4. **Consider updating**: RSS stylesheet in `public/rss/styles.xsl` (uses steel theme colours)
5. **Consider updating**: OG image theme colours in `src/lib/og/theme.ts`

### OG Image Generation

OG images are generated dynamically via SSR endpoint:

- **Endpoint**: `/og/default.png` (site) or `/og/blog/[slug].png` (posts)
- **Dimensions**: 1200x630px
- **Theme**: Deterministic from title hash (purple, teal, charcoal, steel)
- **Caching**: 1-year `max-age` with `immutable`

**Key files:**

- `src/pages/og/[...slug].png.ts` - API endpoint
- `src/lib/og/` - Generation utilities (satori + @resvg/resvg-js)

**Testing OG images:**

- Use [OpenGraph.xyz](https://www.opengraph.xyz/) to preview
- Use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- Use [Twitter Card Validator](https://cards-dev.twitter.com/validator)

## Environment and Secrets

### Local Development

```bash
npm run dev       # Start dev server at localhost:4321
npm run build     # Build production site
npm run preview   # Preview production build
```

### Required GitHub Secrets for Deployment

| Secret           | Description                                                |
| ---------------- | ---------------------------------------------------------- |
| `GCP_PROJECT_ID` | Google Cloud project ID                                    |
| `GCP_SA_KEY`     | Service account JSON key with Cloud Run deploy permissions |

### Cloud Run Configuration

- Region: `europe-west2` (London)
- Service name: `personal-site`
- Port: `4321`
- Memory: `256Mi`
- Min instances: `0` (scales to zero)
- Max instances: `2`

## Content Guidelines

### British English

This project uses British English throughout:

- Variable names, filenames, comments
- User-facing text and documentation
- Commit messages

### Code Block Features

Blog posts support Shiki transformers:

- `[!code highlight]` - Highlight specific lines
- `[!code ++]` / `[!code --]` - Show diff
- `[!code focus]` - Focus on specific lines
- `[!code word:term]` - Highlight specific words

## Quick Troubleshooting

| Issue                    | Solution                                                     |
| ------------------------ | ------------------------------------------------------------ |
| Build fails on blog post | Check MDX frontmatter schema matches `src/content.config.ts` |
| Theme not applying       | Check body class matches theme name (e.g., `theme-steel`)    |
| Header not showing       | Check if `data-scroll-trigger` element exists on page        |
| RSS not updating         | RSS pulls from content collection - check post is not draft  |
| Sitemap missing page     | Static pages must be manually added to `sitemap.xml.ts`      |
