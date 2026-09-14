import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

export const collections = {
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({ extend: z.object({
      course: z.string().optional(),
      order: z.number().optional(),
      venue: z.string().optional(),
      year: z.number().optional(),
      authors: z.string().optional(),
      tags: z.array(z.string()).default([]),
      source_file: z.string().optional(),
      links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
    }) }),
  }),
};
