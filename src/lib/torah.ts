import { BOOKS } from '../content.config';

export const PARASHOT: Record<(typeof BOOKS)[number], string[]> = {
  בראשית: ['בראשית', 'נח', 'לך לך', 'וירא', 'חיי שרה', 'תולדות', 'ויצא', 'וישלח', 'וישב', 'מקץ', 'ויגש', 'ויחי'],
  שמות: ['שמות', 'וארא', 'בא', 'בשלח', 'יתרו', 'משפטים', 'תרומה', 'תצוה', 'כי תשא', 'ויקהל', 'פקודי'],
  ויקרא: ['ויקרא', 'צו', 'שמיני', 'תזריע', 'מצורע', 'אחרי מות', 'קדושים', 'אמור', 'בהר', 'בחוקותי'],
  במדבר: ['במדבר', 'נשא', 'בהעלותך', 'שלח', 'קרח', 'חוקת', 'בלק', 'פינחס', 'מטות', 'מסעי'],
  דברים: ['דברים', 'ואתחנן', 'עקב', 'ראה', 'שופטים', 'כי תצא', 'כי תבוא', 'נצבים', 'וילך', 'האזינו', 'וזאת הברכה'],
};

export function parashaIndex(book?: string, parasha?: string): number {
  if (!book || !parasha) return 999;
  const list = PARASHOT[book as keyof typeof PARASHOT] ?? [];
  const i = list.findIndex((p) => parasha.startsWith(p) || p.startsWith(parasha));
  return i < 0 ? 998 : i;
}
