/**
 * Content Collections Configuration
 *
 * Defines schemas for all content collections.
 * Uses Astro 5 Content Layer API with glob loader.
 */

import {glob} from "astro/loaders";
import {defineCollection, z} from "astro:content";

const blog = defineCollection({
  loader: glob({pattern: "**/*.mdx", base: "./src/content/blog"}),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()),
    draft: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({pattern: "**/*.mdx", base: "./src/content/pages"}),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {blog, pages};
