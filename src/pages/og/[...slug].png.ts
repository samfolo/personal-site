/**
 * OG Image API Endpoint
 *
 * Dynamic route for generating OG images.
 * Routes:
 *   /og/default.png - Site default image
 *   /og/blog/[slug].png - Blog post images
 */

import type {APIRoute} from "astro";
import {getEntry} from "astro:content";

import {CACHE_DURATIONS} from "../../config/cache";
import {THEME_ORDER} from "../../config/themes";
import type {Theme} from "../../config/themes";
import {generateOgImage, getThemeFromTitle} from "../../lib/og";
import type {OgTemplateOptions} from "../../lib/og";

export const GET: APIRoute = async ({params, url}) => {
  const slugParts = params.slug?.split("/") ?? [];

  let options: OgTemplateOptions;
  // The X header is a private brand asset, not content — keep it out of search
  // indexes (blog / default OG cards stay indexable as social previews).
  let noindex = false;

  // Route: /og/default.png
  if (slugParts.length === 1 && slugParts[0] === "default") {
    options = {
      title: "Sam Folorunsho",
      theme: "steel",
      isDefault: true,
    };
  }
  // Routes: /og/x-header.png (1500×500, 3:1) and /og/linkedin.png (1584×396,
  // 4:1) — site-level profile-banner brand assets sharing the centred lockup.
  // Default teal; ?theme= and ?size= override. Hidden from search (noindex).
  else if (
    slugParts.length === 1 &&
    (slugParts[0] === "x-header" || slugParts[0] === "linkedin")
  ) {
    const variant = slugParts[0] === "linkedin" ? "linkedin" : "xheader";

    const requested = url.searchParams.get("theme");
    const theme: Theme = (THEME_ORDER as readonly string[]).includes(
      requested ?? ""
    )
      ? (requested as Theme)
      : "teal";

    // Optional ?size= overrides the wordmark font size (px).
    const sizeParam = Number(url.searchParams.get("size"));
    const wordmarkSize =
      Number.isFinite(sizeParam) && sizeParam > 0
        ? Math.min(256, Math.max(16, Math.round(sizeParam)))
        : undefined;

    options = {
      title: "Sam Folorunsho",
      theme,
      variant,
      wordmarkSize,
    };
    noindex = true;
  }
  // Route: /og/blog/[post-slug].png
  else if (slugParts.length === 2 && slugParts[0] === "blog") {
    const postSlug = slugParts[1];
    const post = await getEntry("blog", postSlug);

    if (!post) {
      return new Response("Not Found", {status: 404});
    }

    // Skip drafts in production
    if (import.meta.env.PROD && post.data.draft) {
      return new Response("Not Found", {status: 404});
    }

    options = {
      title: post.data.title,
      date: post.data.publishDate,
      theme: getThemeFromTitle(post.data.title),
    };
  }
  // Route: /og/banner/[post-slug].png - 5:2 banner for syndicated articles
  else if (slugParts.length === 2 && slugParts[0] === "banner") {
    const post = await getEntry("blog", slugParts[1]);

    if (!post) {
      return new Response("Not Found", {status: 404});
    }

    if (import.meta.env.PROD && post.data.draft) {
      return new Response("Not Found", {status: 404});
    }

    options = {
      title: post.data.title,
      date: post.data.publishDate,
      theme: getThemeFromTitle(post.data.title),
      variant: "banner",
    };
  } else {
    return new Response("Not Found", {status: 404});
  }

  try {
    const png = await generateOgImage(options);

    const headers: Record<string, string> = {
      "Content-Type": "image/png",
      "Cache-Control": `public, max-age=${CACHE_DURATIONS.ONE_YEAR_IN_SECONDS}, immutable`,
    };
    if (noindex) {
      headers["X-Robots-Tag"] = "noindex";
    }

    return new Response(new Uint8Array(png), {status: 200, headers});
  } catch (error) {
    console.error("OG Image generation failed:", error);
    return new Response("Internal Server Error", {status: 500});
  }
};
