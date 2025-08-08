import DOMPurify from 'dompurify';

// Allowed HTML tags and attributes for comments
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 's', 'del', 
  'ul', 'ol', 'li', 'blockquote', 'a', 'h1', 'h2', 'h3'
];

const ALLOWED_ATTRIBUTES = {
  'a': ['href', 'title', 'target', 'rel'],
  '*': ['class'] // Allow class attribute on all elements for styling
};

export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: return as-is, will be sanitized on client
    return html;
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: Object.keys(ALLOWED_ATTRIBUTES).reduce((acc, tag) => {
      if (tag === '*') {
        return [...acc, ...ALLOWED_ATTRIBUTES[tag]];
      }
      return [...acc, ...ALLOWED_ATTRIBUTES[tag as keyof typeof ALLOWED_ATTRIBUTES]];
    }, [] as string[]),
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    ADD_ATTR: ['target'], // Ensure links can open in new tab
    ADD_TAGS: [], // No additional tags
  });
}

export function stripHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return html.replace(/<[^>]*>/g, '');
  }

  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
}

export function getTextContent(html: string): string {
  if (typeof window === 'undefined') {
    return stripHtml(html);
  }

  const div = document.createElement('div');
  div.innerHTML = sanitizeHtml(html);
  return div.textContent || div.innerText || '';
}