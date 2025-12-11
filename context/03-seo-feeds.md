# SEO, RSS Feed, and Sitemap

## Overview

The site implements comprehensive SEO through:
1. Meta tags (description, Open Graph, Twitter Cards)
2. Structured data (JSON-LD)
3. RSS feed for content syndication
4. XML sitemap for search engines
5. Canonical URLs

## SEO Component (`src/components/SEO.astro`)

### Usage
Injected via Base layout, receives props from page:
```astro
<SEO
  title={title}
  description={description}
  ogImage={ogImage}
  ogType={ogType}
  publishDate={publishDate}
  updatedDate={updatedDate}
  tags={tags}
/>
```

### Props Interface
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | required | Page title |
| `description` | string | SITE.description | Meta description |
| `canonicalUrl` | string | Current URL | Canonical link |
| `ogImage` | string | `/og-default.svg` | Open Graph image path |
| `ogType` | `website` \| `article` | `website` | Content type |
| `publishDate` | Date | - | Article publish date |
| `updatedDate` | Date | - | Article modified date |
| `tags` | string[] | `[]` | Article tags |

### Generated Meta Tags
```html
<!-- Description -->
<meta name="description" content="..." />
<link rel="canonical" href="..." />

<!-- Open Graph (Facebook, LinkedIn) -->
<meta property="og:type" content="website|article" />
<meta property="og:url" content="..." />
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="..." />
<meta property="og:site_name" content="Sam Folorunsho" />
<meta property="og:locale" content="en_GB" />

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content="..." />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="..." />

<!-- Article-specific (when ogType="article") -->
<meta property="article:published_time" content="..." />
<meta property="article:modified_time" content="..." />
<meta property="article:tag" content="..." />

<!-- RSS discovery -->
<link rel="alternate" type="application/rss+xml" title="..." href="/rss.xml" />
```

## JSON-LD Structured Data (`src/components/JsonLd.astro`)

### WebSite Schema (default)
Applied to all pages via Base layout:
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Sam Folorunsho",
  "url": "https://samfolorunsho.com",
  "description": "...",
  "author": {
    "@type": "Person",
    "name": "Sam Folorunsho",
    "url": "https://samfolorunsho.com",
    "jobTitle": "Software Engineer",
    "sameAs": ["github", "linkedin"]
  }
}
```

### Article Schema (blog posts)
Additional schema for posts via Post layout:
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Post Title",
  "description": "...",
  "url": "https://samfolorunsho.com/blog/slug",
  "datePublished": "2024-12-08T00:00:00.000Z",
  "dateModified": "2024-12-08T00:00:00.000Z",
  "author": { ... },
  "keywords": "tag1, tag2"
}
```

## OG Image

### Current Implementation
- File: `public/og-default.svg`
- Dimensions: 1200x630px
- Static placeholder with name and job title
- Uses steel theme colours

### Improvement Opportunities
1. Per-post dynamic OG images
2. Higher quality PNG replacement
3. Include post title in image

### Testing OG Images
- [OpenGraph.xyz](https://www.opengraph.xyz/)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

## RSS Feed (`src/pages/rss.xml.ts`)

### Implementation
Uses `@astrojs/rss` package:
```typescript
return rss({
  title: SITE.name,
  description: SITE.description,
  site: site,
  items: sortedPosts.map((post) => ({
    title: post.data.title,
    pubDate: post.data.publishDate,
    description: post.data.description,
    link: `/blog/${post.id}`,
    categories: post.data.tags,
  })),
  customData: `<language>en-gb</language>`,
  stylesheet: '/rss/styles.xsl',
});
```

### Features
- Auto-populates from blog content collection
- Excludes draft posts
- Sorted by publish date (newest first)
- Includes tags as categories
- British English language tag
- Styled XSL for browser viewing

### RSS Stylesheet (`public/rss/styles.xsl`)
- Transforms XML to readable HTML when viewed in browser
- Uses steel theme colours
- Shows subscription instructions with URL

### Maintenance Level: Automatic
- New posts automatically appear in feed
- No manual updates needed
- Only modify for structural changes to RSS format

## Sitemap (`src/pages/sitemap.xml.ts`)

### Implementation
Manually constructed XML with two sources:

**1. Static Pages (manual)**
```typescript
const pages = [
  { url: '', changefreq: 'weekly', priority: '1.0' },
  { url: 'blog', changefreq: 'weekly', priority: '0.9' },
  { url: 'about', changefreq: 'monthly', priority: '0.8' },
  { url: 'uses', changefreq: 'monthly', priority: '0.6' },
];
```

**2. Blog Posts (automatic)**
```typescript
const blogPages = posts.map((post) => ({
  url: `blog/${post.id}`,
  changefreq: 'monthly',
  priority: '0.7',
  lastmod: (post.data.updatedDate ?? post.data.publishDate).toISOString(),
}));
```

### Maintenance Level: Semi-automatic
- Blog posts: Automatic (from content collection)
- Static pages: **Manual** - must add new pages to `pages` array
- Priority values guide search engine crawling

### When to Update Sitemap
- Adding new static pages (about, uses, etc.)
- Changing page importance/priority
- Modifying changefreq for existing pages

## robots.txt (`public/robots.txt`)

```
User-agent: *
Allow: /

Sitemap: https://samfolorunsho.com/sitemap.xml
```

Simple configuration allowing all crawlers and pointing to sitemap.

## Canonical URLs

Generated automatically in SEO component:
```typescript
const canonicalUrl = Astro.props.canonicalUrl
  ?? new URL(Astro.url.pathname, Astro.site ?? SITE.url).href;
```

- Strips query parameters and hash
- Uses pathname only
- Falls back to configured site URL

## SEO Checklist for New Content

### New Blog Post
- [ ] Title is compelling and descriptive
- [ ] Description is under 160 characters
- [ ] Tags are relevant and consistent
- [ ] (Automatic) RSS feed updates
- [ ] (Automatic) Sitemap updates with lastmod
- [ ] (Automatic) Article JSON-LD generated

### New Static Page
- [ ] SEO component receives proper title/description
- [ ] Page added to sitemap.xml.ts with appropriate priority
- [ ] Canonical URL is correct

### Site-Wide Changes
- [ ] OG image reflects brand accurately
- [ ] robots.txt allows appropriate crawling
- [ ] Sitemap is accessible and valid
