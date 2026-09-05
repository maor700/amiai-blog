import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

export const BOOKS = ['בראשית', 'שמות', 'ויקרא', 'במדבר', 'דברים'] as const;
export const SECTIONS = ['פרשה', 'מועדים', 'עיונים'] as const;

const posts = defineCollection({
  // כל פוסט = תיקייה content/posts/<slug>/index.md (+ תמונות לידו). ה-slug הוא שם התיקייה.
  loader: glob({
    pattern: '*/index.md',
    base: './content/posts',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().default(''),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      section: z.enum(SECTIONS).default('עיונים'),
      book: z.enum(BOOKS).optional(),
      parasha: z.string().optional(),
      moed: z.string().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      // מזהים היסטוריים מהמעבר מ-Sanity (אינפורמטיבי בלבד)
      sanityId: z.string().optional(),
      sanityDraft: z.boolean().optional(),
    }),
});

const comments = defineCollection({
  // ארכיון תגובות שיוצא מ-Sanity. קריאה בלבד; אין טופס תגובות באתר הסטטי.
  loader: glob({ pattern: '*.json', base: './content/comments', generateId: ({ entry }) => entry.replace(/\.json$/, '') }),
  schema: z.object({
    post: z.string(),
    comments: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        date: z.string(),
        parent: z.string().nullable().optional(),
        text: z.string(),
      }),
    ),
  }),
});

export const collections = { posts, comments };
