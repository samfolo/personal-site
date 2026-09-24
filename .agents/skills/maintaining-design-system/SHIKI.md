# Syntax Highlighting

How code blocks are coloured, and the contracts to respect when changing them.

## Overview

Code blocks use Shiki (Astro's built-in highlighter) with a custom TextMate theme that outputs CSS variables instead of hardcoded colours. Colour is resolved by CSS at runtime, so syntax highlighting follows the site's themes with no rebuild and no per-theme Shiki output.

## References

- [Astro syntax highlighting](https://docs.astro.build/en/guides/syntax-highlighting/)
- [Shiki theme colours (TextMate grammar)](https://shiki.style/guide/theme-colors)

The `astro-docs` MCP server answers Astro questions directly. Playwright MCP is available for visual verification but is context-hungry—use it for targeted checks, not exploratory browsing.

## Key Files

| File | Owns |
|------|------|
| `src/lib/shiki/theme.ts` | The TextMate theme: which grammar scopes map to which CSS variables |
| `src/styles/components/shiki.css` | Every colour decision: foundation tokens, theme and per-language overrides, code-block layout, transformer styling |
| `src/plugins/rehype-code-blocks.ts` | The code-block wrapper (language label, copy button) |
| `src/scripts/code-copy.ts` | Client-side label population and copy behaviour |
| `astro.config.mjs` | Shiki configuration and transformer registration |

Read these for current mappings, overrides, and markup—they are the documentation.

## Processing Pipeline

```
MDX content
    ↓
rehype-code-blocks (wraps pre > code with UI elements)
    ↓
Shiki (applies the TextMate theme, emits --astro-code-* variables)
    ↓
shiki.css (resolves variables through the cascade)
    ↓
Browser (renders in the active theme's colours)
```

The rehype plugin runs before Shiki and detects code blocks by structure (`pre > code`), not class names.

## Variable Architecture

Three namespaces connect the TextMate theme to final colours:

```
--syn-*         → Foundation: semantic colour names; each theme sets real values here
--shiki-*       → Integration: maps syntax concepts onto foundation tokens
--astro-code-*  → Output: what the TextMate theme references, set on pre.astro-code
```

The separation is the point:

- Changing one `--syn-*` value updates every syntax concept mapped to it.
- A theme can point two `--shiki-*` concepts at the same `--syn-*` colour without duplicating values.
- Per-language fixes redirect at the `--shiki-*` level without touching foundation tokens.

## Token Cascade

```
:root (global defaults)
    ↓
.theme-* (per-theme foundation values)
    ↓
.theme-* pre.astro-code[data-language="*"] (per-language-per-theme)
```

- **Global defaults** define every `--syn-*` token and its `--shiki-*` mapping—the fallback when no theme class is present.
- **Per-theme** blocks redefine `--syn-*` to complement the theme's `--bg`, `--fg`, and accents. OKLCH throughout, for perceptual uniformity and predictable lightness when reasoning about contrast.
- **Per-language-per-theme** blocks exist only where a grammar tokenises differently from what the theme's defaults expect.

### Override Rules

- Override at the `--shiki-*` level, pointing at an existing `--syn-*` token. Never introduce a new colour in an override.
- Add a per-language override only when testing reveals a problem—most languages need none.
- Comment why the override exists.

## Transformers

Shiki transformers (registered in `astro.config.mjs`) let authors annotate code blocks inline. Annotations are stripped from rendered output.

| Annotation | Effect |
|------------|--------|
| `// [!code highlight]` | Accent the line |
| `// [!code ++]` / `// [!code --]` | Mark the line as added / removed |
| `// [!code focus]` | Focus the line; unfocused lines dim until hover |
| `// [!code word:term]` | Highlight every occurrence of `term` |

Use the comment syntax of the block's language (`#` for Python, and so on). Transformer styling lives in `shiki.css` and must read from theme tokens like everything else.

## Adding a Theme (Shiki Portion)

When a site theme is added (see the main skill), extend `shiki.css`:

1. Define the full set of `--syn-*` foundation tokens under `.theme-[name]`, mirroring an existing theme's block.
2. Map the `--shiki-*` concepts and code-block UI variables the same way the existing themes do—usually a passthrough.
3. Test across languages and transformers; add per-language overrides only where needed.

## Adding Language Support

Shiki supports 200+ languages. To adopt a new one:

1. Write a code block with the language identifier.
2. Check token colours across all four themes.
3. If a token renders wrongly, inspect which `--astro-code-token-*` variable it carries.
4. Add a per-language-per-theme override if needed.

## Debugging

1. In DevTools, select a token and find the `--astro-code-token-*` variable in its `color`.
2. Trace it through the cascade: `--astro-code-*` → `--shiki-*` → `--syn-*`.

- **Token not changing colour:** its TextMate scope may be unmapped in `theme.ts`. Check which scope Shiki assigns.
- **Wrong colour in one theme:** adjust that theme's `--syn-*` value, or add a per-language override.
- **Wrong colour in one language:** redirect the `--shiki-*` token with a per-language-per-theme override.
- **Annotation visible in output:** the comment syntax doesn't match the language.

## Checklists

### Modifying Token Colours

- [ ] Identify the cascade level (global, theme, or language-specific)
- [ ] Update the `--syn-*` value in `shiki.css`
- [ ] Test across all four themes
- [ ] Test blocks that use transformers (diff, highlight, focus)

### Adding a Per-Language Override

- [ ] Identify the problematic token and its `--shiki-*` variable
- [ ] Override under `.theme-* pre.astro-code[data-language="*"]`
- [ ] Point at an existing `--syn-*` token
- [ ] Repeat for each affected theme
- [ ] Comment why the override is needed
