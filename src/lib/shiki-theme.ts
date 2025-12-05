/**
 * Custom Shiki Theme with CSS Variables
 *
 * A TextMate theme that maps granular scopes to CSS variables,
 * providing more control than the built-in css-variables theme.
 *
 * Variable naming: Uses --astro-code-* prefix (Astro convention).
 * These are mapped to --shiki-* in src/styles/components/shiki.css
 */

import type { ThemeRegistration } from 'shiki';

export const customCssVariablesTheme: ThemeRegistration = {
  name: 'custom-css-variables',
  type: 'dark',
  colors: {
    'editor.background': 'var(--astro-code-background)',
    'editor.foreground': 'var(--astro-code-foreground)',
  },
  settings: [
    // Base foreground
    {
      settings: {
        foreground: 'var(--astro-code-foreground)',
      },
    },

    // ==========================================================================
    // Comments
    // ==========================================================================
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: {
        foreground: 'var(--astro-code-token-comment)',
      },
    },

    // ==========================================================================
    // Strings
    // ==========================================================================
    {
      scope: ['string', 'string.quoted', 'string.template', 'markup.inline.raw'],
      settings: {
        foreground: 'var(--astro-code-token-string)',
      },
    },
    {
      scope: ['string.regexp', 'constant.other.character-class.regexp'],
      settings: {
        foreground: 'var(--astro-code-token-regexp)',
      },
    },
    {
      scope: ['constant.character.escape', 'string.escape'],
      settings: {
        foreground: 'var(--astro-code-token-escape)',
      },
    },
    // Template expression interpolation ${...}
    {
      scope: [
        'punctuation.definition.template-expression',
        'punctuation.section.embedded',
      ],
      settings: {
        foreground: 'var(--astro-code-token-string-expression)',
      },
    },

    // ==========================================================================
    // Numbers & Units
    // ==========================================================================
    {
      scope: [
        'constant.numeric',
        'constant.numeric.integer',
        'constant.numeric.float',
        'constant.numeric.hex',
        'constant.numeric.binary',
        'constant.numeric.octal',
        'storage.type.numeric',
        'storage.type.number',
        'storage.type.number.python',
        'storage.type.imaginary',
        'storage.type.imaginary.number',
        'storage.type.imaginary.number.python',
        'keyword.other.unit.imaginary',
      ],
      settings: {
        foreground: 'var(--astro-code-token-number)',
      },
    },
    {
      scope: ['keyword.other.unit', 'constant.other.unit'],
      settings: {
        foreground: 'var(--astro-code-token-unit)',
      },
    },

    // ==========================================================================
    // Constants & Language Literals
    // ==========================================================================
    {
      scope: [
        'constant.language',
        'constant.language.boolean',
        'constant.language.null',
        'constant.language.undefined',
        'support.constant',
        'support.constant.json',
        'variable.other.constant',
      ],
      settings: {
        foreground: 'var(--astro-code-token-constant)',
      },
    },

    // ==========================================================================
    // Keywords & Control Flow
    // ==========================================================================
    {
      scope: [
        'keyword',
        'keyword.control',
        'keyword.operator.new',
        'keyword.operator.expression',
        'keyword.operator.instanceof',
        'keyword.operator.typeof',
        'storage',
        'storage.type',
        'storage.modifier',
      ],
      settings: {
        foreground: 'var(--astro-code-token-keyword)',
      },
    },

    // ==========================================================================
    // Numeric Type Indicators (must come after keywords to override storage.type)
    // ==========================================================================
    {
      scope: [
        'storage.type.number',
        'storage.type.imaginary',
      ],
      settings: {
        foreground: 'var(--astro-code-token-number)',
      },
    },

    // ==========================================================================
    // Operators
    // ==========================================================================
    {
      scope: [
        'keyword.operator',
        'keyword.operator.assignment',
        'keyword.operator.arithmetic',
        'keyword.operator.logical',
        'keyword.operator.comparison',
        'keyword.operator.ternary',
        'punctuation.separator.key-value',
      ],
      settings: {
        foreground: 'var(--astro-code-token-operator)',
      },
    },

    // ==========================================================================
    // Functions
    // ==========================================================================
    {
      scope: [
        'entity.name.function',
        'support.function',
        'meta.function-call',
        'variable.function',
      ],
      settings: {
        foreground: 'var(--astro-code-token-function)',
      },
    },

    // ==========================================================================
    // Parameters & Arguments
    // ==========================================================================
    {
      scope: ['variable.parameter', 'meta.parameter'],
      settings: {
        foreground: 'var(--astro-code-token-parameter)',
      },
    },

    // ==========================================================================
    // Variables
    // ==========================================================================
    {
      scope: [
        'variable',
        'variable.other',
        'variable.other.readwrite',
        'variable.other.object',
        'variable.language.this',
      ],
      settings: {
        foreground: 'var(--astro-code-token-variable)',
      },
    },

    // ==========================================================================
    // Self Keywords (Rust, Python, etc.)
    // ==========================================================================
    {
      scope: [
        'variable.language.self',
        'variable.language.special.self',
        'keyword.other.self',
      ],
      settings: {
        foreground: 'var(--astro-code-token-keyword)',
      },
    },

    // ==========================================================================
    // Types & Classes
    // ==========================================================================
    {
      scope: [
        'entity.name.type',
        'entity.name.class',
        'support.type',
        'support.class',
        'entity.other.inherited-class',
      ],
      settings: {
        foreground: 'var(--astro-code-token-type)',
      },
    },

    // ==========================================================================
    // HTML/XML Tags
    // ==========================================================================
    {
      scope: ['entity.name.tag', 'punctuation.definition.tag'],
      settings: {
        foreground: 'var(--astro-code-token-tag)',
      },
    },
    {
      scope: ['entity.other.attribute-name'],
      settings: {
        foreground: 'var(--astro-code-token-attribute)',
      },
    },

    // ==========================================================================
    // CSS Specific
    // ==========================================================================
    {
      scope: [
        'support.type.property-name',
        'support.type.vendored.property-name',
        'meta.property-name',
      ],
      settings: {
        foreground: 'var(--astro-code-token-property)',
      },
    },
    {
      scope: [
        'support.constant.property-value',
        'support.constant.color',
        'meta.property-value',
      ],
      settings: {
        foreground: 'var(--astro-code-token-property-value)',
      },
    },
    {
      scope: ['entity.other.attribute-name.class.css', 'entity.other.attribute-name.id.css'],
      settings: {
        foreground: 'var(--astro-code-token-selector)',
      },
    },

    // ==========================================================================
    // Punctuation
    // ==========================================================================
    {
      scope: [
        'punctuation',
        'punctuation.definition.block',
        'punctuation.definition.parameters',
        'punctuation.section',
        'punctuation.terminator',
        'punctuation.separator',
        'meta.brace',
      ],
      settings: {
        foreground: 'var(--astro-code-token-punctuation)',
      },
    },

    // ==========================================================================
    // Links
    // ==========================================================================
    {
      scope: ['markup.underline.link', 'string.other.link'],
      settings: {
        foreground: 'var(--astro-code-token-link)',
      },
    },

    // ==========================================================================
    // Markdown Specific
    // ==========================================================================
    {
      scope: ['markup.heading', 'entity.name.section'],
      settings: {
        foreground: 'var(--astro-code-token-keyword)',
        fontStyle: 'bold',
      },
    },
    {
      scope: ['markup.bold'],
      settings: {
        fontStyle: 'bold',
      },
    },
    {
      scope: ['markup.italic'],
      settings: {
        fontStyle: 'italic',
      },
    },
  ],
};
