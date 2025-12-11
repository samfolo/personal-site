import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '../config';

export async function GET(context: APIContext) {
  const site = context.site ?? new URL(SITE.url);
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  const pages = [
    { url: '', changefreq: 'weekly', priority: '1.0' },
    { url: 'blog', changefreq: 'weekly', priority: '0.9' },
    { url: 'about', changefreq: 'monthly', priority: '0.8' },
    { url: 'uses', changefreq: 'monthly', priority: '0.6' },
  ];

  const blogPages = posts.map((post) => ({
    url: `blog/${post.id}`,
    changefreq: 'monthly' as const,
    priority: '0.7',
    lastmod: (post.data.updatedDate ?? post.data.publishDate).toISOString(),
  }));

  const allPages = [...pages, ...blogPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (p) => `  <url>
    <loc>${new URL(p.url, site).href}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>${'lastmod' in p ? `
    <lastmod>${p.lastmod}</lastmod>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml.trim(), {
    headers: { 'Content-Type': 'application/xml' },
  });
}
