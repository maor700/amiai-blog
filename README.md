# am-i.ai · אלוהים, אדם ומכונה

הבלוג של מאור אלימלך: תורה, קבלה ובינה מלאכותית. אתר סטטי לחלוטין (Astro), התוכן חי בריפו כקבצי Markdown. אין CMS, אין מסד נתונים, אין משתני סביבה.

## מבנה

```
content/posts/<slug>/index.md   ← פוסט אחד לתיקייה, לצדו cover.* ותמונות פנימיות
content/comments/<slug>.json    ← ארכיון תגובות מהגרסה הקודמת (קריאה בלבד)
src/                            ← קוד האתר (Astro)
public/                         ← קבצים סטטיים כפי שהם (favicon, robots)
```

ה-slug של הפוסט הוא שם התיקייה, וה-URL הוא `/blog/<slug>`. הכתובות הישנות נשמרו אחד-לאחד.

## פוסט חדש = קובץ אחד + commit

```bash
node scripts/new-post.mjs my-post-slug "כותרת הפוסט"
# → content/posts/my-post-slug/index.md
```

1. שימו `cover.png` (או jpg/webp) בתיקייה. Astro מייצר ממנה גרסאות מכווצות ב-build, אז אפשר לשים קובץ גדול.
2. כתבו Markdown רגיל. ציטוטי תורה/גמרא כ-`>` (blockquote), כותרות ביניים כ-`##`, תמונות פנימיות כ-`![תיאור](./image.png)`.
3. שנו `draft: false` (או מחקו את השורה).
4. `git commit` + `git push`. ההוסטינג בונה ומפרסם.

### Frontmatter

| שדה | חובה | הערה |
|---|---|---|
| `title` | כן | |
| `description` | כן | משפט-שניים; משמש גם ל-OG ול-RSS |
| `date` | כן | `YYYY-MM-DD` |
| `cover` | לא | נתיב יחסי, למשל `./cover.png` |
| `coverAlt` | לא | כיתוב לתמונה |
| `section` | לא | `פרשה` / `מועדים` / `עיונים` (ברירת מחדל: עיונים) |
| `book`, `parasha` | לא | ל-`section: פרשה`. הארכיון מסודר לפי ספר ולפי סדר הפרשות |
| `moed` | לא | ל-`section: מועדים`, למשל "ספירת העומר" |
| `tags` | לא | רשימה |
| `draft` | לא | `true` = לא נבנה (נראה רק ב-`npm run dev`) |

## תגובות ועריכה מהדפדפן (אופציונלי, חינמי)

האתר עצמו סטטי. שני דברים רצים כפונקציות serverless על Vercel (טיר Hobby) רק אם מגדירים אותם:

**תגובות** — נשמרות ב-Neon Postgres (טיר חינמי). בעמוד הפוסט מופיע טופס; תגובה חדשה ממתינה לאישור. ההגנות: honeypot, מגבלת 5 תגובות ל-10 דקות לכתובת IP, ואישור ידני.
1. ב-Vercel: Storage → Create → Neon (או neon.tech ישירות) → מעתיקים את `DATABASE_URL` למשתני הסביבה של הפרויקט.
2. זה הכול; הטבלה נוצרת לבד בבקשה הראשונה. בלי `DATABASE_URL` קטע התגובות פשוט לא מופיע.

**ניהול** (`/admin`) — כניסה בסיסמה אחת, אישור/מחיקת תגובות, ועריכת פוסטים בעורך עשיר (Tiptap: כותרות, הדגשה, ציטוט, רשימות, קישורים, תמונות בהדבקה/גרירה, YouTube ווידאו מ-URL; מתג ל-Markdown גולמי). השמירה נכתבת כ-Markdown ונשמרת כ-commit ישירות לריפו (Vercel בונה ומפרסם אוטומטית). תמונות שהודבקו נשמרות כקבצים בתיקיית הפוסט; וידאו לא מועלה לריפו — רק קישור YouTube או כתובת mp4.
1. `ADMIN_PASSWORD` — סיסמה של 8 תווים לפחות.
2. `GITHUB_TOKEN` — Fine-grained personal access token (github.com → Settings → Developer settings → Fine-grained tokens) עם גישה לריפו הזה בלבד והרשאת **Contents: Read and write**. בלי הטוקן, עריכת הפוסטים כבויה (התגובות עדיין עובדות).
3. אופציונלי: `GITHUB_REPO` (ברירת מחדל `maor700/amiai-blog`), `GITHUB_BRANCH` (ברירת מחדל `master`), `NOTIFY_WEBHOOK_URL` (POST JSON על כל תגובה חדשה — למשל webhook של Slack/Make/n8n).

