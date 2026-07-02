/**
 * Minimal SVG string emission
 *
 * The SDK renders at build time to plain markup strings; this is the small
 * escaping and element-building layer everything else emits through.
 */

/**
 * Attribute values an element accepts. Numbers are emitted as-is; undefined
 * drops the attribute.
 */
export type AttrValue = string | number | undefined;

/**
 * Attribute map for an element.
 */
export type Attrs = Record<string, AttrValue>;

/**
 * Escape text for use in SVG content or attribute values.
 */
export const escapeXml = (text: string): string =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const formatAttrs = (attrs: Attrs): string =>
  Object.entries(attrs)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => ` ${key}="${escapeXml(String(value))}"`)
    .join("");

/**
 * Build an SVG element. Children are pre-rendered markup; text content must
 * be escaped by the caller — or use {@link textEl}, which cannot be got
 * wrong.
 */
export const el = (
  tag: string,
  attrs: Attrs,
  ...children: string[]
): string => {
  const body = children.join("");
  const open = `<${tag}${formatAttrs(attrs)}>`;
  return body === "" ? `${open}</${tag}>` : `${open}${body}</${tag}>`;
};

/**
 * Build a text element with its content escaped internally — the safe
 * default for every text call site.
 */
export const textEl = (attrs: Attrs, text: string): string =>
  el("text", attrs, escapeXml(text));
