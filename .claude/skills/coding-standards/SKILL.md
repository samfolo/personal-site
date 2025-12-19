---
name: coding-standards
description: Code standards for the personal-site project. Consult when implementing features, reviewing code, refactoring, or answering questions about project conventions. Extends CLAUDE.md with type discipline, naming conventions, Astro patterns, and review checklists.
---

# Code Standards

Standards for personal-site development. Concise, precise, effective. Maximum signal, minimum noise.

British English throughout—code, comments, documentation, content.

## When to Use

Apply these standards when implementing new code, reviewing commits, refactoring existing code, or answering questions about project conventions. The Review Checklist at the end provides a quick reference for common issues.

## Meta-Rules

Preferences yield to functional reasons—if there's genuine technical need for an alternative approach, don't block it. Deviations should be explicit and justified.

This is a personal project. Make clean breaking changes freely; no deprecation warnings, no backwards compatibility concerns. Ship working software over polished infrastructure.

ESLint handles mechanical enforcement. These standards cover judgment calls—decisions requiring understanding of intent, not just syntax.

Earn your complexity. Every abstraction, type, comment, file, and function should justify its existence. Question whether each addition clarifies intent or reduces duplication significantly; if not, inline it or delete it.

**Leave code better than you found it.** When working on a file, proactively bring nearby code up to standard. Don't just implement the requested change; strengthen the surrounding code. This incremental improvement keeps the codebase healthy.

Run `npm run lint -- --fix` and `npm run check` liberally.

## Architectural Philosophy

Minimal friction is the north star—in both directions. For consumption, the site should be responsive, accessible, fast to load, and easy to share. For creation, publishing a new post should be as simple as committing an MDX file and pushing—CI handles the rest. Every code decision should reduce friction, not add it.

Content is the product. Design system, animations, and infrastructure exist to serve it, not the other way around. Prioritise the core reading experience over creative enhancements—the blog should be solid before adding flourishes.

Discipline pays dividends. Upfront investment in quality means less maintenance burden and emergent properties you couldn't plan for. Treat this like a real design system—tokens, semantic naming, component boundaries, CSS layers, precedence rules. The scale doesn't demand this rigour; the practice itself is valuable.

Think in systems, not isolated solutions. Before implementing, ask: does this exist elsewhere? Where does it belong? Centralise anything used across concerns. Everything gets its proper place, not lumped together for convenience.

Embrace the framework. Astro has idioms—use them. Query the MCP server when uncertain, work with the prose plugin and MDX conventions rather than against them. Fighting the framework creates friction; working with it creates leverage.

Earn your complexity. Keep components self-contained and modular. Long files are fine if they're comprehensible—related logic should stay together. Indirection that doesn't clarify shouldn't exist. If extensive comments are needed to explain what code does, the code is too clever.

Orientation matters. Someone reading the code should never be lost. Comments explain why, not just what. Design decisions are surfaced, not buried. If you return after weeks away, you should understand immediately what's happening and why.

Creative expression has value. Not everything needs functional justification. Boids, sheen effects, multi-theme support exist because they're interesting. Don't optimise them away in pursuit of minimalism.

## Type Discipline

Use `interface` for object shapes and `type` for unions, aliases, and function signatures:

```typescript
/**
  * Metadata for a blog post.
  */
interface PostMeta {
  /**
   * Title of the blog post.
   */
  title: string;
  
  /**
   * Date the blog post was published.
   */
  publishDate: Date;
}

/**
 * Theme options for the site.
 */
type Theme = 'steel' | 'purple' | 'charcoal' | 'teal';

/**
 * Function that formats a date for display.
 */
type FormatFn = (date: Date) => string;
```

Format unions with `|` prefix when multi-line, discriminator field first:

```typescript
/**
 * Represents the state of a data fetch operation.
 */
type UnionType<Data, Err = Error> =
  | IdleVariant          // {status: 'idle'}
  | LoadingVariant       // {status: 'loading'}
  | SuccessVariant<Data> // {status: 'success'; data: Data}
  | ErrorVariant<Err>;   // {status: 'error'; error: Err}
```

Generic type parameters use descriptive names: `Data`, `Err`, `Output`—never single letters. Use `Err` rather than `Error` to avoid shadowing the built-in.

### Forbidden Practices

Never use these for convenience:

- `as` casting without exhausting alternatives
- `any` to bypass type checking
- non-null assertion (`!`) without guards
- `null as never` to silence the compiler

Use instead: `satisfies` for type checking without widening, `instanceof`/`typeof`/`in` for narrowing.

### Type Structure

**Flat interfaces**: Extract nested object shapes into their own named interfaces. Nested definitions can't be reused, documented, or referenced independently.

```typescript
/**
  * Open Graph type for SEO.
  */
interface SEOConfig {
  /**
   * Open Graph image URL.
   */
  ogImage?: string;

  /**
   * Open Graph type.
   */
  ogType?: OGType;

  /**
   * Article publish date.
   */
  publishDate?: Date;
}

/**
 * Props for the Page component.
 */
interface Props {
  /**
   * Page title.
   */
  title: string;

  /**
   * SEO configuration.
   */
  seo?: SEOConfig;
}
```

**Named over inline**: Extract inline type literals to named interfaces. If a function signature contains `{...}`, that shape deserves a name.

## Naming

Functions start with verbs indicating their behaviour:

| Verb | Meaning |
|------|---------|
| `format` | Transform for display |
| `parse` | Convert string to typed |
| `get` | Retrieve/accessor |
| `create` | Instantiate new objects |
| `build` | Construct complex objects |
| `extract` | Pull data from structure |
| `validate` | Check correctness |

Verb always comes first: `formatDate`, never `dateFormat`.

