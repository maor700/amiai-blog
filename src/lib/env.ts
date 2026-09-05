// משתני סביבה של השרת (Vercel → Settings → Environment Variables). כולם אופציונליים בפיתוח.
export const env = {
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? '',
  GITHUB_TOKEN: process.env.GITHUB_TOKEN ?? '',
  GITHUB_REPO: process.env.GITHUB_REPO ?? 'maor700/amiai-blog',
  GITHUB_BRANCH: process.env.GITHUB_BRANCH ?? 'master',
  NOTIFY_WEBHOOK_URL: process.env.NOTIFY_WEBHOOK_URL ?? '',
  IS_DEV: import.meta.env.DEV,
};
