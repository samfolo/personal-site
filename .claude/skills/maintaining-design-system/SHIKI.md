# Syntax Highlighting

Shiki configuration, token architecture, and code block styling for the personal site.

## Overview

Code blocks use Shiki (Astro's built-in highlighter) with a custom TextMate theme that outputs CSS variables instead of hardcoded colours. This allows syntax highlighting to adapt to the site's four colour themes at runtime.

## References

External documentation for deeper context:

- [Astro Shiki integration](https://docs.astro.build/en/guides/syntax-highlighting/)
- [Shiki theme colours (TextMate grammar)](https://shiki.style/guide/theme-colors)

The Astro documentation MCP server may provide access to Astro docs directly. Playwright MCP is available for visual verification but is context-hungry—use intentionally for targeted checks rather than exploratory browsing.

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/shiki/theme.ts` | Custom TextMate theme mapping scopes to CSS variables |
| `src/styles/components/shiki.css` | Token definitions, theme overrides, component layout |
| `src/plugins/rehype-code-blocks.ts` | Wraps code blocks with language label and copy button |
| `src/scripts/code-copy.ts` | Client-side copy functionality and language label population |
| `astro.config.mjs` | Shiki configuration and transformer registration |

## Processing Pipeline

```
MDX content
    ↓
rehype-code-blocks.ts (wraps pre > code with UI elements)
    ↓
Shiki (applies TextMate theme, outputs --astro-code-* variables)
    ↓
shiki.css (resolves variables through cascade)
    ↓
Browser (renders with theme-appropriate colours)
```

The rehype plugin runs before Shiki, detecting code blocks by structure (`pre > code`) rather than class names.

## The TextMate Theme

`src/lib/shiki/theme.ts` exports a TextMate-compatible theme that maps grammar scopes to CSS variables.

```typescript
{
  scope: ["keyword", "keyword.control", "storage.type"],
  settings: {
    foreground: "var(--astro-code-token-keyword)",
  },
}
```

Shiki parses source code into tokens, matches each token against scope patterns, and applies the corresponding CSS variable. The actual colour values are resolved later by CSS.

### Scope Categories

The theme defines mappings for:

- Comments: `comment`, `punctuation.definition.comment`
- Strings: `string`, `string.quoted`, `string.template`, `string.regexp`
- Keywords: `keyword`, `keyword.control`, `storage.type`
- Functions: `entity.name.function`, `support.function`
- Types: `entity.name.type`, `entity.name.class`, `support.type`
- Variables: `variable`, `variable.other`, `variable.parameter`
- Constants: `constant`, `constant.numeric`, `constant.language`
- Operators: `keyword.operator`, `punctuation.separator`
- Punctuation: `punctuation`, `meta.brace`
- HTML/XML: `entity.name.tag`, `entity.other.attribute-name`
- CSS: `support.type.property-name`, `entity.other.attribute-name.class`
- Markdown: `markup.heading`, `markup.bold`, `markup.italic`

Check `theme.ts` for the complete scope-to-variable mapping.

## Variable Architecture

Three namespaces connect the TextMate theme to final colours:

```
--syn-*         → Foundation tokens (semantic colour names)
--shiki-*       → Integration layer (maps to foundation)
--astro-code-*  → Astro's output convention (maps to shiki layer)
```

### Why Three Layers?

**`--syn-*`** (foundation): Semantic names like `--syn-keyword`, `--syn-string`. Each theme defines these values. This is where you set actual colours.

**`--shiki-*`** (integration): Maps to foundation tokens. Allows themes to redirect multiple syntax concepts to the same colour without duplicating values.

**`--astro-code-*`** (output): What Shiki's TextMate theme references. Set on `pre.astro-code` to ensure proper cascade for per-language overrides.

This separation means:
- Changing `--syn-keyword` in a theme updates all keyword-like tokens
- A theme can map `--shiki-token-constant` to `--syn-keyword` if it wants constants and keywords the same colour
- Per-language overrides can redirect at the `--shiki-*` level without touching foundation tokens

## Token Cascade

Styles resolve through CSS specificity:

```
:root (global defaults)
    ↓
.theme-* (per-theme overrides)
    ↓
.theme-* pre.astro-code[data-language="*"] (per-language-per-theme)
```

### Global Defaults (`:root`)

Fallback values used when no theme class is present. Define all `--syn-*` tokens and their `--shiki-*` mappings here.

### Per-Theme (`.theme-*`)

Each theme redefines `--syn-*` tokens to match its palette. Colours should be complementary with the theme's `--bg`, `--fg`, and accent colours.

OKLCH colour space is used throughout, providing:
- Perceptual uniformity (equal chroma steps look equally saturated)
- Easier reasoning about lightness for contrast
- Predictable hue rotation for palette generation

### Per-Language-Per-Theme

Some languages tokenise differently or benefit from adjusted colours. Override at this level when a language's tokens clash with the theme or when semantic meaning differs.

```css
.theme-steel pre.astro-code[data-language="css"] {
  --shiki-token-property: var(--syn-param);
}
```

Override at the `--shiki-*` level, pointing to existing `--syn-*` tokens. This maintains consistency with the theme's palette.

Check `shiki.css` for current per-language overrides. Add new ones only when testing reveals a problem—most languages work well with theme defaults.

## Shiki Transformers

Four transformers are configured in `astro.config.mjs`, enabling inline annotations in code blocks:

### Line Highlight

```typescript
const value = "highlighted"; // [!code highlight]
```

Adds `.highlighted` class to the line. Styled with left border accent.

### Diff

```typescript
const old = "removed"; // [!code --]
const new = "added";   // [!code ++]
```

Adds `.diff.remove` or `.diff.add` classes. Styled with background colour and `+`/`-` symbols.

### Focus

```typescript
const focused = "clear";    // [!code focus]
const blurred = "dimmed";
```

Adds `.has-focused` to the `pre` and `.focused` to marked lines. Unfocused lines blur and dim; hover reveals all.

### Word Highlight

```typescript
const term = "highlighted"; // [!code word:highlighted]
```

Wraps matching words in `.highlighted-word` span. Styled with background and bottom border.

Annotations are stripped from rendered output—readers see clean code.

## Code Block UI

`rehype-code-blocks.ts` wraps each code block:

```html
<div class="code-block">
  <span class="code-lang"></span>
  <pre class="astro-code" data-language="typescript">...</pre>
  <button class="code-copy">Copy</button>
</div>
```

### Language Label

The `.code-lang` span is populated client-side by `code-copy.ts`, reading from `data-language` attribute. Positioned top-left.

### Copy Button

Hidden by default, appears on hover/focus. Copies code content to clipboard, shows "Copied" feedback for 2 seconds.

Both elements use `position: absolute` within the `.code-block` wrapper.

## Adding a New Theme (Shiki Portion)

When adding a site theme, extend `shiki.css`:

1. Define foundation tokens under `.theme-[name]`:
   ```css
   .theme-[name] {
     --syn-keyword: oklch(...);
     --syn-function: oklch(...);
     /* ... all --syn-* tokens */
   }
   ```

2. Map to shiki tokens (usually passthrough):
   ```css
   .theme-[name] {
     --shiki-token-keyword: var(--syn-keyword);
     /* ... */
   }
   ```

3. Define UI tokens:
   ```css
   .theme-[name] {
     --code-diff-add-bg: var(--syn-diff-add-bg);
     --code-highlight-bg: var(--syn-highlight-bg);
     /* ... */
   }
   ```

4. Test across languages. Add per-language overrides only where needed.

## Adding Language Support

Shiki supports 200+ languages out of the box. To verify a new language works:

1. Create a code block with the language identifier
2. Check token colours across all four themes
3. If tokens render incorrectly, inspect which `--astro-code-token-*` variable is applied
4. Add per-language-per-theme overrides in `shiki.css` if needed

Most languages work without overrides. CSS, HTML, YAML, and JSON have overrides because their grammars tokenise certain elements differently than the theme's defaults expect.

## Debugging

### Inspecting Tokens

1. Open DevTools, select a token in the code block
2. Check which `--astro-code-token-*` variable is applied (in the element's `color` property)
3. Trace the variable through the cascade: `--astro-code-*` → `--shiki-*` → `--syn-*`

### Common Issues

**Token not changing colour**: The TextMate scope may not be mapped in `theme.ts`. Check which scope Shiki assigns to that syntax.

**Wrong colour in specific theme**: The theme's `--syn-*` value may need adjustment, or a per-language override may be needed.

**Wrong colour in specific language**: Add a per-language-per-theme override redirecting the `--shiki-*` token.

**Transformer annotation visible in output**: Ensure the comment syntax matches the language (e.g., `//` for JS, `#` for Python).

## Checklists

### Modifying Token Colours

- [ ] Identify which cascade level to change (global, theme, or language-specific)
- [ ] Update the appropriate `--syn-*` value in `shiki.css`
- [ ] Test across all four themes
- [ ] Test with code blocks using transformers (diff, highlight, focus)

### Adding Per-Language Overrides

- [ ] Identify the problematic token and its `--shiki-*` variable
- [ ] Add override under `.theme-* pre.astro-code[data-language="*"]`
- [ ] Point to an existing `--syn-*` token, don't introduce new colours
- [ ] Repeat for each affected theme
- [ ] Document why the override was needed (comment in CSS)
