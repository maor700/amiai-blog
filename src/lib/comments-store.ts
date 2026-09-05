// אחסון תגובות: Neon Postgres בפרודקשן (DATABASE_URL), קובץ JSON מקומי בפיתוח.
import fs from 'node:fs';
import path from 'node:path';
import { env } from './env';

export type CommentStatus = 'pending' | 'approved' | 'spam';
export interface Comment {
  id: number;
  slug: string;
  parent: number | null;
  name: string;
  body: string;
  status: CommentStatus;
  created_at: string;
  ip_hash?: string;
}
export interface CommentsStore {
  listApproved(slug: string): Promise<Comment[]>;
  listAll(status?: CommentStatus): Promise<Comment[]>;
  countRecentByIp(ipHash: string, minutes: number): Promise<number>;
  create(c: Omit<Comment, 'id' | 'created_at' | 'status'> & { status?: CommentStatus }): Promise<Comment>;
  setStatus(id: number, status: CommentStatus): Promise<void>;
  remove(id: number): Promise<void>;
}

const publicFields = (c: Comment) => ({ id: c.id, slug: c.slug, parent: c.parent, name: c.name, body: c.body, status: c.status, created_at: c.created_at });

// ---------- Neon ----------
async function neonStore(): Promise<CommentsStore> {
  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(env.DATABASE_URL);
  let ready: Promise<void> | null = null;
  const init = () =>
    (ready ??= (async () => {
      await sql`CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        slug TEXT NOT NULL,
        parent INTEGER NULL REFERENCES comments(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        body TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        ip_hash TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`;
      await sql`CREATE INDEX IF NOT EXISTS comments_slug_status ON comments (slug, status)`;
    })());
  const row = (r: any): Comment => ({ ...r, created_at: new Date(r.created_at).toISOString() });
  return {
    async listApproved(slug) { await init(); return (await sql`SELECT * FROM comments WHERE slug=${slug} AND status='approved' ORDER BY created_at ASC`).map(row); },
    async listAll(status) { await init(); const rows = status ? await sql`SELECT * FROM comments WHERE status=${status} ORDER BY created_at DESC` : await sql`SELECT * FROM comments ORDER BY created_at DESC`; return rows.map(row); },
    async countRecentByIp(ipHash, minutes) { await init(); const r = await sql`SELECT count(*)::int AS n FROM comments WHERE ip_hash=${ipHash} AND created_at > now() - make_interval(mins => ${minutes})`; return r[0]?.n ?? 0; },
    async create(c) { await init(); const r = await sql`INSERT INTO comments (slug, parent, name, body, status, ip_hash) VALUES (${c.slug}, ${c.parent}, ${c.name}, ${c.body}, ${c.status ?? 'pending'}, ${c.ip_hash ?? null}) RETURNING *`; return row(r[0]); },
    async setStatus(id, status) { await init(); await sql`UPDATE comments SET status=${status} WHERE id=${id}`; },
    async remove(id) { await init(); await sql`DELETE FROM comments WHERE id=${id}`; },
  };
}

// ---------- קובץ מקומי (פיתוח בלבד) ----------
function fileStore(): CommentsStore {
  const file = path.join(process.cwd(), '.data', 'comments.json');
  const load = (): Comment[] => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : []);
  const save = (rows: Comment[]) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(rows, null, 2)); };
  return {
    async listApproved(slug) { return load().filter((c) => c.slug === slug && c.status === 'approved').sort((a, b) => a.created_at.localeCompare(b.created_at)); },
    async listAll(status) { return load().filter((c) => !status || c.status === status).sort((a, b) => b.created_at.localeCompare(a.created_at)); },
    async countRecentByIp(ipHash, minutes) { const since = Date.now() - minutes * 60_000; return load().filter((c) => c.ip_hash === ipHash && Date.parse(c.created_at) > since).length; },
    async create(c) { const rows = load(); const row: Comment = { ...c, id: (rows.at(-1)?.id ?? 0) + 1, status: c.status ?? 'pending', created_at: new Date().toISOString() }; rows.push(row); save(rows); return row; },
    async setStatus(id, status) { const rows = load(); const r = rows.find((x) => x.id === id); if (r) { r.status = status; save(rows); } },
    async remove(id) { save(load().filter((x) => x.id !== id && x.parent !== id)); },
  };
}

let store: Promise<CommentsStore> | null = null;
export function getCommentsStore(): Promise<CommentsStore> | null {
  if (env.DATABASE_URL) return (store ??= neonStore());
  if (env.IS_DEV) return (store ??= Promise.resolve(fileStore()));
  return null; // אין מסד נתונים בפרודקשן → התגובות כבויות
}
export { publicFields };
