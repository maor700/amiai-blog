// המרה בין טופס העריכה לקובץ index.md (frontmatter YAML + גוף Markdown).
import YAML from 'yaml';

export interface PostForm {
  slug: string; title: string; description: string; date: string; cover: string; coverAlt: string;
  section: string; book: string; parasha: string; moed: string; tags: string; draft: boolean; body: string;
}
export const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,80}$/;

export function parsePostFile(text: string): Omit<PostForm, 'slug'> {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const fm: any = m ? (YAML.parse(m[1]) ?? {}) : {};
  const body = m ? m[2].replace(/^\n/, '') : text;
  const d = fm.date instanceof Date ? fm.date.toISOString().slice(0, 10) : String(fm.date ?? '');
  return {
    title: fm.title ?? '', description: fm.description ?? '', date: d, cover: fm.cover ?? '', coverAlt: fm.coverAlt ?? '',
    section: fm.section ?? 'עיונים', book: fm.book ?? '', parasha: fm.parasha ?? '', moed: fm.moed ?? '',
    tags: Array.isArray(fm.tags) ? fm.tags.join(', ') : '', draft: Boolean(fm.draft), body,
  };
}

export function buildPostFile(f: Omit<PostForm, 'slug'>): string {
  const fm: Record<string, unknown> = { title: f.title.trim(), description: f.description.trim(), date: f.date };
  if (f.cover.trim()) fm.cover = f.cover.trim();
  if (f.coverAlt.trim()) fm.coverAlt = f.coverAlt.trim();
  fm.section = f.section || 'עיונים';
  if (f.section === 'פרשה') { if (f.book) fm.book = f.book; if (f.parasha.trim()) fm.parasha = f.parasha.trim(); }
  if (f.section === 'מועדים' && f.moed.trim()) fm.moed = f.moed.trim();
  const tags = f.tags.split(',').map((t) => t.trim()).filter(Boolean);
  if (tags.length) fm.tags = tags;
  if (f.draft) fm.draft = true;
  const yaml = YAML.stringify(fm, { lineWidth: 0 }).trimEnd();
  return `---\n${yaml}\n---\n\n${f.body.replace(/\r\n/g, '\n').trim()}\n`;
}
