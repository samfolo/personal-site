/**
 * Rehype Code Blocks Plugin
 *
 * Wraps code blocks (pre > code) with:
 * - .code-block wrapper for positioning
 * - Floating language label (top-left)
 * - Floating copy button (top-right)
 *
 * Note: This runs BEFORE Shiki adds its classes, so we detect code blocks
 * by structure (pre > code) rather than by class name.
 */

import type {Element, ElementContent, Root} from "hast";
import {visit} from "unist-util-visit";

/**
 * Check if a pre element contains a code element as its first child.
 * This is the standard markdown code fence structure.
 */
const isCodeBlock = (node: Element): boolean => {
  if (node.tagName !== "pre") {
    return false;
  }

  const firstChild = node.children[0];
  return firstChild?.type === "element" && firstChild.tagName === "code";
};

const rehypeCodeBlocks = () => (tree: Root) => {
  visit(tree, "element", (node: Element, index, parent) => {
    // Only process pre elements containing code
    if (!isCodeBlock(node)) {
      return;
    }

    if (typeof index !== "number" || !parent) {
      return;
    }

    // Create floating language label (populated by client-side script)
    const langLabel: Element = {
      type: "element",
      tagName: "span",
      properties: {className: ["code-lang"]},
      children: [],
    };

    // Create floating copy button
    const copyButton: Element = {
      type: "element",
      tagName: "button",
      properties: {
        type: "button",
        className: ["code-copy"],
        "aria-label": "Copy code to clipboard",
      },
      children: [{type: "text", value: "Copy"}],
    };

    // Create wrapper
    const wrapper: Element = {
      type: "element",
      tagName: "div",
      properties: {
        className: ["code-block"],
      },
      children: [langLabel, node as ElementContent, copyButton],
    };

    // Replace the pre element with the wrapper
    (parent.children as ElementContent[])[index] = wrapper;
  });
};

export default rehypeCodeBlocks;
