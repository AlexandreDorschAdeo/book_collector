import Database from 'better-sqlite3';
import { AuthorRole, BookAuthor } from './normalize.js';
import { isbn13ToIsbn10, normalizeIsbn } from './isbn.js';

export interface IsbnMetadata {
  isbn13: string;
  title: string;
  subtitle: string | null;
  publisher: string | null;
  coverUrl: string | null;
  authors: BookAuthor[];
}

export type PartialMetadata = Omit<IsbnMetadata, 'isbn13'>;

export type FetchLike = (
  url: string,
  init?: RequestInit,
) => Promise<{
  ok: boolean;
  status: number;
  text: () => Promise<string>;
  json: () => Promise<unknown>;
  arrayBuffer?: () => Promise<ArrayBuffer>;
  headers?: { get?: (name: string) => string | null };
}>;

export function parseBnfUnimarcXml(xml: string): PartialMetadata | null {
  const datafieldRegex =
    /<(?:[a-z0-9]+:)?datafield\s+[^>]*tag="(\d{3})"[^>]*>([\s\S]*?)<\/(?:[a-z0-9]+:)?datafield>/gi;
  const subfieldRegex =
    /<(?:[a-z0-9]+:)?subfield\s+[^>]*code="([a-z0-9])"[^>]*>([\s\S]*?)<\/(?:[a-z0-9]+:)?subfield>/gi;

  let title = '';
  const subtitleParts: string[] = [];
  const responsibilityNotes: string[] = [];
  let seriesTitle = '';
  let seriesVol = '';
  let series225Title = '';
  let series225Vol = '';
  let publisher214 = '';
  let publisher210 = '';
  const rawAuthors: Array<{
    lastName: string;
    firstName: string;
    fullName: string;
    roleCodes: string[];
  }> = [];

  // Look for BnF ARK identifier in controlfield 003 or anywhere in record
  let coverUrl: string | null = null;
  const arkMatch = /ark:\/12148\/cb[0-9a-z]+/i.exec(xml);
  if (arkMatch) {
    coverUrl = `https://catalogue.bnf.fr/couverture?appName=NE&idArk=${encodeURIComponent(arkMatch[0])}&couverture=1`;
  }

  let dfMatch: RegExpExecArray | null;
  while ((dfMatch = datafieldRegex.exec(xml)) !== null) {
    const tag = dfMatch[1];
    const body = dfMatch[2];
    const subfields: Array<{ code: string; value: string }> = [];
    let sfMatch: RegExpExecArray | null;
    subfieldRegex.lastIndex = 0;
    while ((sfMatch = subfieldRegex.exec(body)) !== null) {
      subfields.push({
        code: sfMatch[1],
        value: decodeXmlEntities(sfMatch[2].trim()),
      });
    }

    if (tag === '200') {
      const aVals = subfields
        .filter((s) => s.code === 'a')
        .map((s) => s.value)
        .filter(Boolean);
      if (aVals.length > 0 && !title) {
        title = aVals[0];
        if (aVals.length > 1) subtitleParts.push(...aVals.slice(1));
      }
      for (const sf of subfields) {
        if ((sf.code === 'e' || sf.code === 'h' || sf.code === 'i') && sf.value) {
          subtitleParts.push(sf.value);
        } else if ((sf.code === 'f' || sf.code === 'g') && sf.value) {
          responsibilityNotes.push(sf.value);
        }
      }
    } else if (tag === '214') {
      const cVal = subfields.find((s) => s.code === 'c')?.value;
      if (cVal && !publisher214) {
        publisher214 = cleanPublisherName(cVal);
      }
    } else if (tag === '210') {
      const cVal = subfields.find((s) => s.code === 'c')?.value;
      if (cVal && !publisher210) {
        publisher210 = cleanPublisherName(cVal);
      }
    } else if (tag === '225') {
      const aVal = subfields.find((s) => s.code === 'a')?.value;
      const vVal = subfields.find((s) => s.code === 'v')?.value;
      if (aVal && vVal && !series225Title) {
        series225Title = aVal.trim();
        series225Vol = vVal.trim();
      }
    } else if (tag === '461') {
      const tVal = subfields.find((s) => s.code === 't')?.value;
      const vVal = subfields.find((s) => s.code === 'v')?.value;
      if (tVal && !seriesTitle) seriesTitle = tVal.trim();
      if (vVal && !seriesVol) seriesVol = vVal.trim();
    } else if (tag === '700' || tag === '701' || tag === '702') {
      const lastName = subfields.find((s) => s.code === 'a')?.value ?? '';
      const firstName = subfields.find((s) => s.code === 'b')?.value ?? '';
      const roleCodes = subfields
        .filter((s) => s.code === '4')
        .map((s) => s.value);
      const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
      if (fullName) {
        rawAuthors.push({ lastName, firstName, fullName, roleCodes });
      }
    }
  }

  const authors: BookAuthor[] = [];
  for (const raw of rawAuthors) {
    const role = resolveAuthorRole(
      raw.roleCodes,
      raw.lastName,
      raw.fullName,
      responsibilityNotes,
    );
    if (
      !authors.some(
        (a) =>
          a.name.toLowerCase() === raw.fullName.toLowerCase() &&
          a.role === role,
      )
    ) {
      authors.push({ name: raw.fullName, role });
    }
  }

  if (!seriesTitle && series225Title) {
    seriesTitle = series225Title;
    seriesVol = series225Vol;
  }

  if (!title && seriesTitle) {
    title = seriesTitle;
  }
  if (!title) return null;

  // Enrich with series title / volume number from 461 when distinct
  if (seriesTitle || seriesVol) {
    const lowerTitle = title.toLowerCase();
    const lowerSub = subtitleParts.join(' ').toLowerCase();
    const cleanVol = seriesVol.replace(/^t(?:ome)?\.?\s*/i, '').trim();
    const volLabel = cleanVol ? `Tome ${cleanVol}` : '';

    if (
      seriesTitle &&
      !lowerTitle.includes(seriesTitle.toLowerCase()) &&
      !lowerSub.includes(seriesTitle.toLowerCase())
    ) {
      const prefix = [seriesTitle, volLabel].filter(Boolean).join(' - ');
      subtitleParts.unshift(prefix);
    } else if (
      volLabel &&
      !lowerTitle.includes(volLabel.toLowerCase()) &&
      !lowerSub.includes(volLabel.toLowerCase())
    ) {
      subtitleParts.unshift(volLabel);
    }
  }

  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(' - ') : null;
  const publisher = publisher214 || publisher210 || null;

  return {
    title,
    subtitle,
    publisher,
    coverUrl,
    authors,
  };
}

