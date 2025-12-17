import rss from '@astrojs/rss';
import type {APIContext} from 'astro';
import {getCollection} from 'astro:content';

import {SITE} from '../config';

export const GET = async (context: APIContext) => {
  const site = context.site ?? new URL(SITE.url);
  const posts = await getCollection('blog', ({data}) => !data.draft);

  const sortedPosts = posts.sort(
    (a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime()
  );

  return rss({
    title: SITE.name,
    description: SITE.description,
    site,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishDate,
      description: post.data.description,
      link: `/blog/${post.id}`,
      categories: post.data.tags,
    })),
    customData: `<language>en-gb</language>`,
    stylesheet: '/rss/styles.xsl',
  });
};
