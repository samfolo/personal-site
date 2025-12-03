/**
 * Rehype Code Blocks Plugin
 *
 * Wraps Shiki-rendered code blocks with:
 * - .code-block wrapper for positioning
 * - Header with language label and copy button
 * - Overlay copy button (hidden by default)
 *
 * Respects minimal treatment when code block has {minimal} in meta.
 */

import { visit } from 'unist-util-visit';
import type { Root, Element, ElementContent } from 'hast';

interface CodeBlockMeta {
  minimal?: boolean;
}

function parseMeta(metaString: string | undefined): CodeBlockMeta {
  const meta: CodeBlockMeta = {};

  if (!metaString) return meta;

  if (metaString.includes('minimal')) {
    meta.minimal = true;
  }

  return meta;
}

export default function rehypeCodeBlocks() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      // Only process pre elements with astro-code class
      if (node.tagName !== 'pre') return;

      const classes = node.properties?.className;
      const classArray = Array.isArray(classes) ? classes : [];

      if (!classArray.includes('astro-code')) return;

      if (typeof index !== 'number' || !parent) return;

      // Get language from data-language attribute
      const lang = (node.properties?.dataLanguage as string) || '';

      // Check for meta string (Shiki stores this)
      const metaString = node.properties?.dataMeta as string | undefined;
      const meta = parseMeta(metaString);

      // Create header element
      const header: Element = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['code-header'] },
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['code-lang'] },
            children: lang ? [{ type: 'text', value: lang }] : [],
          },
          {
            type: 'element',
            tagName: 'button',
            properties: {
              type: 'button',
              className: ['code-copy'],
              'aria-label': 'Copy code to clipboard',
            },
            children: [{ type: 'text', value: 'Copy' }],
          },
        ],
      };

      // Create overlay copy button
      const overlayButton: Element = {
        type: 'element',
        tagName: 'button',
        properties: {
          type: 'button',
          className: ['code-copy-overlay'],
          'aria-label': 'Copy code to clipboard',
        },
        children: [{ type: 'text', value: 'Copy' }],
      };

      // Create wrapper
      const wrapper: Element = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['code-block'],
          ...(meta.minimal ? { 'data-code-minimal': '' } : {}),
        },
        children: [header, node as ElementContent, overlayButton],
      };

      // Replace the pre element with the wrapper
      (parent.children as ElementContent[])[index] = wrapper;
    });
  };
}