export function extractIsbnFromUnimarcXml(xml: string): string | null {
  const datafield010Regex =
    /<(?:[a-z0-9]+:)?datafield\s+[^>]*tag="010"[^>]*>([\s\S]*?)<\/(?:[a-z0-9]+:)?datafield>/gi;
  const subfieldARegex =
    /<(?:[a-z0-9]+:)?subfield\s+[^>]*code="a"[^>]*>([\s\S]*?)<\/(?:[a-z0-9]+:)?subfield>/gi;

  let dfMatch: RegExpExecArray | null;
  while ((dfMatch = datafield010Regex.exec(xml)) !== null) {
    const body = dfMatch[1];
    subfieldARegex.lastIndex = 0;
    let sfMatch: RegExpExecArray | null;
    while ((sfMatch = subfieldARegex.exec(body)) !== null) {
      const candidate = normalizeIsbn(decodeXmlEntities(sfMatch[1].trim()));
      if (candidate) return candidate;
    }
  }
  return null;
}

export function parseMultipleBnfUnimarcRecords(
  xml: string,
): Array<PartialMetadata & { isbn13: string | null }> {
  const results: Array<PartialMetadata & { isbn13: string | null }> = [];
  const recordRegex =
    /<(?:[a-z0-9]+:)?record\b[^>]*>([\s\S]*?)<\/(?:[a-z0-9]+:)?record>/gi;
  let match: RegExpExecArray | null;
  const chunks: string[] = [];
  while ((match = recordRegex.exec(xml)) !== null) {
    if (/<(?:[a-z0-9]+:)?datafield\b/i.test(match[1])) {
      chunks.push(match[0]);
    }
  }
  if (chunks.length === 0 && /<(?:[a-z0-9]+:)?datafield\b/i.test(xml)) {
    chunks.push(xml);
  }
  for (const chunk of chunks) {
    const parsed = parseBnfUnimarcXml(chunk);
    if (parsed) {
      results.push({
        ...parsed,
        isbn13: extractIsbnFromUnimarcXml(chunk),
      });
    }
  }
  return results;
}

function cleanPublisherName(raw: string): string {
  return raw.replace(/^\[|\]$/g, '').trim();
}

function resolveAuthorRole(
  codes: string[],
  lastName: string,
  fullName: string,
  responsibilityNotes: string[],
): AuthorRole {
  if (codes.includes('440') || codes.includes('350')) return 'illustrator';
  if (codes.includes('650') || codes.includes('690') || codes.includes('090')) {
    return 'writer';
  }
  const needle = (lastName || fullName).toLowerCase();
  if (needle) {
    for (const note of responsibilityNotes) {
      const lower = note.toLowerCase();
      if (lower.includes(needle)) {
        if (/dessin|illustr|art|couleur/i.test(lower)) return 'illustrator';
        if (/sc[ée]nar|texte|histoire|[ée]crit/i.test(lower)) return 'writer';
      }
    }
  }
  if (codes.includes('070')) {
    return 'writer';
  }
  return 'author';
}

