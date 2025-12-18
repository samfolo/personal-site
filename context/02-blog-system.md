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

- Uses `Prose` layout with `BlogList` in `before` slot
- Fetches all non-draft posts
- Sorts by publish date (newest first)
- Groups posts by month

### Individual Posts (`/blog/[slug]`)

- Dynamic SSR route (not static generation)
- Uses `Post` layout (extends `Prose`)
- Fetches post by slug from URL parameter
- Calculates reading time from content
- Determines prev/next posts for navigation

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
  - heading-anchors.ts (click to copy URL, hash navigation)
  - sheen/headings.ts (heading hover animations)
  - sheen/links.ts (link hover animations)
```

## Rehype Plugins

### `rehype-heading-anchors.ts`

- Processes h2-h6 elements
- Generates URL-safe slugs using `github-slugger`
- Adds `id` attribute to headings
- Prepends anchor link with `§` symbol
- Adds `data-heading-anchor` attribute for client-side enhancement

### `rehype-code-blocks.ts`

- Wraps `<pre>` elements containing code
- Creates `.code-block` wrapper div
- Adds floating `.code-lang` label (populated client-side from `data-language`)
- Adds floating `.code-copy` button
- Runs BEFORE Shiki, so detects by structure not class

## Syntax Highlighting

### Custom Shiki Theme (`src/lib/shiki/theme.ts`)

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

### Reading Time (`src/utils/reading-time.ts`)

- Strips MDX components and code blocks
- Calculates word count
- Uses 200 WPM reading speed
- Returns format: "X min read"

### Date Formatting (`src/utils/format-date.ts`)

Uses British English locale (`en-GB`) with multiple format options:

| Format          | Output             | Example              |
| --------------- | ------------------ | -------------------- |
| `full`          | Day Month Year     | "12 December 2024"   |
| `short`         | Day Month (abbrev) | "12 Dec"             |
| `month-year`    | Month Year         | "December 2024"      |
| `dot-separated` | DD.MM.YYYY         | "12.12.2024"         |

## Blog Components

### BlogList (`src/components/blog/BlogList.astro`)

Groups posts by month with visual hierarchy:

- Month labels using `Overline` typography component
- Post entries using `BlogListItem`
- Empty state message using `Body` component

### BlogListItem (`src/components/blog/BlogListItem.astro`)

Individual post entry:

- Title with `SheenText` hover effect
- Formatted date using `Caption` component with tabular numerals
- Responsive padding animation on hover

### PostMeta (`src/components/blog/PostMeta.astro`)

Displays post metadata:

- Publish date
- Updated date (if different from publish)
- Reading time

### PostTags (`src/components/blog/PostTags.astro`)

Renders post tags as inline list.

### PostNav (`src/components/blog/PostNav.astro`)

Bottom navigation between posts:

- Previous post link (older)
- Next post link (newer)
- Gracefully handles first/last posts (no link)

## Typography Components

Blog components use shared typography components from `src/components/typography/`:

| Component   | Usage                           | Default Colour |
| ----------- | ------------------------------- | -------------- |
| `Overline`  | Section labels, month headers   | muted          |
| `Caption`   | Dates, reading time, metadata   | muted          |
| `Body`      | Taglines, empty states          | muted          |
| `SheenText` | Interactive text with animation | fg             |

All typography components support:
- Custom `tag` prop for semantic HTML
- `color` prop (`fg` or `muted`)
- Spread attributes for flexibility

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
