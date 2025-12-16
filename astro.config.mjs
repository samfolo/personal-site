// @ts-check
import { defineConfig } from 'astro/config';
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationFocus,
  transformerNotationWordHighlight,
} from '@shikijs/transformers';
import { customCssVariablesTheme } from './src/lib/shiki-theme';

import node from '@astrojs/node';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import rehypeHeadingAnchors from './src/plugins/rehype-heading-anchors';
import rehypeCodeBlocks from './src/plugins/rehype-code-blocks';

// https://astro.build/config
export default defineConfig({
  site: 'https://samfolorunsho.com',
  trailingSlash: 'never',
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),

  integrations: [mdx()],

  markdown: {
    rehypePlugins: [
      rehypeHeadingAnchors,
      rehypeCodeBlocks,
    ],
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
      external: ['@resvg/resvg-js']
    },
    build: {
      rollupOptions: {
        external: ['@resvg/resvg-js']
      }
    },
    optimizeDeps: {
      exclude: ['@resvg/resvg-js']
    }
  }
});