בפיתוח מקומי (`ADMIN_PASSWORD=xxxxxxxx npm run dev`) התגובות נשמרות ל-`.data/comments.json` והעריכה כותבת לקבצים המקומיים, בלי GitHub ובלי מסד נתונים.

הערה: התגובות הישנות מ-Sanity נשארו כקבצים ב-`content/comments/` ומוצגות כ"תגובות מהארכיון" מעל התגובות החיות.

## פיתוח ובנייה

```bash
npm install
npm run dev       # שרת פיתוח
npm run build     # → .vercel/output/ (סטטי + פונקציות ל-/api ו-/admin). בלי המתאם: להסיר adapter מ-astro.config.mjs ואז dist/
npm run preview
npm run check     # astro check (טיפוסים)
```

הבנייה מייצרת גם: `rss.xml`, `sitemap-index.xml`, תמונות OG לכל פוסט (`/og/<slug>.png`, נוצרות עם sharp), ו-404.

## עיצוב

סגנון פשוט בהשראת Medium: לבן, עמודה אחת ברוחב 680px, גוף המאמר ב-Frank Ruhl Libre (סריף), כותרות וממשק ב-Heebo (סאנס), ציטוטים עם פס בצד, מצב כהה (מתג בכותרת, נשמר ב-localStorage, אחרת לפי המערכת). כל ה-CSS בקובץ אחד: `src/styles/base.css`. הפונטים מגיעים מ-`@fontsource` ומוגשים מהאתר עצמו (בלי Google Fonts).

## הערות על התוכן שיוצא

- 3 פוסטים יוצאו דרך ה-API הציבורי של Sanity. הפוסט "אל תחכו ל-IBM שלכם" היה קיים ב-Sanity רק כטיוטה (ללא תאריך פרסום) ונלקח מהרינדור החי של האתר; התאריך שלו ב-frontmatter (2025-09-01) **משוער** וכדאי לתקן.
- כותרות-ביניים שהיו במקור פסקאות מודגשות הומרו ל-`##`; ציטוטים שעמדו בשורה נפרדת עם מרכאות הומרו ל-blockquote. הטקסט עצמו לא שונה.
- 4 תגובות מהאתר הישן נשמרו ב-`content/comments/` (בלי כתובות מייל) ומוצגות כ"תגובות מהארכיון". אין טופס תגובות חדש; אם רוצים, אפשר להוסיף giscus/utterances.

## מה הוסר במעבר מ-Sanity (9/2026)

Next.js 14, next-sanity, Sanity Studio (`sanity/`), הסכמות, מערכת התגובות (API routes + tiptap) וכל משתני הסביבה `SANITY_*`. התוכן יוצא במלואו ל-`content/`. פרויקט ה-Sanity (`uk3o2e58`) לא נמחק, אבל האתר לא קורא ממנו יותר.

## הוסטינג (Vercel)

- Framework preset: **Astro** (מזוהה אוטומטית). Build: `npm run build`. הפלט עם מתאם Vercel (`.vercel/output`), אין להגדיר Output Directory ידנית.
- למחוק את משתני הסביבה `SANITY_*` ו-`NEXT_PUBLIC_SANITY_*` מהפרויקט, ולהוסיף לפי הצורך `DATABASE_URL`, `ADMIN_PASSWORD`, `GITHUB_TOKEN`.
- Node 22 ומעלה.
