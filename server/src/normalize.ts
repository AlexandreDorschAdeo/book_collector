export type AuthorRole = 'author' | 'writer' | 'illustrator';

export interface BookAuthor {
  name: string;
  role: AuthorRole;
}

const LEADING_ARTICLES = /^(?:l'|le\s+|la\s+|les\s+|un\s+|une\s+|des\s+|the\s+|a\s+|an\s+)/i;

export function stripAccents(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/Œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/Æ/g, 'ae');
}

export function normalizeTitleKey(title: string, subtitle?: string | null): string {
  const full = [title, subtitle]
    .map((s) => (s ?? '').trim())
    .filter(Boolean)
    .join(' ');
  if (!full) return '';

  let cleaned = stripAccents(full).toLowerCase().trim();
  cleaned = cleaned.replace(/['’`]/g, "'");
  cleaned = cleaned.replace(LEADING_ARTICLES, '');
  cleaned = cleaned
    .replace(/\b(?:tome|t|vol|volume)\.?\s*0*(\d+)\b/g, 'tome $1')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  return cleaned;
}

export function normalizeSingleAuthor(name: string): string {
  const cleaned = stripAccents(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  if (!cleaned) return '';
  const tokens = cleaned.split(/\s+/).filter(Boolean).sort();
  return tokens.join(' ');
}

export function normalizeAuthorKeys(authors: Array<BookAuthor | string>): string[] {
  const keys = new Set<string>();
  for (const item of authors) {
    const rawName = typeof item === 'string' ? item : item.name;
    const norm = normalizeSingleAuthor(rawName);
    if (norm) keys.add(norm);
  }
  return Array.from(keys).sort();
}

export function serializeAuthorKey(authors: Array<BookAuthor | string>): string {
  const keys = normalizeAuthorKeys(authors);
  return keys.length > 0 ? `|${keys.join('|')}|` : '';
}

export function parseAuthorKey(serialized: string): string[] {
  return serialized
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function hasCommonAuthor(
  authorsA: Array<BookAuthor | string>,
  authorsB: Array<BookAuthor | string> | string,
): boolean {
  const keysA = normalizeAuthorKeys(authorsA);
  const keysB =
    typeof authorsB === 'string' ? parseAuthorKey(authorsB) : normalizeAuthorKeys(authorsB);
  if (keysA.length === 0 || keysB.length === 0) return false;
  const setB = new Set(keysB);
  return keysA.some((k) => setB.has(k));
}
