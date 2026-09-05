// גישה לקבצי התוכן: GitHub (commit דרך Git Data API) בפרודקשן, מערכת הקבצים בפיתוח.
import fs from 'node:fs';
import path from 'node:path';
import { env } from './env';

export interface FileChange { path: string; content: string; encoding?: 'utf-8' | 'base64' }
export interface RepoStore {
  kind: 'github' | 'fs';
  listPosts(): Promise<string[]>;
  readText(p: string): Promise<string | null>;
  commit(changes: FileChange[], message: string): Promise<{ sha?: string }>;
}

const POSTS_DIR = 'content/posts';

function fsStore(): RepoStore {
  const root = process.cwd();
  return {
    kind: 'fs',
    async listPosts() { const d = path.join(root, POSTS_DIR); return fs.existsSync(d) ? fs.readdirSync(d).filter((n) => fs.existsSync(path.join(d, n, 'index.md'))).sort() : []; },
    async readText(p) { const f = path.join(root, p); return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null; },
    async commit(changes) {
      for (const c of changes) {
        const f = path.join(root, c.path);
        fs.mkdirSync(path.dirname(f), { recursive: true });
        fs.writeFileSync(f, c.encoding === 'base64' ? Buffer.from(c.content, 'base64') : c.content);
      }
      return {};
    },
  };
}

function githubStore(): RepoStore {
  const [owner, repo] = env.GITHUB_REPO.split('/');
  const api = `https://api.github.com/repos/${owner}/${repo}`;
  const headers = { Authorization: `Bearer ${env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'am-i-ai-admin' };
  const gh = async (url: string, init: RequestInit = {}) => {
    const r = await fetch(url, { ...init, headers: { ...headers, ...(init.headers ?? {}) } });
    if (!r.ok) throw new Error(`GitHub ${r.status}: ${(await r.text()).slice(0, 300)}`);
    return r.json();
  };
  return {
    kind: 'github',
    async listPosts() {
      const items: any[] = await gh(`${api}/contents/${POSTS_DIR}?ref=${env.GITHUB_BRANCH}`);
      return items.filter((i) => i.type === 'dir').map((i) => i.name).sort();
    },
    async readText(p) {
      const r = await fetch(`${api}/contents/${p}?ref=${env.GITHUB_BRANCH}`, { headers: { ...headers, Accept: 'application/vnd.github.raw+json' } });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(`GitHub ${r.status}`);
      return r.text();
    },
    async commit(changes, message) {
      // commit אטומי אחד עם כל הקבצים: ref → blobs → tree → commit → update ref
      const ref = await gh(`${api}/git/ref/heads/${env.GITHUB_BRANCH}`);
      const headSha: string = ref.object.sha;
      const head = await gh(`${api}/git/commits/${headSha}`);
      const tree = await Promise.all(changes.map(async (c) => {
        const blob = await gh(`${api}/git/blobs`, { method: 'POST', body: JSON.stringify({ content: c.content, encoding: c.encoding ?? 'utf-8' }) });
        return { path: c.path, mode: '100644', type: 'blob', sha: blob.sha };
      }));
      const newTree = await gh(`${api}/git/trees`, { method: 'POST', body: JSON.stringify({ base_tree: head.tree.sha, tree }) });
      const commit = await gh(`${api}/git/commits`, { method: 'POST', body: JSON.stringify({ message, tree: newTree.sha, parents: [headSha] }) });
      await gh(`${api}/git/refs/heads/${env.GITHUB_BRANCH}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha, force: false }) });
      return { sha: commit.sha };
    },
  };
}

export function getRepoStore(): RepoStore | null {
  if (env.GITHUB_TOKEN) return githubStore();
  if (env.IS_DEV) return fsStore();
  return null;
}
