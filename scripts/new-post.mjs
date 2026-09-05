#!/usr/bin/env node
// יצירת פוסט חדש: node scripts/new-post.mjs <slug> "כותרת"
// יוצר content/posts/<slug>/index.md עם frontmatter מוכן. הוסף cover.* לאותה תיקייה.
import fs from 'node:fs';
import path from 'node:path';

const [slug, ...titleParts] = process.argv.slice(2);
if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
  console.error('שימוש: node scripts/new-post.mjs <slug-באנגלית-עם-מקפים> "כותרת בעברית"');
  process.exit(1);
}
const title = titleParts.join(' ') || 'כותרת';
const dir = path.join('content/posts', slug);
if (fs.existsSync(dir)) { console.error(`כבר קיים: ${dir}`); process.exit(1); }
fs.mkdirSync(dir, { recursive: true });
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(dir, 'index.md'), `---
title: '${title.replace(/'/g, "''")}'
description: ''
date: ${today}
cover: './cover.png'
coverAlt: ''
section: 'פרשה'        # פרשה | מועדים | עיונים
book: 'בראשית'         # בראשית | שמות | ויקרא | במדבר | דברים  (רק ל-section: פרשה)
parasha: ''            # שם הפרשה, למשל: כי תשא
tags: []
draft: true            # להסיר/לשנות ל-false כשמפרסמים
---

הפסקה הראשונה.

> ״ציטוט מהתורה או מהגמרא כבלוק-ציטוט״ (מקור)

## כותרת ביניים

המשך.
`);
console.log(`נוצר ${dir}/index.md — הוסף cover.png לתיקייה, כתוב, שנה draft ל-false, ו-commit.`);
