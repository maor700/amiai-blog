const greg = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
const hebParts = new Intl.DateTimeFormat('he-u-ca-hebrew', { day: 'numeric', month: 'long', year: 'numeric' });

/** מספר → אותיות עבריות (גימטריה) עם גרשיים, למשל 22 → כ״ב, 5786 → תשפ״ו */
export function toHebrewNumeral(n: number, { dropThousands = true } = {}): string {
  if (dropThousands && n > 999) n = n % 1000;
  const units = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
  const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
  const hundreds = ['', 'ק', 'ר', 'ש', 'ת', 'תק', 'תר', 'תש', 'תת', 'תתק'];
  let s = hundreds[Math.floor(n / 100)] + tens[Math.floor((n % 100) / 10)] + units[n % 10];
  s = s.replace(/יה$/, 'טו').replace(/יו$/, 'טז');
  if (s.length === 1) return s + '׳';
  return s.slice(0, -1) + '״' + s.slice(-1);
}

export function hebrewDate(d: Date) {
  const parts = hebParts.formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const day = parseInt(get('day').replace(/\D/g, ''), 10);
  const year = parseInt(get('year').replace(/\D/g, ''), 10);
  const month = get('month').replace(/^ב/, '');
  if (!day || !year) return hebParts.format(d);
  return `${toHebrewNumeral(day)} ב${month} ${toHebrewNumeral(year)}`;
}
export function gregDate(d: Date) {
  return greg.format(d);
}
export function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}
export function readingMinutes(body: string | undefined) {
  const words = (body ?? '').replace(/[#*>\[\]()`_-]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 190));
}
