// @ts-check
import mdx from "@astrojs/mdx";
import node from "@astrojs/node";
import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import tailwindcss from "@tailwindcss/vite";
import {defineConfig} from "astro/config";

import {customCssVariablesTheme} from "./src/lib/shiki";
import rehypeCodeBlocks from "./src/plugins/rehype-code-blocks";
import rehypeHeadingAnchors from "./src/plugins/rehype-heading-anchors";

// https://astro.build/config
export default defineConfig({
  site: "https://samfolorunsho.com",
  trailingSlash: "never",
  output: "server",
  adapter: node({
    mode: "standalone",
  }),

  experimental: {
    fonts: [
      {
        provider: "local",
        name: "Switzer",
        cssVariable: "--font-switzer",
        fallbacks: ["system-ui", "-apple-system", "sans-serif"],
        variants: [
          {
            weight: "100 900",
            style: "normal",
            src: ["./src/assets/fonts/Switzer-Variable.woff2"],
          },
          {
            weight: "100 900",
            style: "italic",
            src: ["./src/assets/fonts/Switzer-VariableItalic.woff2"],
          },
        ],
      },
      {
        provider: "local",
        name: "CommitMono",
        cssVariable: "--font-commit-mono",
        fallbacks: ["JetBrains Mono", "ui-monospace", "monospace"],
        variants: [
          {
            weight: 400,
            style: "normal",
            src: ["./src/assets/fonts/CommitMono-PersonalSite-400-Regular.otf"],
          },
          {
            weight: 700,
            style: "normal",
            src: ["./src/assets/fonts/CommitMono-PersonalSite-700-Regular.otf"],
          },
        ],
      },
    ],
  },

  integrations: [mdx()],

  markdown: {
    rehypePlugins: [rehypeHeadingAnchors, rehypeCodeBlocks],
    shikiConfig: {
      theme: customCssVariablesTheme,
      defaultColor: false,
      wrap: true,
      transformers: [
        transformerNotationDiff(),
        transformerNotationHighlight(),
        transformerNotationFocus(),
        transformerNotationWordHighlight(),
      ],
    },
  },

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ["@resvg/resvg-js"],
    },
    build: {
      rollupOptions: {
        external: ["@resvg/resvg-js"],
      },
    },
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
});
