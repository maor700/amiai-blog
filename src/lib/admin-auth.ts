// כניסת מנהל: סיסמה אחת (ADMIN_PASSWORD) → קוקי חתום ב-HMAC, 30 יום.
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { APIContext, AstroCookies } from 'astro';
import { env } from './env';

const COOKIE = 'amiai_admin';
const secret = () => createHmac('sha256', 'amiai-admin-v1').update(env.ADMIN_PASSWORD).digest('hex');
const sign = (payload: string) => createHmac('sha256', secret()).update(payload).digest('base64url');

export function adminEnabled() {
  return env.ADMIN_PASSWORD.length >= 8;
}
export function checkPassword(pw: string) {
  if (!adminEnabled()) return false;
  const a = Buffer.from(pw), b = Buffer.from(env.ADMIN_PASSWORD);
  return a.length === b.length && timingSafeEqual(a, b);
}
export function issueCookie(cookies: AstroCookies) {
  const exp = Date.now() + 30 * 24 * 3600 * 1000;
  const payload = String(exp);
  cookies.set(COOKIE, `${payload}.${sign(payload)}`, { path: '/', httpOnly: true, sameSite: 'lax', secure: !env.IS_DEV, expires: new Date(exp) });
}
export function clearCookie(cookies: AstroCookies) {
  cookies.delete(COOKIE, { path: '/' });
}
export function isAdmin(cookies: AstroCookies) {
  if (!adminEnabled()) return false;
  const v = cookies.get(COOKIE)?.value;
  if (!v) return false;
  const [payload, sig] = v.split('.');
  if (!payload || !sig) return false;
  const expected = sign(payload);
  if (expected.length !== sig.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return false;
  return Number(payload) > Date.now();
}
export function requireAdmin(ctx: APIContext): Response | null {
  return isAdmin(ctx.cookies) ? null : new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
}
