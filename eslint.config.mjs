/**
 * ESLint Flat Config
 *
 * Opinionated code style rules for consistency across the codebase.
 * Covers import organisation, naming conventions, and syntactic preferences.
 */

import eslintPluginAstro from "eslint-plugin-astro";
import checkFile from "eslint-plugin-check-file";
import importPlugin from "eslint-plugin-import";
import tseslint from "typescript-eslint";

// Shared rules for all file types
const sharedRules = {
  // === Import Ordering ===
  // Group imports logically: builtins, external deps, internal, relative paths
  "import/order": [
    "error",
    {
      groups: [
        "builtin",
        "external",
        "internal",
        "parent",
        "sibling",
        "index",
        "object",
      ],
      pathGroups: [
        // CSS imports last
        {
          pattern: "**/*.css",
          group: "object",
          position: "after",
        },
        // Sort relative imports by depth (deepest first)
        {
          pattern: "../../../../../../../**",
          group: "parent",
          position: "before",
        },
        {
          pattern: "../../../../../../**",
          group: "parent",
          position: "before",
        },
        {
          pattern: "../../../../../**",
          group: "parent",
          position: "before",
        },
        {
          pattern: "../../../../**",
          group: "parent",
          position: "before",
        },
        {
          pattern: "../../../**",
          group: "parent",
          position: "before",
        },
        {
          pattern: "../../**",
          group: "parent",
          position: "before",
        },
        {
          pattern: "../**",
          group: "parent",
          position: "before",
        },
      ],
      pathGroupsExcludedImportTypes: ["builtin"],
      "newlines-between": "always",
      alphabetize: {
        order: "asc",
        caseInsensitive: true,
      },
      warnOnUnassignedImports: true,
    },
  ],

  // === Arrow Functions ===
  // Prefer arrow functions for callbacks
  "prefer-arrow-callback": ["error", {allowNamedFunctions: false}],
  // Use concise arrow body when possible
  "arrow-body-style": ["error", "as-needed"],

  // === Code Style ===
  // Require curly braces for all control statements (prevents subtle bugs)
  curly: ["error", "all"],
  // Ban nested ternaries for readability
  "no-nested-ternary": "error",
  // No spaces inside braces
  "object-curly-spacing": ["error", "never"],
  // Use shorthand syntax where possible
  "object-shorthand": ["error", "always"],
  // Don't initialise to undefined explicitly
  "no-undef-init": "error",
  // 2-space indentation (ignores template literals for Prettier compatibility)
  indent: [
    "error",
    2,
    {
      SwitchCase: 1,
      ignoredNodes: ["TemplateLiteral *", "TaggedTemplateExpression *"],
    },
  ],

  // === Function Declarations ===
  // Ban function declarations - use const arrow functions instead.
  // This ensures consistent function syntax across the codebase.
  "no-restricted-syntax": [
    "error",
    {
      selector: "FunctionDeclaration",
      message:
        "Use const with arrow function instead of function declaration (e.g., const myFunc = () => {})",
    },
    {
      selector: "ExportNamedDeclaration > FunctionDeclaration",
      message:
        "Use export const with arrow function instead of export function (e.g., export const myFunc = () => {})",
    },
    {
      selector: "ExportDefaultDeclaration > FunctionDeclaration",
      message:
        "Use const with arrow function and export default separately, or use a named export instead",
    },
    // Ban inline interface definitions - require separate interface declarations
    // This improves readability and reusability of type definitions
    {
      selector:
        "VariableDeclarator[init.typeAnnotation.typeAnnotation.type='TSTypeLiteral']",
      message:
        "Define interfaces separately instead of using inline type literals. Create a named interface above the variable declaration.",
    },
    {
      selector:
        "FunctionDeclaration > :matches(TSTypeParameterDeclaration, TSTypeAnnotation) TSTypeLiteral",
      message:
        "Define interfaces separately instead of using inline type literals in function signatures.",
    },
    {
      selector:
        "ArrowFunctionExpression > :matches(TSTypeParameterDeclaration, TSTypeAnnotation) TSTypeLiteral",
      message:
        "Define interfaces separately instead of using inline type literals in function signatures.",
    },
  ],
};

const eslintConfig = [
  // Ignore patterns (must come first)
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      ".astro/**",
      "src/pages/**/\\[*\\].astro",
      "src/pages/**/\\[*\\]*.ts",
    ],
  },

  // Astro recommended config (includes parser setup for .astro files)
  ...eslintPluginAstro.configs.recommended,

  // TypeScript files configuration
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: config.files ?? ["**/*.ts", "**/*.mjs"],
  })),
  {
    files: ["**/*.ts", "**/*.mjs"],
    plugins: {
      "check-file": checkFile,
      import: importPlugin,
    },
    rules: {
      ...sharedRules,

      // === Type Imports ===
      // Enforce type imports on separate lines for cleaner diffs and explicit intent
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: true,
          fixStyle: "separate-type-imports",
        },
      ],

      // === TypeScript Style ===
      // Use property syntax for method signatures (more consistent with object types)
      "@typescript-eslint/method-signature-style": ["error", "property"],
      // Prefer interface over type alias for object shapes
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],

      // === TypeScript Strictness ===
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      // === File Naming Conventions ===
      // TypeScript files use kebab-case
      "check-file/filename-naming-convention": [
        "error",
        {
          "**/*.ts": "KEBAB_CASE",
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
    },
  },

  // Astro files configuration
  {
    files: ["**/*.astro"],
    plugins: {
      "check-file": checkFile,
      import: importPlugin,
    },
    rules: {
      ...sharedRules,
      // Disable indent rule for Astro - prettier-plugin-astro handles formatting
      indent: "off",

      // === File Naming Conventions ===
      // Note: Dynamic route files like [slug].astro are not validated
      // as they contain special characters that don't fit standard patterns
      "check-file/filename-naming-convention": [
        "error",
        {
          // Astro components: PascalCase (framework convention)
          "src/components/**/*.astro": "PASCAL_CASE",
          // Astro layouts: PascalCase
          "src/layouts/**/*.astro": "PASCAL_CASE",
          // Astro pages: kebab-case for file-based routing
          // Note: excludes dynamic routes ([slug], [...slug]) which are validated separately
          "src/pages/**/*.astro": "KEBAB_CASE",
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
    },
  },
];

export default eslintConfig;