function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)));
}

export async function fetchFromBnf(
  isbn13: string,
  fetchImpl: FetchLike,
): Promise<PartialMetadata | null> {
  try {
    const isbn10 = isbn13ToIsbn10(isbn13);
    const cql = isbn10
      ? `bib.isbn adj "${isbn13}" or bib.isbn adj "${isbn10}"`
      : `bib.isbn adj "${isbn13}"`;
    const url = `https://catalogue.bnf.fr/api/SRU?version=1.2&operation=searchRetrieve&query=${encodeURIComponent(cql)}&recordSchema=unimarcxchange&maximumRecords=1`;
    const res = await fetchImpl(url, { signal: AbortSignal.timeout(4500) });
    if (!res.ok) return null;
    const xml = await res.text();
    return parseBnfUnimarcXml(xml);
  } catch {
    return null;
  }
}

export async function fetchFromSudoc(
  isbn13: string,
  fetchImpl: FetchLike,
): Promise<PartialMetadata | null> {
  try {
    const ppnUrl = `https://www.sudoc.fr/services/isbn2ppn/${encodeURIComponent(isbn13)}`;
    const ppnRes = await fetchImpl(ppnUrl, {
      signal: AbortSignal.timeout(4500),
      headers: { Accept: 'text/xml, application/xml, application/json' },
    });
    if (!ppnRes.ok) return null;
    const ppnText = await ppnRes.text();
    const ppnMatch =
      /<ppn>([0-9A-Za-z]+)<\/ppn>/i.exec(ppnText) ??
      /"ppn"\s*:\s*"([0-9A-Za-z]+)"/i.exec(ppnText);
    const ppn = ppnMatch?.[1];
    if (!ppn) return null;

    const xmlUrl = `https://www.sudoc.fr/${encodeURIComponent(ppn)}.xml`;
    const xmlRes = await fetchImpl(xmlUrl, { signal: AbortSignal.timeout(4500) });
    if (!xmlRes.ok) return null;
    const xml = await xmlRes.text();
    return parseBnfUnimarcXml(xml);
  } catch {
    return null;
  }
}

export async function fetchFromOpenLibrary(
  isbn13: string,
  fetchImpl: FetchLike,
): Promise<PartialMetadata | null> {
  try {
    const key = `ISBN:${isbn13}`;
    const url = `https://openlibrary.org/api/books?bibkeys=${encodeURIComponent(key)}&format=json&jscmd=data`;
    const res = await fetchImpl(url, { signal: AbortSignal.timeout(4500) });
    if (res.ok) {
      const data = (await res.json()) as Record<
        string,
        {
          title?: string;
          subtitle?: string;
          authors?: Array<{ name?: string }>;
          publishers?: Array<{ name?: string }>;
          cover?: { large?: string; medium?: string; small?: string };
        }
      >;
      const entry = data?.[key];
      if (entry && entry.title) {
        const authors: BookAuthor[] = (entry.authors ?? [])
          .map((a) => (a.name ?? '').trim())
          .filter(Boolean)
          .map((name) => ({ name, role: 'author' as const }));
        const publisher =
          entry.publishers
            ?.map((p) => (p.name ?? '').trim())
            .find(Boolean) ?? null;
        const coverUrl =
          entry.cover?.large ??
          entry.cover?.medium ??
          entry.cover?.small ??
          null;
        return {
          title: entry.title.trim(),
          subtitle: entry.subtitle ? entry.subtitle.trim() : null,
          publisher,
          coverUrl,
          authors,
        };
      }
    }

    // Fallback to Open Library Search API if bibkeys had no entry
    const searchUrl = `https://openlibrary.org/search.json?isbn=${encodeURIComponent(isbn13)}&fields=title,subtitle,author_name,publisher,cover_i&limit=1`;
    const searchRes = await fetchImpl(searchUrl, {
      signal: AbortSignal.timeout(4500),
    });
    if (!searchRes.ok) return null;
    const searchData = (await searchRes.json()) as {
      docs?: Array<{
        title?: string;
        subtitle?: string;
        author_name?: string[];
        publisher?: string[];
        cover_i?: number;
      }>;
    };
    const doc = searchData?.docs?.[0];
    if (!doc || !doc.title) return null;
    const authors: BookAuthor[] = (doc.author_name ?? [])
      .map((n) => n.trim())
      .filter(Boolean)
      .map((name) => ({ name, role: 'author' as const }));
    const publisher = doc.publisher?.map((p) => p.trim()).find(Boolean) ?? null;
    const coverUrl = doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
      : null;
    return {
      title: doc.title.trim(),
      subtitle: doc.subtitle ? doc.subtitle.trim() : null,
      publisher,
      coverUrl,
      authors,
    };
  } catch {
    return null;
  }
}

