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

export function normalizeSeriesKey(series: string): string {
  return stripAccents(series)
    .toLowerCase()
    .replace(/['’`]/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function parsePositiveVolumeNumber(
  raw: string | number | null | undefined,
): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') {
    return Number.isInteger(raw) && raw >= 1 ? raw : null;
  }
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  const direct = /^0*(\d+)$/.exec(trimmed);
  if (direct) {
    const n = Number(direct[1]);
    return Number.isInteger(n) && n >= 1 ? n : null;
  }
  const match = /\b(?:tome|t\.?|vol(?:ume)?\.?|n°|#)?\s*0*(\d+)\b/i.exec(trimmed);
  if (match) {
    const n = Number(match[1]);
    return Number.isInteger(n) && n >= 1 ? n : null;
  }
  return null;
}

export function inferSeriesAndVolume(
  title?: string | null,
  subtitle?: string | null,
  explicitSeries?: string | null,
  explicitVolume?: string | number | null,
): { series: string | null; volumeNumber: number | null } {
  let series = explicitSeries?.trim() ? explicitSeries.trim() : null;
  let volumeNumber = parsePositiveVolumeNumber(explicitVolume);

  const cleanTitle = (title ?? '').trim();
  const cleanSubtitle = (subtitle ?? '').trim();

  // Pattern 1: "<Series> - Tome <N>" or "<Series>, T. <N>" or "<Series> Vol. <N>" or "<Series> #<N>"
  const seriesWithVolRegex =
    /^(.+?)\s*(?:[-–—:,]|\s+)\s*(?:tome|t\.|t(?=\d)|vol(?:ume)?\.?|n°|#)\s*0*(\d+)\b/i;

  if (cleanSubtitle) {
    const subSeriesMatch = seriesWithVolRegex.exec(cleanSubtitle);
    if (subSeriesMatch) {
      const candSeries = subSeriesMatch[1].replace(/[-–—:,\s]+$/, '').trim();
      const candVol = Number(subSeriesMatch[2]);
      if (!series && candSeries) series = candSeries;
      if (volumeNumber === null && candVol >= 1) volumeNumber = candVol;
    } else {
      // Pattern 2: Subtitle starts with or contains "Tome <N>" / "Vol. <N>" / "T. <N>" / "#<N>"
      const standaloneVolRegex =
        /(?:^|\b)(?:tome|t\.|t(?=\d)|vol(?:ume)?\.?|n°|#)\s*0*(\d+)\b/i;
      const subVolMatch = standaloneVolRegex.exec(cleanSubtitle);
      if (subVolMatch) {
        const candVol = Number(subVolMatch[1]);
        if (volumeNumber === null && candVol >= 1) volumeNumber = candVol;
        if (!series && cleanTitle) {
          // Extract series from title (stripping any trailing tome marker if present)
          const titleMatch = seriesWithVolRegex.exec(cleanTitle);
          series = titleMatch
            ? titleMatch[1].replace(/[-–—:,\s]+$/, '').trim()
            : cleanTitle;
        }
      }
    }
  }

  if (cleanTitle && (!series || volumeNumber === null)) {
    const titleSeriesMatch = seriesWithVolRegex.exec(cleanTitle);
    if (titleSeriesMatch) {
      const candSeries = titleSeriesMatch[1].replace(/[-–—:,\s]+$/, '').trim();
      const candVol = Number(titleSeriesMatch[2]);
      if (!series && candSeries) series = candSeries;
      if (volumeNumber === null && candVol >= 1) volumeNumber = candVol;
    }
  }

  return {
    series: series && series.length > 0 ? series : null,
    volumeNumber,
  };
}

