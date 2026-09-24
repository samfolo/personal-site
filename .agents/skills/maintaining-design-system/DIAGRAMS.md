# Diagrams

How blog figures participate in the design system. Authoring guidance lives
in the [drawing-diagrams skill](../drawing-diagrams/SKILL.md); the SDK
source (`src/lib/diagrams/`) is the implementation reference.

British English throughout.

## When to use

Read this when a design-system change (colours, typography, spacing) might
affect figures, or when deciding where a diagram-related value belongs.

## The contract

Diagrams are built-time SVG. All paint routes through the design system:

- **Colour.** The six semantic theme tokens are the only inks, applied in
  CSS classes — figures re-theme with the site instantly, with zero client
  JavaScript and nothing to synchronise. (Contrast with the Satori/OG
  hazard: there is no mirrored palette to keep in step.)
- **Typography.** Figure text uses the type-scale tokens; CSS font sizes
  resolve to SVG user units, so type scales with the figure and no font
  values are duplicated outside the token files. One deliberate exception:
  a 12px diagram-only step between `--text-xs` and `--text-sm`, for dense
  annotations.
- **Geometry.** Shape radii, dash rhythms, arrowhead and badge metrics are
  viewBox-space values and live as documented constants inside the SDK —
  deliberately not CSS custom properties, so the token files stay clean.
  When adding one, state the reasoning for its value and keep it aligned to
  the 8px grid or the module.
- **The module.** Figures are designed at the article content-column width
  (derived from `--container-max` and `--container-px`), on a 12-column
  grid with rows on the 8px grid — the same spatial discipline as the rest
  of the site.
- **Mobile.** A figure is treated like an image: it scales down uniformly
  with the column and readers zoom. There is no separate mobile layout.

## Shell conventions

Figures share the `diagram-figure` / `diagram-caption` / `diagram-desc`
classes in `src/styles/components/diagram.css` (components layer): the
figure margin, the muted caption voice, and the visually-hidden full text
description that every figure must carry for assistive tech and
non-rendering crawlers. Stepper state is CSS-only, consistent with the
site's minimal-JS posture.

## Checklist — design-system changes touching diagrams

- [ ] Colour or typography token changed → view `/dev/diagrams` across all
      themes; nothing else to update (no mirrored values).
- [ ] New diagram-geometry value → SDK tokens module with documented
      reasoning, not `src/styles/tokens/`.
- [ ] Figure styling change → `diagram.css`, semantic tokens only.

See also [COMPONENT_DESIGN.md](./COMPONENT_DESIGN.md) and [SKILL.md](./SKILL.md).
