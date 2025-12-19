# Component Design

Principles for designing and structuring components in the site.

## Directory Structure

Components live in `src/components/`, grouped by semantic category:

```
components/
├── blog/           # Blog-specific (BlogList, PostMeta)
├── chrome/         # Page frame (FixedHeader, FixedFooter)
├── hero/           # Home page hero section
├── navigation/     # Site navigation
├── seo/            # Meta tags, structured data
├── theme/          # Theme switching
└── typography/     # Text primitives
```

Each directory has an `index.ts` barrel export containing exports only, never implementation.

## Composability

Design components for reuse, not single use cases. Props and slots should be usage-agnostic—they describe what the component needs, not where it's used.

Prefer composition over monolithic components. If a component renders a list, extract the list item:

```
BlogList.astro      → renders list container
BlogListItem.astro  → renders individual item with props
```

Benefits: items become independently testable, reusable, and styleable. The pattern applies throughout—Hero/HeroWordMark, Nav/NavLink.

When designing props:

- Accept the minimal data needed, not pre-formatted output
- Use slots for flexible content injection

## Spacing

Parents control layout; children remain portable.

The parent component provides spacing around its children through padding and gap. Children should not apply margins that assume surrounding context.

```astro
<!-- Parent controls layout and spacing -->
<ul class="flex flex-col" style="gap: var(--space-4);">
  <ListItem />  <!-- No margin on ListItem -->
  <ListItem />
</ul>
```

Check `global.css` `@theme` block for Tailwind spacing utilities—these may allow replacing the inline style with a class.

Use margins as a last resort. When unavoidable, prefer `margin-top` (lobotomised owl pattern) over `margin-bottom` for more predictable stacking.

## Design Token Usage

Components must use design tokens for all visual values. Never use arbitrary values.

Before applying tokens, check the relevant file in `src/styles/tokens/` to verify available values and their names. Token categories include:

- **Colours**: `--bg`, `--fg`, `--muted`, `--rule`, `--highlight`, `--emphasis`
- **Spacing**: margin/padding values in `spacing.css`
- **Sizing**: width/height values in `sizing.css`
- **Typography**: font sizes, line heights, letter spacing in `typography.css`
- **Transitions**: animation timings in `transitions.css`
- **Z-index**: stacking values in `z-index.css`

Tailwind maps tokens via `global.css`. Check the `@theme` block for available utility classes. Use Tailwind classes where possible; fall back to CSS variables in style blocks when Tailwind lacks coverage.

## Component Boundaries

Each component should:

- Accept props for variable content
- Use design tokens, never arbitrary values
- Document props with JSDoc
- Be portable (no assumptions about where it's rendered)

## Accessibility Baseline

Not a comprehensive audit, but maintain these minimums:

- Semantic HTML elements (`nav`, `article`, `button` over `div`)
- ARIA labels on interactive elements without visible text
- Focus states on all interactive elements—consistent across the application, using design tokens (typically `--highlight`), not defined ad-hoc per component
- Sufficient colour contrast (OKLCH makes this easier to reason about)
- Reduced motion support where animation exists

## Checklist: Adding a Component

- [ ] Place in appropriate semantic directory
- [ ] Use design tokens for all visual values
- [ ] Extract repeated elements into sub-components
- [ ] Parent controls spacing; component has no outer margins
- [ ] Add JSDoc for props interface
- [ ] Add to directory's `index.ts` barrel export
- [ ] Verify accessibility baseline (semantic HTML, focus states)
