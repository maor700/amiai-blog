import type { APIRoute } from 'astro';
import { requireAdmin } from '../../../lib/admin-auth';
import { getCommentsStore, publicFields, type CommentStatus } from '../../../lib/comments-store';
export const prerender = false;
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

export const GET: APIRoute = async (ctx) => {
  const denied = requireAdmin(ctx); if (denied) return denied;
  const store = getCommentsStore(); if (!store) return json({ enabled: false, comments: [] });
  const status = (ctx.url.searchParams.get('status') || undefined) as CommentStatus | undefined;
  return json({ enabled: true, comments: (await (await store).listAll(status)).map(publicFields) });
};

export const POST: APIRoute = async (ctx) => {
  const denied = requireAdmin(ctx); if (denied) return denied;
  const store = getCommentsStore(); if (!store) return json({ error: 'no db' }, 503);
  const { id, action } = await ctx.request.json();
  const s = await store; const n = Number(id);
  if (!Number.isInteger(n)) return json({ error: 'bad id' }, 400);
  if (action === 'approve') await s.setStatus(n, 'approved');
  else if (action === 'spam') await s.setStatus(n, 'spam');
  else if (action === 'unapprove') await s.setStatus(n, 'pending');
  else if (action === 'delete') await s.remove(n);
  else return json({ error: 'bad action' }, 400);
  return json({ ok: true });
};
