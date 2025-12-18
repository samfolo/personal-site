# Code Review

## Process

When reviewing code, first obtain the diff. If a commit hash is provided, use it; otherwise default to uncommitted and unstaged changes. If there are no changes to review, ask for a commit hash or file path.

Hold code to staff-level engineering standards. This means thinking beyond the immediate change—considering how it fits into the broader system, whether it creates maintenance burden, and whether it reflects the quality bar of someone who takes pride in their craft.

Calibrate review depth to change size: small fixes warrant standards compliance checks only; new features warrant full architectural review; refactors focus on pattern consistency and maintainability.

Beyond flagging violations, actively look for opportunities to consolidate duplicate logic, extract shared utilities, and simplify complex code. Ask whether new code could reuse existing patterns or whether similar logic elsewhere should be unified. These improvements strengthen the codebase even when nothing is technically wrong.

When uncertain about Astro conventions, syntax, or best practices, query the `astro-docs` MCP server rather than guessing.

Present findings with file paths and line numbers. Use `×` for violations that must be fixed, `ⓘ` for suggestions to consider, and `✓` for positive observations:

```
× Magic number in timeout
  src/scripts/scroll-header.ts:45
  Current: setTimeout(fn, 300)
  Required: Extract to named constant

ⓘ Consider extracting shared animation config
  src/components/hero/Boids.astro:78-95
  Same easing values appear in multiple places

✓ Good use of centralised theme config
```

## Checklist

When reviewing code, ask these questions: What happens if data is empty? What happens if data is malformed? Can this be extended without modification? Will someone understand this in a week? Does this fight the framework or work with it? Does similar logic already exist elsewhere? Should this be hand-rolled or does a web API or proven library handle it?

Flag these issues:

**Type safety**
- Type safety bypasses without guards—`as`, `any`, non-null assertion (`!`)
- Inline type literals in function signatures (extract to named types)
- Nested interface definitions (flatten to separate interfaces)

**Naming**
- Functions not starting with verbs
- Booleans not using `is`/`has`/`should` prefixes
- Magic numbers or strings (extract to named constants)
- Abbreviations beyond the allowed set (`fn`, `config`, `ctx`, `props`, `ref`)

**Code style**
- Traditional `function` declarations instead of arrow functions
- Single-line blocks without braces
- Bracket notation for array access instead of `.at()`
- Mutable bindings (`let`) that could be restructured as `const`
- Comments describing past or future state instead of current behaviour
- Comments containing arbitrary values that will drift (use constant references)
- Duplicated logic that exists elsewhere in the codebase
- Hand-rolled implementations where web APIs or proven libraries would suffice

**CSS**
- Arbitrary values instead of design tokens or CSS variables
- Style tags where Tailwind classes would be clearer
- Tailwind classes where semantic style tags would be clearer
- Fighting CSS with workarounds instead of using modern features

**Documentation**
- Missing module-level JSDoc
- Single-line JSDoc format instead of multi-line
- Interface fields without JSDoc

**Astro patterns**
- `is:inline` used for non-critical-path scripts
- Scripts modifying DOM without `astro:after-swap` reinitialisation
- Missing event listener cleanup
- Hydration issues from SSR lifecycle misunderstanding
- Framework workarounds due to ignorance of existing affordances
- `:global()` used without justification or scoping
- React patterns forced where Astro templates suffice

**Accessibility**
- Missing ARIA attributes on interactive elements
- Missing semantic HTML where applicable
- Insufficient colour contrast
- Missing focus states

**Language**
- American English spellings (use British throughout)
