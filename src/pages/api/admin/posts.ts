import type { APIRoute } from 'astro';
import { requireAdmin } from '../../../lib/admin-auth';
import { getRepoStore, type FileChange } from '../../../lib/repo-store';
import { buildPostFile, parsePostFile, SLUG_RE } from '../../../lib/post-file';
export const prerender = false;
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

export const GET: APIRoute = async (ctx) => {
  const denied = requireAdmin(ctx); if (denied) return denied;
  const repo = getRepoStore(); if (!repo) return json({ error: 'GITHUB_TOKEN לא מוגדר' }, 503);
  const slug = ctx.url.searchParams.get('slug');
  if (!slug) return json({ posts: await repo.listPosts(), source: repo.kind });
  if (!SLUG_RE.test(slug)) return json({ error: 'bad slug' }, 400);
  const text = await repo.readText(`content/posts/${slug}/index.md`);
  if (text == null) return json({ error: 'not found' }, 404);
  return json({ slug, ...parsePostFile(text), source: repo.kind });
};

export const PUT: APIRoute = async (ctx) => {
  const denied = requireAdmin(ctx); if (denied) return denied;
  const repo = getRepoStore(); if (!repo) return json({ error: 'GITHUB_TOKEN לא מוגדר' }, 503);
  const f = await ctx.request.json();
  const slug = String(f.slug ?? '').trim();
  if (!SLUG_RE.test(slug)) return json({ error: 'slug לא תקין: אותיות לטיניות קטנות, ספרות ומקפים' }, 422);
  if (!String(f.title ?? '').trim()) return json({ error: 'חסרה כותרת' }, 422);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(f.date ?? ''))) return json({ error: 'תאריך בפורמט YYYY-MM-DD' }, 422);
  const isNew = (await repo.readText(`content/posts/${slug}/index.md`)) == null;
  const changes: FileChange[] = [];
  let cover = String(f.cover ?? '');
  if (f.coverUpload && typeof f.coverUpload.data === 'string') {
    const ext = String(f.coverUpload.name ?? '').toLowerCase().match(/\.(png|jpe?g|webp|avif)$/)?.[1];
    if (!ext) return json({ error: 'תמונת כיסוי: png/jpg/webp/avif בלבד' }, 422);
    const b64 = f.coverUpload.data.replace(/^data:[^;]+;base64,/, '');
    if (b64.length > 12_000_000) return json({ error: 'תמונה גדולה מדי (עד ~8MB)' }, 422);
    changes.push({ path: `content/posts/${slug}/cover.${ext}`, content: b64, encoding: 'base64' });
    cover = `./cover.${ext}`;
  }
  const text = buildPostFile({
    title: f.title, description: f.description ?? '', date: f.date, cover, coverAlt: f.coverAlt ?? '',
    section: f.section ?? 'עיונים', book: f.book ?? '', parasha: f.parasha ?? '', moed: f.moed ?? '', tags: f.tags ?? '',
    draft: Boolean(f.draft), body: String(f.body ?? ''),
  });
  changes.push({ path: `content/posts/${slug}/index.md`, content: text });
  const res = await repo.commit(changes, `${isNew ? 'post' : 'edit'}: ${String(f.title).trim()} (${slug})`);
  return json({ ok: true, slug, isNew, sha: res.sha ?? null, source: repo.kind });
};
