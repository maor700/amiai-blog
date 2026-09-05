import type { APIRoute } from 'astro';
import { allPosts, postLabel } from '../../lib/posts';
import { renderOg } from '../../lib/og';
import { hebrewDate } from '../../lib/dates';
import { SITE } from '../../lib/site';

export async function getStaticPaths() {
  const posts = await allPosts();
  return [
    { params: { slug: 'default' }, props: { title: SITE.title, subtitle: SITE.tagline, cover: null } },
    ...posts.map((p) => ({
      params: { slug: p.id },
      props: { title: p.data.title, subtitle: `${postLabel(p)} · ${hebrewDate(p.data.date)}`, cover: p.id },
    })),
  ];
}

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOg(props as { title: string; subtitle: string; cover: string | null });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' } });
};