Booleans read as questions using `is` for identity/equality and `has` for presence: `isActive`, `hasChildren`, `shouldRender`. Never use `check` or `verify` prefixes.

File-level constants use `SCREAMING_SNAKE_CASE`. No Hungarian notation—`Theme` not `TTheme`, `NavLink` not `INavLink`.

Allowed abbreviations: `fn`, `config`, `ctx`, `props`, `ref`. Avoid all others.

Plural for arrays, singular for items: `const posts: Post[]` and `for (const post of posts)`.

### Parameter Count

1-2 parameters stay bare; 3+ parameters warrant an options object. Options objects are always the final parameter.

## Code Style

Arrow functions for standalone functions—no traditional `function` declarations. ES6 imports only—no `require()`. Async/await only—no `.then()` chains.

No spaces in curly braces: `{useState}`, `{key: 'value'}`.

No single-line blocks—always use braces on separate lines:

```typescript
if (condition) {
  doSomething();
}
```

Array access uses `.at(0)` and `.at(-1)`, not bracket notation.

Comments describe the current state of the code, never its history or future plans:

```typescript
// Good: Groups posts by month for display
// Bad: Refactored from flat list after design review
// Bad: TODO: add tag filtering later
```

### Magic Values

No magic numbers or strings—extract as named constants:

```typescript
/**
  * Average reading speed in words per minute.
  */
const READING_SPEED_WPM = 200;

/**
 * Default theme for the site.
 */
const DEFAULT_THEME = 'steel';

const readingTime = Math.ceil(wordCount / READING_SPEED_WPM);
```

Exception: `0` is acceptable for array indices, counters, and mathematical identity.

### Minimise Mutable Bindings

Use `const` by default. If you reach for `let`, ask whether restructuring would eliminate the need:

- Use `map`/`filter`/`reduce` instead of push loops
- Compute values in expressions rather than accumulating through statements

Each `let` is a variable whose value you must trace; each `const` is a value you can reason about locally.

### Destructuring Defaults

Destructure with defaults rather than applying defaults after extraction:

```typescript
const {size = 'md', theme = 'steel'} = props;
```

## JSDoc

Use multi-line format even for short descriptions:

```typescript
/**
 * Brief, precise description.
 */
```

Never compress to single-line `/** description */` format.

Each constant and interface field gets its own JSDoc for IntelliSense context:

```typescript
/**
 * Configuration for theme switching behaviour.
 */
interface ThemeSwitcherProps {
  /**
   * Button size variant.
   */
  size?: ThemeSwitcherSize;
}
```

Module-level JSDoc at the top of every file provides orientation.

Keep documentation concise and precise. Never reference specific values that might change—values drift, documentation doesn't update.

## File Organisation

Components live in semantic directories within `src/components/`:

```
components/
├── blog/           # Blog-specific components
├── chrome/         # Persistent page frame (header, footer)
├── hero/           # Home page hero section
├── navigation/     # Site navigation
├── seo/            # SEO and structured data
├── theme/          # Theme switching
└── typography/     # Text primitives
```

Each directory has an `index.ts` barrel export containing exports only, never implementation:

```typescript
export {default as BlogList} from './BlogList.astro';
export {default as BlogListItem} from './BlogListItem.astro';
```

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase.astro | `BlogList.astro` |
| Utilities | kebab-case.ts | `format-date.ts` |
| Config | kebab-case.ts | `navigation.ts` |
| Types | types.ts | `types.ts` |
| Scripts | kebab-case.ts | `scroll-header.ts` |

### Imports

Separate `import type` onto its own line:

```typescript
import type {Theme} from '../config/themes';
import {THEME_ORDER, THEME_LABELS} from '../config/themes';
```

Import order: third-party → Astro → parent (`../`) → sibling (`./`) → styles. Run `npm run lint -- --fix` to auto-organise.

## Astro Patterns

### Documentation Reference

The official Astro documentation MCP server (`astro-docs`) is configured in this project. When in doubt about framework syntax, conventions, or best practices, query it directly rather than guessing.

### Component Format

Prefer `.astro` files for components. Astro's template syntax is sufficient for most scenarios. Use React islands only when component state or interactivity genuinely requires it.

### Script Loading

Use `is:inline` for critical-path code that must run before paint:

- Theme application (prevents flash of wrong theme)
- Favicon setting
- Passing server variables to client via `define:vars`

Use module scripts (no `is:inline`) for everything else:

- Event listeners
- Intersection observers
- Non-critical enhancements

```astro
<!-- Critical: runs immediately, blocks rendering -->
<script is:inline define:vars={{THEME_CLASSES}}>
  // Theme application
</script>

<!-- Non-critical: bundled, deferred -->
<script>
  import "../scripts/scroll-header.ts";
</script>
```

### Global Styles

`:global()` is acceptable when a parent component must style child component output. Keep it scoped to the specific need:

```css
.parent :global(.child-class) {
  /* Styles child component's rendered output */
}
```

Avoid `:global()` for general styling—use design tokens instead.

### Content Collections

Content collections are the source of truth for blog content. Schema defined in `src/content.config.ts`.

Query with `getCollection()`, filter drafts by environment:

```typescript
const posts = await getCollection("blog", ({data}) =>
  import.meta.env.PROD ? !data.draft : true
);
```

### Slots

Use named slots for layout flexibility:

```astro
<!-- Layout -->
<slot name="before" />
<slot />

<!-- Usage -->
<Layout>
  <BlogList slot="before" />
  <main content here>
</Layout>
```

## Code Review

See [CODE_REVIEW.md](./CODE_REVIEW.md) for the review process, output format, and checklist of common issues to flag.