export async function fetchFromGoogleBooks(
  isbn13: string,
  fetchImpl: FetchLike,
): Promise<PartialMetadata | null> {
  try {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY?.trim();
    const keyParam = apiKey ? `&key=${encodeURIComponent(apiKey)}` : '';
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn13)}${keyParam}`;
    const res = await fetchImpl(url, { signal: AbortSignal.timeout(4500) });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      items?: Array<{
        volumeInfo?: {
          title?: string;
          subtitle?: string;
          publisher?: string;
          authors?: string[];
          imageLinks?: {
            thumbnail?: string;
            smallThumbnail?: string;
          };
        };
      }>;
    };
    const info = data?.items?.[0]?.volumeInfo;
    if (!info || !info.title) return null;
    const authors: BookAuthor[] = (info.authors ?? [])
      .map((name) => name.trim())
      .filter(Boolean)
      .map((name) => ({ name, role: 'author' as const }));
    const rawCover =
      info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail ?? null;
    const coverUrl = rawCover ? rawCover.replace(/^http:\/\//i, 'https://') : null;
    return {
      title: info.title.trim(),
      subtitle: info.subtitle ? info.subtitle.trim() : null,
      publisher: info.publisher ? info.publisher.trim() : null,
      coverUrl,
      authors,
    };
  } catch {
    return null;
  }
}

function hasDetailedRoles(authors: BookAuthor[]): boolean {
  return authors.some((a) => a.role === 'writer' || a.role === 'illustrator');
}

export async function lookupIsbnMetadata(
  isbn13: string,
  db?: Database.Database,
  fetchImpl: FetchLike = fetch as unknown as FetchLike,
): Promise<IsbnMetadata | null> {
  if (db) {
    const cached = db
      .prepare('SELECT payload_json FROM metadata_cache WHERE isbn13 = ?')
      .get(isbn13) as { payload_json: string } | undefined;
    if (cached) {
      const parsed = JSON.parse(cached.payload_json) as Partial<IsbnMetadata>;
      if ('publisher' in parsed && 'coverUrl' in parsed) {
        return parsed as IsbnMetadata;
      }
    }
  }

  const [bnfRes, sudocRes, olRes, gbRes] = await Promise.allSettled([
    fetchFromBnf(isbn13, fetchImpl),
    fetchFromSudoc(isbn13, fetchImpl),
    fetchFromOpenLibrary(isbn13, fetchImpl),
    fetchFromGoogleBooks(isbn13, fetchImpl),
  ]);

  const bnf = bnfRes.status === 'fulfilled' ? bnfRes.value : null;
  const sudoc = sudocRes.status === 'fulfilled' ? sudocRes.value : null;
  const ol = olRes.status === 'fulfilled' ? olRes.value : null;
  const gb = gbRes.status === 'fulfilled' ? gbRes.value : null;

  const sources = [bnf, sudoc, ol, gb].filter(
    (s): s is PartialMetadata => s !== null,
  );
  if (sources.length === 0) return null;

  const title = sources.find((s) => Boolean(s.title))?.title ?? '';
  if (!title) return null;

  const subtitle = sources.find((s) => Boolean(s.subtitle))?.subtitle ?? null;
  const publisher =
    sources.find((s) => Boolean(s.publisher))?.publisher ?? null;

  // Prefer author list that distinguishes writer/illustrator roles
  const roleRichAuthors =
    [bnf, sudoc]
      .filter((s): s is PartialMetadata => s !== null)
      .find((s) => s.authors.length > 0 && hasDetailedRoles(s.authors))
      ?.authors ?? null;
  const authors =
    roleRichAuthors ??
    sources.find((s) => s.authors.length > 0)?.authors ??
    [];

  // Prefer cover URL from Open Library or Google Books, then BnF/SUDOC ARK cover
  const coverUrl =
    ol?.coverUrl ?? gb?.coverUrl ?? bnf?.coverUrl ?? sudoc?.coverUrl ?? null;

  const result: IsbnMetadata = {
    isbn13,
    title,
    subtitle,
    publisher,
    coverUrl,
    authors,
  };

  if (db) {
    db.prepare(
      `INSERT INTO metadata_cache (isbn13, payload_json, updated_at)
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(isbn13) DO UPDATE SET payload_json = excluded.payload_json, updated_at = datetime('now')`,
    ).run(isbn13, JSON.stringify(result));
  }

  return result;
}
