import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { allPosts } from '../lib/posts';
import { SITE } from '../lib/site';

export async function GET(context: APIContext) {
  const posts = await allPosts();
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site!,
    customData: `<language>he</language>`,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `${base}/blog/${p.id}`,
      categories: p.data.tags,
    })),
  });
}
