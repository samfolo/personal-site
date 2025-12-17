/**
 * Rehype Heading Anchors Plugin
 *
 * Adds anchor links to H2-H6 headings in MDX content.
 * Shows section symbol (§) on hover for linking to specific sections.
 */

import GithubSlugger from 'github-slugger';
import type {Root, Element} from 'hast';
import {toString} from 'hast-util-to-string';
import {visit} from 'unist-util-visit';

const HEADING_TAGS = new Set(['h2', 'h3', 'h4', 'h5', 'h6']);

export default function rehypeHeadingAnchors() {
  return (tree: Root) => {
    const slugger = new GithubSlugger();

    visit(tree, 'element', (node: Element) => {
      // Only process h2-h6
      if (!HEADING_TAGS.has(node.tagName)) {
        return;
      }

      const text = toString(node);
      const id = slugger.slug(text);

      // Add id to the heading
      node.properties = node.properties || {};
      node.properties.id = id;

      // Create anchor link element
      const anchor: Element = {
        type: 'element',
        tagName: 'a',
        properties: {
          href: `#${id}`,
          className: ['heading-anchor'],
          'aria-label': `Link to section: ${text}`,
          'data-heading-anchor': '',
        },
        children: [{type: 'text', value: '§'}],
      };

      // Prepend anchor to heading children
      node.children.unshift(anchor);
    });
  };
}
