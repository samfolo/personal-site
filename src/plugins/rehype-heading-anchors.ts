/**
 * Rehype Heading Anchors Plugin
 *
 * Adds anchor links to H2 and H3 headings in MDX content.
 * Shows section symbol (§) on hover for linking to specific sections.
 */

import { visit } from 'unist-util-visit';
import { toString } from 'hast-util-to-string';
import GithubSlugger from 'github-slugger';
import type { Root, Element } from 'hast';

export default function rehypeHeadingAnchors() {
  return (tree: Root) => {
    const slugger = new GithubSlugger();

    visit(tree, 'element', (node: Element) => {
      // Only process h2 and h3
      if (node.tagName !== 'h2' && node.tagName !== 'h3') {
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
        children: [{ type: 'text', value: '§' }],
      };

      // Prepend anchor to heading children
      node.children.unshift(anchor);
    });
  };
}
