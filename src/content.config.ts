import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

// Post collection schema
const postCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/posts" }),
  schema: z.object({
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string().optional(),
    date: z.coerce.date().optional(),
    image: z.string().optional(),
    author: z.string().default("Admin"),
    categories: z.array(z.string()).default(() => ["others"]),
    tags: z.array(z.string()).default(() => ["others"]),
    link: z.string().optional(),
    draft: z.boolean().optional(),
    // i18n: set on a duplicated entry whose text is still in the other locale.
    needs_translation: z.boolean().optional(),
  }),
});

// Pages collection schema
const pagesCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/pages" }),
  schema: z.object({
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    draft: z.boolean().optional(),
    needs_translation: z.boolean().optional(),
  }),
});

// Projects collection schema (CV reference projects)
const projectsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/projects" }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    roles: z.array(z.string()).default(() => []),
    start: z.coerce.date(),
    end: z.coerce.date().optional(), // omit = ongoing
    summary: z.string(),
    stack: z
      .array(
        z.object({
          label: z.string(),
          items: z.array(z.string()),
        }),
      )
      .default(() => []),
    tags: z.array(z.string()).default(() => []),
    featured: z.boolean().default(false),
    draft: z.boolean().optional(),
    needs_translation: z.boolean().optional(),
  }),
});

// Export collections
export const collections = {
  posts: postCollection,
  pages: pagesCollection,
  projects: projectsCollection,
};
