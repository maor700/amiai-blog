// תמונות OG נוצרות בזמן build עם sharp (Pango מטפל ב-RTL/bidi נכון; satori לא).
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { DESIGN, SITE } from './site';

const ROOT = process.cwd();
const FONT_TITLE = path.join(ROOT, 'node_modules/@fontsource/frank-ruhl-libre/files/frank-ruhl-libre-hebrew-700-normal.woff');
const FONT_MONO = path.join(ROOT, 'node_modules/@fontsource/cousine/files/cousine-hebrew-400-normal.woff');
const W = 1200, H = 630, PAD = 72;

const PALETTE = DESIGN === 'terminal'
  ? { bg: '#0d0f12', fg: '#e6e9ee', muted: '#9aa3ad', accent: '#e0a94a', overlay: 'rgba(13,15,18,0.78)' }
  : { bg: '#f3ecdc', fg: '#211b14', muted: '#6d6152', accent: '#7a2e1d', overlay: 'rgba(243,236,220,0.86)' };

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function text(markup: string, opts: { fontfile: string; font: string; width: number; dpi: number }) {
  return sharp({ text: { text: markup, fontfile: opts.fontfile, font: opts.font, width: opts.width, dpi: opts.dpi, rgba: true, align: 'right', wrap: 'word' } })
    .png().toBuffer({ resolveWithObject: true });
}

function findCover(slug: string | null): string | null {
  if (!slug) return null;
  const dir = path.join(ROOT, 'content/posts', slug);
  if (!fs.existsSync(dir)) return null;
  const f = fs.readdirSync(dir).find((n) => /^cover\.(png|jpe?g|webp|avif)$/i.test(n));
  return f ? path.join(dir, f) : null;
}

export async function renderOg({ title, subtitle, cover }: { title: string; subtitle: string; cover: string | null }) {
  const coverPath = findCover(cover);
  let bg = sharp({ create: { width: W, height: H, channels: 4, background: PALETTE.bg } });
  const layers: sharp.OverlayOptions[] = [];
  if (coverPath) {
    const img = await sharp(coverPath).resize(W, H, { fit: 'cover', position: 'attention' }).modulate({ saturation: 0.6 }).blur(1.2).toBuffer();
    layers.push({ input: img, top: 0, left: 0 });
    layers.push({ input: await sharp({ create: { width: W, height: H, channels: 4, background: PALETTE.overlay } }).png().toBuffer(), top: 0, left: 0 });
  }
  // grid / rule
  const rule = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect x="${PAD}" y="${H - PAD - 2}" width="${W - PAD * 2}" height="2" fill="${PALETTE.accent}"/>
  </svg>`);
  layers.push({ input: rule, top: 0, left: 0 });

  const titleSize = title.length > 60 ? 235 : title.length > 40 ? 275 : 320; // dpi
  const t = await text(`<span foreground="${PALETTE.fg}">${esc(title)}</span>`, { fontfile: FONT_TITLE, font: 'Frank Ruhl Libre Bold', width: W - PAD * 2, dpi: titleSize });
  const s = await text(`<span foreground="${PALETTE.muted}">${esc(subtitle)}</span>`, { fontfile: FONT_MONO, font: 'Cousine', width: W - PAD * 2, dpi: 105 });
  const b = await text(`<span foreground="${PALETTE.accent}">${esc(SITE.short)}  ·  ${esc(SITE.title)}</span>`, { fontfile: FONT_MONO, font: 'Cousine', width: W - PAD * 2, dpi: 105 });

  const titleTop = Math.max(PAD + 40, Math.round((H - t.info.height) / 2 - 40));
  layers.push({ input: t.data, top: titleTop, left: W - PAD - t.info.width });
  layers.push({ input: s.data, top: titleTop + t.info.height + 28, left: W - PAD - s.info.width });
  layers.push({ input: b.data, top: H - PAD - 2 - b.info.height - 16, left: W - PAD - b.info.width });
  return bg.composite(layers).png({ compressionLevel: 9 }).toBuffer();
}
