---
name: managing-seo
description: SEO maintenance for the site. Consult when adding content, modifying pages, updating metadata, or making changes that affect discoverability. Covers meta tags, structured data, OG images, sitemap, RSS, and llms.txt.
---

# Managing SEO

SEO maintenance for the site. Keep metadata accurate, content discoverable, and AI systems informed.

British English throughout—code, comments, documentation, content.

## When to Use

Consult this skill when adding blog posts, creating static pages, modifying titles or descriptions, updating site-wide configuration, or making any change that affects how the site appears to search engines, social platforms, or AI systems.

## Important

Static pages require manual sitemap entry in `src/pages/sitemap.xml.ts`. This is easy to forget when adding new pages.

## Key Principles

Keep meta content in sync with visible content. The description in meta tags must match the description visible on the page. The title in Open Graph tags must match the page heading. Drift between metadata and visible content is a bug.

Titles under 60 characters display fully in search results. Descriptions under 160 characters avoid truncation. These are soft limits—clarity matters more than hitting a number, but brevity helps.

Title format is consistent: `Page Title | Sam Folorunsho`, blog posts included.

Single H1 per page. Logical heading hierarchy (H2, H3, H4) aids both accessibility and SEO. Don't skip levels.

Internal linking helps search engines understand site structure. When referencing other content on the site, link to it.

Advanced SEO concerns—Core Web Vitals, mobile-friendliness, page speed—are handled well by Astro SSR and the deployment infrastructure. Focus maintenance effort on content quality and metadata accuracy.

## Meta Tags

The SEO component (`src/components/seo/SEO/`) renders meta tags from the Base layout; pages pass their SEO props through Base. The props interface and its JSDoc are the reference—read them rather than a copy here. Two contracts matter:

- Blog posts render as `ogType: "article"` with publish date, optional updated date, and tags, which become `article:*` meta.
- Anything omitted falls back to site defaults (`SITE` config, the default OG image).

Generated tags include Open Graph, Twitter Cards, article metadata for blog posts, canonical URL, and RSS discovery.

## Structured Data

JSON-LD structured data (`src/components/seo/JSONLD.astro`) provides machine-readable context. Each page opts in by rendering `<JSONLD slot="head" type="…" />` with the schema that describes it—Base does not add one globally:

| Page | Schema |
|------|--------|
| Home | `WebSite` |
| About | `ProfilePage`, the home of the `Person` entity |
| Blog index | `Blog` |
| Blog post (Post layout) | `BlogPosting` |
| Other static pages | `WebPage` |

The schemas form one graph: they reference the site, the person, and the blog by stable `@id`s (from `SITE` config) rather than repeating them. When adding a page, pick the matching type and let it link into the graph; add a new type to `JSONLD.astro` only when none fits.

## OG Image Generation

Open Graph images and other brand images are generated dynamically at request time.

**Endpoint:** `src/pages/og/[...slug].png.ts`

**Library:** `src/lib/og/` using satori (JSX to SVG) and @resvg/resvg-js (SVG to PNG)

**Routes:**
- `/og/default.png` — Site default card
- `/og/blog/[slug].png` — Blog post card with title and date
- `/og/banner/[slug].png` — Wider banner for syndicated articles and cover headers
- `/og/x-header.png`, `/og/linkedin.png` — Profile banners (brand assets, not content)

**Contracts:**
- Output sizes are named variants in `OG_DIMENSIONS` (`src/lib/og/template.ts`), never free-form width/height. A new platform is a new variant with its own dimensions and safe zone.
- A post's theme colours are chosen deterministically from its title, so the same post always gets the same image.
- Drafts 404 in production, like their pages.
- Content images are cached for a year with `immutable`.
- Brand assets are kept out of search: `X-Robots-Tag: noindex` plus a `robots.txt` disallow. Social cards stay indexable.

**Testing OG images:**

After creating or modifying content, verify OG images render correctly:

1. Local: Visit `/og/blog/[slug].png` directly in browser
2. External validators:
   - [OpenGraph.xyz](https://www.opengraph.xyz/)
   - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

Check that title displays without truncation, colours are correct, and no rendering errors appear.

## RSS Feed

The RSS feed (`src/pages/rss.xml.ts`) auto-generates from the blog content collection.

**Maintenance level:** Automatic. No manual updates needed for new posts.

**Features:**
- Excludes draft posts
- Sorted by publish date (newest first)
- Includes tags as categories
- British English language tag (`en-gb`)
- Styled XSL for browser viewing

Only modify for structural changes to feed format.

## Sitemap

The sitemap (`src/pages/sitemap.xml.ts`) combines automatic and manual sources.

**Blog posts:** Automatic. Pulled from content collection with `lastmod` from publish/update date.

**Static pages:** Manual. Add every new public page to the static list in `sitemap.xml.ts`, including each tab of a tabbed page. This is easy to forget.

**Never listed:** dev-only routes (`/dev/*`, `/export/*`), which 404 in production, and generated assets under `/og/`.

## robots.txt

`public/robots.txt` allows all crawlers, points to the sitemap, and disallows only the brand-asset images that aren't content. Rarely needs modification; when a new non-content asset route appears, disallow it here too.

## llms.txt

The `llms.txt` file (`public/llms.txt`) helps AI systems understand the site. It provides context about site purpose, structure, and content—like robots.txt but for language models.

**When to update:**
- Adding new static pages
- Significant changes to site purpose or structure
- Adding new content categories

Keep it concise. The goal is orientation, not exhaustive documentation. See `public/llms.txt` for current structure.

## Canonical URLs

Generated automatically by the SEO component:

- Strips query parameters and hash
- Uses pathname only
- Falls back to configured site URL

No manual intervention needed unless creating duplicate content (rare).

## Checklists

### New Blog Post

- [ ] Title is compelling and under 60 characters
- [ ] Description is clear and under 160 characters
- [ ] Tags are relevant and consistent with existing tags
- [ ] Frontmatter is complete (title, description, publishDate, tags)
- [ ] (Automatic) RSS feed includes post
- [ ] (Automatic) Sitemap includes post with lastmod
- [ ] (Automatic) BlogPosting JSON-LD generated
- [ ] (Automatic) OG image generated from title
- [ ] Verify OG image renders correctly

### New Static Page

- [ ] SEO component receives proper title and description
- [ ] Title follows format: `Page Title | Sam Folorunsho`
- [ ] Page renders the matching JSON-LD type
- [ ] Page added to sitemap with appropriate priority
- [ ] Page added to llms.txt if significant
- [ ] Canonical URL is correct
- [ ] Heading hierarchy is logical (single H1, sequential H2-H6)

### Site-Wide Changes

- [ ] SITE config updated if name/description/author changes
- [ ] Meta descriptions stay in sync with visible content
- [ ] OG default image reflects brand accurately
- [ ] robots.txt allows appropriate crawling
- [ ] Sitemap is accessible and valid
- [ ] llms.txt reflects current site structure
- [ ] RSS feed validates correctly
