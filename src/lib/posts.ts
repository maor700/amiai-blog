import { getCollection, type CollectionEntry } from 'astro:content';
import { BOOKS } from '../content.config';
import { parashaIndex } from './torah';

export type Post = CollectionEntry<'posts'>;

export async function allPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }: Post) => !data.draft || import.meta.env.DEV);
  return posts.sort((a: Post, b: Post) => b.data.date.getTime() - a.data.date.getTime());
}

export function postLabel(p: Post) {
  const d = p.data;
  if (d.section === 'פרשה' && d.parasha) return `פרשת ${d.parasha}`;
  if (d.section === 'מועדים') return d.moed ?? 'מועדים';
  return 'עיון';
}

export type ArchiveGroup = { key: string; title: string; kicker?: string; posts: Post[] };

export function groupForArchive(posts: Post[]): ArchiveGroup[] {
  const groups: ArchiveGroup[] = [];
  for (const book of BOOKS) {
    const inBook = posts
      .filter((p) => p.data.section === 'פרשה' && p.data.book === book)
      .sort((a, b) => parashaIndex(a.data.book, a.data.parasha) - parashaIndex(b.data.book, b.data.parasha));
    if (inBook.length) groups.push({ key: `book-${book}`, title: `ספר ${book}`, kicker: 'תורה', posts: inBook });
  }
  const orphanParasha = posts.filter((p) => p.data.section === 'פרשה' && !p.data.book);
  if (orphanParasha.length) groups.push({ key: 'parasha-other', title: 'פרשות', posts: orphanParasha });
  const moadim = posts.filter((p) => p.data.section === 'מועדים');
  if (moadim.length) groups.push({ key: 'moadim', title: 'מועדים וזמנים', kicker: 'לוח השנה', posts: moadim });
  const iyunim = posts.filter((p) => p.data.section === 'עיונים');
  if (iyunim.length) groups.push({ key: 'iyunim', title: 'עיונים', kicker: 'מחוץ לסדר הפרשות', posts: iyunim });
  return groups;
}
