/**
 * Astro Middleware
 *
 * Sets cache headers for HTML responses to prevent stale content issues.
 * Static assets (/_astro/*) are handled by the Node adapter with content hashes.
 */

import type {MiddlewareHandler} from "astro";

export const onRequest: MiddlewareHandler = async (_context, next) => {
  const response = await next();

  // Set cache headers for HTML responses
  // This ensures browsers always validate with the server
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("text/html")) {
    response.headers.set("Cache-Control", "no-cache");
  }

  return response;
};
