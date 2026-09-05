import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import { getCommentsStore, publicFields } from '../../../lib/comments-store';
import { env } from '../../../lib/env';

export const prerender = false;

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,80}$/;

export const GET: APIRoute = async ({ params }) => {
  const store = getCommentsStore();
  if (!store) return json({ enabled: false, comments: [] });
  const slug = params.slug ?? '';
  if (!SLUG_RE.test(slug)) return json({ error: 'bad slug' }, 400);
  const comments = (await (await store).listApproved(slug)).map(publicFields);
  return json({ enabled: true, comments });
};

export const POST: APIRoute = async ({ params, request, clientAddress }) => {
  const store = getCommentsStore();
  if (!store) return json({ error: 'התגובות כבויות' }, 503);
  const slug = params.slug ?? '';
  if (!SLUG_RE.test(slug)) return json({ error: 'bad slug' }, 400);
  let data: any;
  try { data = await request.json(); } catch { return json({ error: 'bad json' }, 400); }
  if (typeof data.website === 'string' && data.website.trim()) return json({ ok: true, status: 'pending' }); // honeypot
  const name = String(data.name ?? '').trim().slice(0, 60);
  const body = String(data.body ?? '').replace(/\r\n/g, '\n').trim().slice(0, 4000);
  const parent = data.parent == null || data.parent === '' ? null : Number(data.parent);
  if (name.length < 2) return json({ error: 'צריך שם (לפחות 2 תווים)' }, 422);
  if (body.length < 3) return json({ error: 'התגובה ריקה' }, 422);
  if (parent !== null && !Number.isInteger(parent)) return json({ error: 'bad parent' }, 422);
  const s = await store;
  let ip = '';
  try { ip = clientAddress; } catch { ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? ''; }
  const ip_hash = ip ? createHash('sha256').update(ip + slug).digest('hex').slice(0, 32) : undefined;
  if (ip_hash && (await s.countRecentByIp(ip_hash, 10)) >= 5) return json({ error: 'יותר מדי תגובות בזמן קצר, נסה שוב בעוד כמה דקות' }, 429);
  const c = await s.create({ slug, parent, name, body, ip_hash });
  if (env.NOTIFY_WEBHOOK_URL) {
    fetch(env.NOTIFY_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'comment', slug, id: c.id, name, body: body.slice(0, 500) }) }).catch(() => {});
  }
  return json({ ok: true, status: c.status, id: c.id });
};
