// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// DESIGN / BASE_PATH / OUT_DIR are used only for the side-by-side design preview builds.
const base = process.env.BASE_PATH || undefined;

export default defineConfig({
  site: 'https://www.am-i.ai',
  base,
  outDir: process.env.OUT_DIR || './dist',
  output: 'static', // כל העמודים סטטיים; רק /api/* ו-/admin/* מסומנים prerender=false ורצים כפונקציות
  adapter: vercel(),
  trailingSlash: 'ignore',
  integrations: [sitemap({ filter: (page) => !page.includes('/og/') && !page.includes('/admin') && !page.includes('/api/') })],
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark-dimmed' } },
  },
  build: { inlineStylesheets: 'auto', assets: '_a' },
  image: { responsiveStyles: true },
});
