/**
 * OG Image API Endpoint
 *
 * Dynamic route for generating OG images.
 * Routes:
 *   /og/default.png - Site default image
 *   /og/blog/[slug].png - Blog post images
 */

import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';

import { generateOgImage, getThemeFromTitle } from '../../lib/og';
import type { OgTemplateOptions } from '../../lib/og';

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export const GET: APIRoute = async ({ params }) => {
  const slugParts = params.slug?.split('/') ?? [];

  let options: OgTemplateOptions;

  // Route: /og/default.png
  if (slugParts.length === 1 && slugParts[0] === 'default') {
    options = {
      title: 'Sam Folorunsho',
      theme: 'steel',
    };
  }
  // Route: /og/blog/[post-slug].png
  else if (slugParts.length === 2 && slugParts[0] === 'blog') {
    const postSlug = slugParts[1];
    const post = await getEntry('blog', postSlug);

    if (!post) {
      return new Response('Not Found', { status: 404 });
    }

    // Skip drafts in production
    if (import.meta.env.PROD && post.data.draft) {
      return new Response('Not Found', { status: 404 });
    }

    options = {
      title: post.data.title,
      date: post.data.publishDate,
      theme: getThemeFromTitle(post.data.title),
    };
  } else {
    return new Response('Not Found', { status: 404 });
  }

  try {
    const png = await generateOgImage(options);

    return new Response(png, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': `public, max-age=${ONE_YEAR_IN_SECONDS}, immutable`,
      },
    });
  } catch (error) {
    console.error('OG Image generation failed:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
