# Blog System Architecture

## Content Collections

Blog posts use Astro 5's Content Layer API with a glob loader.

### Schema Definition (`src/content.config.ts`)

```typescript
const blog = defineCollection({
  loader: glob({pattern: "**/*.mdx", base: "./src/content/blog"}),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()),
    draft: z.boolean().default(false),
  }),
});
```

### Frontmatter Template

Every blog post requires this frontmatter:

```yaml
---
title: "Post Title"
description: "Description for SEO and RSS"
publishDate: 2024-12-08
updatedDate: 2024-12-10 # Optional
tags: ["tag1", "tag2"]
draft: false # Hides post in production when true
---
```

### Draft Handling

- Development: All posts shown (including drafts)
- Production: Drafts filtered out at query time
- Pattern used throughout:
  ```typescript
  const posts = await getCollection("blog", ({data}) => {
    return import.meta.env.PROD ? !data.draft : true;
  });
  ```

## Blog Routes

### Blog Index (`/blog`)

- Fetches all non-draft posts
- Sorts by publish date (newest first)
- Groups posts by month using `BlogList` component
- Uses Base layout

### Individual Posts (`/blog/[slug]`)

- Dynamic SSR route (not static generation)
- Fetches post by slug from URL parameter
- Calculates reading time from content
- Determines prev/next posts for navigation
- Uses Post layout with Article JSON-LD

## Post Rendering Pipeline

```
MDX File
    ↓
Content Layer (validates frontmatter)
    ↓
Markdown Processing
    ↓
Rehype Plugins:
  1. rehype-heading-anchors (adds IDs and § links to h2-h6)
  2. rehype-code-blocks (wraps code with label + copy button)
    ↓
Shiki (syntax highlighting with custom theme)
    ↓
Client Scripts:
  - code-copy.ts (populates language labels, copy functionality)
  - heading-anchors.ts (hover effects)
  - sheen-links.ts (link animations)
  - sheen-headings.ts (heading animations)
```

## Rehype Plugins

### `rehype-heading-anchors.ts`

- Processes h2-h6 elements
- Generates URL-safe slugs using `github-slugger`
- Adds `id` attribute to headings
- Prepends anchor link with `§` symbol
- Styling in `prose.css`

### `rehype-code-blocks.ts`

- Wraps `<pre>` elements containing code
- Creates `.code-block` wrapper div
- Adds floating `.code-lang` label (populated client-side)
- Adds floating `.code-copy` button
- Runs BEFORE Shiki, so detects by structure not class

## Syntax Highlighting

### Custom Shiki Theme (`src/lib/shiki-theme.ts`)

- TextMate theme mapping scopes to CSS variables
- Uses `--astro-code-*` variable naming convention
- Supports granular token types for different languages
- Theme variations defined in `src/styles/components/shiki.css`

### Token Variable Cascade

```
:root (global defaults)
    ↓
.theme-* (per-theme overrides)
    ↓
.theme-* [data-language="*"] (per-language-per-theme overrides)
```

### Shiki Transformers (in `astro.config.mjs`)

Code blocks support annotations:

- `[!code highlight]` - Highlight lines
- `[!code ++]` / `[!code --]` - Diff styling
- `[!code focus]` - Focus mode (blur unfocused lines)
- `[!code word:term]` - Highlight specific words

Example:

````markdown
```typescript
const foo = "bar"; // [!code highlight]
const old = "value"; // [!code --]
const new = "value"; // [!code ++]
```
````

## Utilities

### Reading Time (`src/utils/readingTime.ts`)

- Strips MDX components and code blocks
- Calculates word count
- Uses 200 WPM reading speed
- Returns format: "X min read"

### Date Formatting (`src/utils/formatDate.ts`)

- Uses British English locale (`en-GB`)
- Format: "12 December 2024"
- Also provides `formatUpdatedDate()` returning "Updated 12 December 2024"

## BlogList Component

Groups posts by month with visual hierarchy:

- Month labels (uppercase, muted colour)
- Post links with title and date
- SheenText effect on hover
- Responsive padding animation on hover

## Post Navigation

At bottom of each post:

- Previous post link (older)
- Next post link (newer)
- Based on chronological sort order
- Gracefully handles first/last posts (no link)

## Adding a New Blog Post

1. Create file: `src/content/blog/my-post-slug.mdx`
2. Add frontmatter (required fields above)
3. Write content in MDX
4. Test locally: `npm run dev`
5. Post automatically appears in:
   - Home page blog list
   - Blog index page
   - RSS feed
   - Sitemap (with lastmod from updatedDate or publishDate)

## Post Slug Convention

The filename (without `.mdx`) becomes the URL slug:

- `structured-outputs-with-claude.mdx` → `/blog/structured-outputs-with-claude`
- Use lowercase with hyphens
- Keep concise but descriptive
