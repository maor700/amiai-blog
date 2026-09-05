import type { APIRoute } from 'astro';
import { adminEnabled, checkPassword, clearCookie, issueCookie } from '../../../lib/admin-auth';
export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  if (form.get('action') === 'logout') { clearCookie(cookies); return redirect('/admin', 303); }
  if (!adminEnabled()) return new Response('ADMIN_PASSWORD לא מוגדר (לפחות 8 תווים)', { status: 503 });
  const pw = String(form.get('password') ?? '');
  await new Promise((r) => setTimeout(r, 400)); // האטה נגד ניחושים
  if (!checkPassword(pw)) return redirect('/admin?error=1', 303);
  issueCookie(cookies);
  return redirect('/admin', 303);
};
