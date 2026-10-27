import Database from 'better-sqlite3';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { createWorker } from 'tesseract.js';
import { BookType } from './db.js';
import { normalizeIsbn } from './isbn.js';
import {
  FetchLike,
  lookupIsbnMetadata,
  parseMultipleBnfUnimarcRecords,
} from './metadata.js';
import {
  BookAuthor,
  normalizeTitleKey,
  serializeAuthorKey,
} from './normalize.js';
import { BookDto, checkDuplicates } from './repository.js';
import { AppSettings, getAppSettings } from './settings.js';

export interface CoverClues {
  source: 'vision' | 'ocr';
  rawText: string;
  searchQuery: string;
  title: string | null;
  subtitle: string | null;
  publisher: string | null;
  isbn13: string | null;
  authors: BookAuthor[];
  inferredType: BookType;
}

export interface CoverCandidate {
  isbn13: string | null;
  title: string;
  subtitle: string | null;
  publisher: string | null;
  coverUrl: string | null;
  authors: BookAuthor[];
  type: BookType;
  duplicates: {
    sameIsbn: BookDto[];
    otherEditions: BookDto[];
  };
}

export interface CoverLookupResult {
  clues: CoverClues;
  candidates: CoverCandidate[];
  bestMatch: CoverCandidate | null;
}

export interface CoverLookupOptions {
  fetchImpl?: FetchLike;
  ocrFn?: (imageBuffer: Buffer) => Promise<string>;
}

const KNOWN_PUBLISHERS: Array<{
  pattern: RegExp;
  label: string;
  defaultType: BookType;
}> = [
  { pattern: /\burban\s+comics\b/i, label: 'Urban Comics', defaultType: 'comic' },
  { pattern: /\bpanini\s+comics\b/i, label: 'Panini Comics', defaultType: 'comic' },
  { pattern: /\bhi\s*comics\b/i, label: 'HiComics', defaultType: 'comic' },
  { pattern: /\bbliss\s+comics\b/i, label: 'Bliss Comics', defaultType: 'comic' },
  { pattern: /\bdelcourt\b/i, label: 'Delcourt', defaultType: 'bd' },
  { pattern: /\bdargaud\b/i, label: 'Dargaud', defaultType: 'bd' },
  { pattern: /\bgl[eé]nat\b/i, label: 'Glénat', defaultType: 'bd' },
  { pattern: /\bdupuis\b/i, label: 'Dupuis', defaultType: 'bd' },
  { pattern: /\bcasterman\b/i, label: 'Casterman', defaultType: 'bd' },
  { pattern: /\bsoleil\b/i, label: 'Soleil', defaultType: 'bd' },
  { pattern: /\b(?:le\s+)?lombard\b/i, label: 'Le Lombard', defaultType: 'bd' },
  { pattern: /\bfuturopolis\b/i, label: 'Futuropolis', defaultType: 'bd' },
  { pattern: /\b12\s*bis\b/i, label: '12 bis', defaultType: 'bd' },
  { pattern: /\bbamboo\b/i, label: 'Bamboo', defaultType: 'bd' },
  { pattern: /\bfluide\s+glacial\b/i, label: 'Fluide Glacial', defaultType: 'bd' },
  { pattern: /\bhumano[iï]des\s+associ[eé]s\b/i, label: 'Les Humanoïdes Associés', defaultType: 'bd' },
  { pattern: /\brue\s+de\s+s[eè]vres\b/i, label: 'Rue de Sèvres', defaultType: 'bd' },
  { pattern: /\bankama\b/i, label: 'Ankama', defaultType: 'bd' },
  { pattern: /\bkana\b/i, label: 'Kana', defaultType: 'manga' },
  { pattern: /\bki-?oon\b/i, label: 'Ki-oon', defaultType: 'manga' },
  { pattern: /\bpika\b/i, label: 'Pika', defaultType: 'manga' },
  { pattern: /\bkurokawa\b/i, label: 'Kurokawa', defaultType: 'manga' },
  { pattern: /\bkaz[eé]\b/i, label: 'Kazé', defaultType: 'manga' },
  { pattern: /\bcrunchyroll\b/i, label: 'Crunchyroll', defaultType: 'manga' },
  { pattern: /\bgallimard\b/i, label: 'Gallimard', defaultType: 'book' },
  { pattern: /\bfolio\b/i, label: 'Folio', defaultType: 'book' },
  { pattern: /\bpocket\b/i, label: 'Pocket', defaultType: 'book' },
  { pattern: /\ble\s+livre\s+de\s+poche\b/i, label: 'Le Livre de Poche', defaultType: 'book' },
  { pattern: /\bflammarion\b/i, label: 'Flammarion', defaultType: 'book' },
  { pattern: /\balbin\s+michel\b/i, label: 'Albin Michel', defaultType: 'book' },
  { pattern: /\bactes\s+sud\b/i, label: 'Actes Sud', defaultType: 'book' },
  { pattern: /\bseuil\b/i, label: 'Seuil', defaultType: 'book' },
  { pattern: /\bbragelonne\b/i, label: 'Bragelonne', defaultType: 'book' },
  { pattern: /\bmilady\b/i, label: 'Milady', defaultType: 'book' },
  { pattern: /\bhachette\b/i, label: 'Hachette', defaultType: 'book' },
];

export function parseCoverDataUrl(
  dataUrl: string,
): { mimeType: string; base64: string; buffer: Buffer } | null {
  const trimmed = (dataUrl ?? '').trim();
  const match = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/i.exec(
    trimmed,
  );
  if (!match) return null;
  const rawMime = match[1].toLowerCase();
  const mimeType = rawMime === 'image/jpg' ? 'image/jpeg' : rawMime;
  const base64 = match[2].replace(/\s+/g, '');
  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length === 0) return null;
  return { mimeType, base64, buffer };
}

export async function runTesseractOcr(imageBuffer: Buffer): Promise<string> {
  const cacheDir = path.join(os.tmpdir(), 'book-collector-tesseract-cache');
  fs.mkdirSync(cacheDir, { recursive: true });
  const worker = await createWorker(['fra', 'eng'], 1, {
    cachePath: cacheDir,
    logger: () => {},
  });
  try {
    const ret = await worker.recognize(imageBuffer);
    return ret.data?.text ?? '';
  } finally {
    await worker.terminate();
  }
}

export function parseOcrTextToClues(rawText: string): CoverClues {
  const text = (rawText ?? '').trim();

  // Check if an ISBN appears anywhere in the text
  let detectedIsbn: string | null = null;
  const isbnCandidates = text.match(/(?:97[89][\d\s-]{10,16}|\b\d[\d\s-]{8,12}[\dXx]\b)/g) ?? [];
  for (const cand of isbnCandidates) {
    const norm = normalizeIsbn(cand);
    if (norm) {
      detectedIsbn = norm;
      break;
    }
  }

  let publisher: string | null = null;
  let inferredType: BookType = 'book';
  for (const pub of KNOWN_PUBLISHERS) {
    if (pub.pattern.test(text)) {
      publisher = pub.label;
      inferredType = pub.defaultType;
      break;
    }
  }

  if (inferredType === 'book') {
    if (/\b(?:manga|shonen|seinen|shojo)\b/i.test(text)) {
      inferredType = 'manga';
    } else if (/\b(?:comics?|marvel|dc\s+comics|vertigo|image\s+comics)\b/i.test(text)) {
      inferredType = 'comic';
    } else if (/\b(?:sc[eé]nario|dessin|bande\s+dessin[eé]e)\b/i.test(text)) {
      inferredType = 'bd';
    }
  }

  // Extract volume/tome hint if present
  let subtitle: string | null = null;
  const tomeMatch = /\b(?:tome|t\.|vol(?:ume)?\.?)\s*(\d{1,3})\b/i.exec(text);
  if (tomeMatch) {
    subtitle = `Tome ${tomeMatch[1]}`;
  }

  // Clean lines
  const rawLines = text
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/[|~_`^§¤°•*<>[\]{}()\\\/]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter((line) => {
      if (line.length < 2) return false;
      const letters = (line.match(/[A-Za-zÀ-ÖØ-öø-ÿ]/g) ?? []).length;
      if (letters < 2) return false;
      if (/^(?:isbn|ean|prix|code|imprim[eé]|d[eé]p[oô]t\s+l[eé]gal)\b/i.test(line)) {
        return false;
      }
      return true;
    });

  // Remove publisher line from content lines so it doesn't get mistaken for title/author
  const contentLines = rawLines.filter((line) => {
    for (const pub of KNOWN_PUBLISHERS) {
      if (pub.pattern.test(line) && line.length <= pub.label.length + 6) {
        return false;
      }
    }
    return true;
  });

  let title: string | null = null;
  const authors: BookAuthor[] = [];

  for (const line of contentLines) {
    // Check explicit role prefixes on cover like "Scénario : X" or "Dessin : Y"
    const writerMatch = /^(?:sc[eé]nario|texte|histoire|\bpar\b)\s*[:\-]?\s*(.+)$/i.exec(
      line,
    );
    const illusMatch = /^(?:dessins?|illustrations?|art)\s*[:\-]?\s*(.+)$/i.exec(line);
    if (writerMatch && writerMatch[1].trim().length >= 3) {
      authors.push({ name: writerMatch[1].trim(), role: 'writer' });
      continue;
    }
    if (illusMatch && illusMatch[1].trim().length >= 3) {
      authors.push({ name: illusMatch[1].trim(), role: 'illustrator' });
      continue;
    }
  }

  // Filter out role lines already captured and tome-only lines
  const remainingLines = contentLines.filter(
    (line) =>
      !/^(?:sc[eé]nario|texte|histoire|dessins?|illustrations?|art)\s*[:\-]/i.test(line) &&
      !/^(?:tome|t\.|vol(?:ume)?\.?)\s*\d{1,3}$/i.test(line),
  );

  // Heuristic: if a line looks like 1 or 2 proper names ("Prénom Nom" or "NOM • NOM") and there is another line for the title
  const personNamePattern =
    /^[A-ZÀ-ÖØ-Þ][A-Za-zÀ-ÖØ-öø-ÿ'-]+(?:\s+[A-ZÀ-ÖØ-Þ][A-Za-zÀ-ÖØ-öø-ÿ'.-]+){1,3}$/;

  if (remainingLines.length >= 2) {
    const first = remainingLines[0];
    const second = remainingLines[1];
    // Often covers have Author at the top and Title below, or Title at top and Author below
    if (authors.length === 0 && personNamePattern.test(first) && !personNamePattern.test(second)) {
      authors.push({ name: first, role: 'author' });
      title = second;
      if (!subtitle && remainingLines[2] && !personNamePattern.test(remainingLines[2])) {
        subtitle = remainingLines[2];
      }
    } else {
      title = first;
      const last = remainingLines[remainingLines.length - 1];
      if (authors.length === 0 && remainingLines.length >= 2 && personNamePattern.test(last)) {
        authors.push({ name: last, role: 'author' });
        if (!subtitle && remainingLines.length >= 3) {
          subtitle = remainingLines[1];
        }
      } else if (!subtitle && second) {
        subtitle = second;
      }
    }
  } else if (remainingLines.length === 1) {
    title = remainingLines[0];
  }

  // Build search query from top tokens
  const queryParts = remainingLines.slice(0, 4).join(' ');
  const tokens = queryParts
    .replace(/[^\p{L}\p{N}\s'-]+/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2)
    .slice(0, 10);
  const searchQuery = tokens.join(' ').trim();

  return {
    source: 'ocr',
    rawText: text,
    searchQuery,
    title,
    subtitle,
    publisher,
    isbn13: detectedIsbn,
    authors,
    inferredType,
  };
}

const VISION_PROMPT = `Analyse cette photo de couverture de livre (roman, BD, manga ou comic book).
Réponds UNIQUEMENT avec un objet JSON valide (sans markdown) au format :
{
  "title": "Titre principal du livre ou de la série (ou null)",
  "subtitle": "Sous-titre ou numéro/titre de tome ex: Tome 1 - ... (ou null)",
  "writer": "Nom du scénariste ou auteur principal (ou null)",
  "illustrator": "Nom du dessinateur/illustrateur si mentionné (ou null)",
  "publisher": "Maison d'édition visible sur la couverture (ou null)",
  "isbn": "ISBN si visible (ou null)",
  "type": "book | bd | manga | comic",
  "searchQuery": "Requête courte (titre + auteur principal) idéale pour chercher ce livre dans un catalogue"
}`;

function parseVisionJsonToClues(rawJsonText: string): CoverClues | null {
  try {
    const cleaned = rawJsonText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    const obj = JSON.parse(cleaned) as {
      title?: string | null;
      subtitle?: string | null;
      writer?: string | null;
      illustrator?: string | null;
      author?: string | null;
      publisher?: string | null;
      isbn?: string | null;
      type?: string | null;
      searchQuery?: string | null;
    };

    const title = obj.title?.trim() || null;
    const subtitle = obj.subtitle?.trim() || null;
    const publisher = obj.publisher?.trim() || null;
    const isbn13 = obj.isbn ? normalizeIsbn(String(obj.isbn)) : null;

    const authors: BookAuthor[] = [];
    if (obj.writer?.trim()) {
      authors.push({ name: obj.writer.trim(), role: 'writer' });
    }
    if (obj.illustrator?.trim()) {
      authors.push({ name: obj.illustrator.trim(), role: 'illustrator' });
    }
    if (authors.length === 0 && obj.author?.trim()) {
      authors.push({ name: obj.author.trim(), role: 'author' });
    }

    const validTypes = new Set<BookType>(['book', 'bd', 'manga', 'comic']);
    const inferredType: BookType =
      obj.type && validTypes.has(obj.type as BookType)
        ? (obj.type as BookType)
        : 'book';

    const searchQuery =
      obj.searchQuery?.trim() ||
      [title, subtitle, ...authors.map((a) => a.name)]
        .filter(Boolean)
        .join(' ')
        .trim();

    if (!title && !searchQuery && !isbn13) {
      return null;
    }

    return {
      source: 'vision',
      rawText: [title, subtitle, ...authors.map((a) => a.name), publisher]
        .filter(Boolean)
        .join('\n'),
      searchQuery,
      title,
      subtitle,
      publisher,
      isbn13,
      authors,
      inferredType,
    };
  } catch {
    return null;
  }
}

async function tryVisionProviders(
  mimeType: string,
  base64: string,
  fetchImpl: FetchLike,
  settings: AppSettings,
): Promise<CoverClues | null> {
  if (settings.visionProvider === 'ocr') {
    return null;
  }

  const allowGemini =
    settings.visionProvider === 'auto' || settings.visionProvider === 'gemini';
  const allowOpenai =
    settings.visionProvider === 'auto' || settings.visionProvider === 'openai';
  const allowOllama =
    settings.visionProvider === 'auto' || settings.visionProvider === 'ollama';

  const geminiKey = settings.geminiApiKey;
  if (allowGemini && geminiKey) {
    try {
      const model = settings.geminiModel || 'gemini-2.0-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(geminiKey)}`;
      const res = await fetchImpl(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: VISION_PROMPT },
                { inlineData: { mimeType, data: base64 } },
              ],
            },
          ],
          generationConfig: { responseMimeType: 'application/json' },
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }> };
          }>;
        };
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        const clues = parseVisionJsonToClues(text);
        if (clues) return clues;
      }
    } catch {
      // Fall through to next provider or OCR
    }
  }

  const openaiKey = settings.openaiApiKey;
  if (allowOpenai && openaiKey) {
    try {
      const model = settings.openaiModel || 'gpt-4o-mini';
      const res = await fetchImpl('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: VISION_PROMPT },
                {
                  type: 'image_url',
                  image_url: { url: `data:${mimeType};base64,${base64}` },
                },
              ],
            },
          ],
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const text = data?.choices?.[0]?.message?.content ?? '';
        const clues = parseVisionJsonToClues(text);
        if (clues) return clues;
      }
    } catch {
      // Fall through
    }
  }

  const ollamaUrl = settings.ollamaUrl;
  if (allowOllama && ollamaUrl) {
    try {
      const model = settings.ollamaModel || 'llava';
      const base = ollamaUrl.replace(/\/+$/, '');
      const res = await fetchImpl(`${base}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: VISION_PROMPT,
          images: [base64],
          format: 'json',
          stream: false,
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        const data = (await res.json()) as { response?: string };
        const clues = parseVisionJsonToClues(data?.response ?? '');
        if (clues) return clues;
      }
    } catch {
      // Fall through
    }
  }

  return null;
}

interface RawCandidate {
  isbn13: string | null;
  title: string;
  subtitle: string | null;
  publisher: string | null;
  coverUrl: string | null;
  authors: BookAuthor[];
  type: BookType;
}

function inferBookTypeFromCandidate(
  title: string,
  subtitle: string | null,
  publisher: string | null,
  authors: BookAuthor[],
  fallbackType: BookType,
): BookType {
  const pubText = (publisher ?? '').toLowerCase();
  for (const pub of KNOWN_PUBLISHERS) {
    if (pub.pattern.test(pubText)) {
      return pub.defaultType;
    }
  }
  if (
    authors.some((a) => a.role === 'writer' || a.role === 'illustrator') &&
    fallbackType === 'book'
  ) {
    return 'bd';
  }
  const combined = `${title} ${subtitle ?? ''}`;
  if (/\bmanga\b/i.test(combined)) return 'manga';
  if (/\bcomics?\b/i.test(combined)) return 'comic';
  return fallbackType;
}

export async function searchBnfByText(
  query: string,
  fetchImpl: FetchLike,
  fallbackType: BookType = 'book',
): Promise<RawCandidate[]> {
  const cleanQuery = query.replace(/["\\]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleanQuery) return [];
  try {
    const cql = `bib.anywhere all "${cleanQuery}" and bib.doctype all "a"`;
    const url = `https://catalogue.bnf.fr/api/SRU?version=1.2&operation=searchRetrieve&query=${encodeURIComponent(cql)}&recordSchema=unimarcxchange&maximumRecords=5`;
    const res = await fetchImpl(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const xml = await res.text();
    const records = parseMultipleBnfUnimarcRecords(xml);
    return records.map((rec) => ({
      isbn13: rec.isbn13,
      title: rec.title,
      subtitle: rec.subtitle,
      publisher: rec.publisher,
      coverUrl: rec.coverUrl,
      authors: rec.authors,
      type: inferBookTypeFromCandidate(
        rec.title,
        rec.subtitle,
        rec.publisher,
        rec.authors,
        fallbackType,
      ),
    }));
  } catch {
    return [];
  }
}

export async function searchGoogleBooksByText(
  query: string,
  fetchImpl: FetchLike,
  fallbackType: BookType = 'book',
): Promise<RawCandidate[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];
  try {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY?.trim();
    const keyParam = apiKey ? `&key=${encodeURIComponent(apiKey)}` : '';
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(cleanQuery)}&maxResults=5${keyParam}`;
    const res = await fetchImpl(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      items?: Array<{
        volumeInfo?: {
          title?: string;
          subtitle?: string;
          publisher?: string;
          authors?: string[];
          categories?: string[];
          industryIdentifiers?: Array<{ type?: string; identifier?: string }>;
          imageLinks?: { thumbnail?: string; smallThumbnail?: string };
        };
      }>;
    };
    const results: RawCandidate[] = [];
    for (const item of data?.items ?? []) {
      const info = item.volumeInfo;
      if (!info?.title) continue;
      let isbn13: string | null = null;
      for (const idObj of info.industryIdentifiers ?? []) {
        const norm = normalizeIsbn(idObj.identifier ?? '');
        if (norm) {
          isbn13 = norm;
          if (idObj.type === 'ISBN_13') break;
        }
      }
      const authors: BookAuthor[] = (info.authors ?? [])
        .map((n) => n.trim())
        .filter(Boolean)
        .map((name) => ({ name, role: 'author' as const }));
      const rawCover =
        info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail ?? null;
      const coverUrl = rawCover
        ? rawCover.replace(/^http:\/\//i, 'https://')
        : null;
      const publisher = info.publisher ? info.publisher.trim() : null;
      const subtitle = info.subtitle ? info.subtitle.trim() : null;

      let type = inferBookTypeFromCandidate(
        info.title.trim(),
        subtitle,
        publisher,
        authors,
        fallbackType,
      );
      const cats = (info.categories ?? []).join(' ').toLowerCase();
      if (type === 'book' && /comics|graphic novels|bande dessin/i.test(cats)) {
        type = 'bd';
      }

      results.push({
        isbn13,
        title: info.title.trim(),
        subtitle,
        publisher,
        coverUrl,
        authors,
        type,
      });
    }
    return results;
  } catch {
    return [];
  }
}

export async function searchOpenLibraryByText(
  query: string,
  fetchImpl: FetchLike,
  fallbackType: BookType = 'book',
): Promise<RawCandidate[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];
  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(cleanQuery)}&fields=isbn,title,subtitle,author_name,publisher,cover_i&limit=5`;
    const res = await fetchImpl(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      docs?: Array<{
        isbn?: string[];
        title?: string;
        subtitle?: string;
        author_name?: string[];
        publisher?: string[];
        cover_i?: number;
      }>;
    };
    const results: RawCandidate[] = [];
    for (const doc of data?.docs ?? []) {
      if (!doc.title) continue;
      let isbn13: string | null = null;
      for (const rawIsbn of doc.isbn ?? []) {
        const norm = normalizeIsbn(rawIsbn);
        if (norm) {
          isbn13 = norm;
          break;
        }
      }
      const authors: BookAuthor[] = (doc.author_name ?? [])
        .map((n) => n.trim())
        .filter(Boolean)
        .map((name) => ({ name, role: 'author' as const }));
      const publisher = doc.publisher?.map((p) => p.trim()).find(Boolean) ?? null;
      const subtitle = doc.subtitle ? doc.subtitle.trim() : null;
      const coverUrl = doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
        : null;
      results.push({
        isbn13,
        title: doc.title.trim(),
        subtitle,
        publisher,
        coverUrl,
        authors,
        type: inferBookTypeFromCandidate(
          doc.title.trim(),
          subtitle,
          publisher,
          authors,
          fallbackType,
        ),
      });
    }
    return results;
  } catch {
    return [];
  }
}

function mergeCandidateList(rawList: RawCandidate[]): RawCandidate[] {
  const merged: RawCandidate[] = [];

  for (const item of rawList) {
    if (!item.title) continue;
    const itemTitleKey = normalizeTitleKey(item.title, item.subtitle);
    const itemAuthorKey = serializeAuthorKey(item.authors);

    const existing = merged.find((m) => {
      if (item.isbn13 && m.isbn13 && item.isbn13 === m.isbn13) {
        return true;
      }
      const mTitleKey = normalizeTitleKey(m.title, m.subtitle);
      const mAuthorKey = serializeAuthorKey(m.authors);
      return (
        itemTitleKey === mTitleKey &&
        itemAuthorKey !== '' &&
        itemAuthorKey === mAuthorKey
      );
    });

    if (!existing) {
      merged.push({ ...item });
      continue;
    }

    if (!existing.isbn13 && item.isbn13) existing.isbn13 = item.isbn13;
    if (!existing.subtitle && item.subtitle) existing.subtitle = item.subtitle;
    if (!existing.publisher && item.publisher) existing.publisher = item.publisher;
    if (!existing.coverUrl && item.coverUrl) existing.coverUrl = item.coverUrl;
    const existingHasRoles = existing.authors.some(
      (a) => a.role === 'writer' || a.role === 'illustrator',
    );
    const itemHasRoles = item.authors.some(
      (a) => a.role === 'writer' || a.role === 'illustrator',
    );
    if (!existingHasRoles && itemHasRoles) {
      existing.authors = item.authors;
    } else if (existing.authors.length === 0 && item.authors.length > 0) {
      existing.authors = item.authors;
    }
    if (existing.type === 'book' && item.type !== 'book') {
      existing.type = item.type;
    }
  }

  return merged.slice(0, 6);
}

export async function lookupBookFromCoverImage(
  imageDataUrl: string,
  db: Database.Database,
  options: CoverLookupOptions = {},
): Promise<CoverLookupResult> {
  const parsedImage = parseCoverDataUrl(imageDataUrl);
  if (!parsedImage) {
    throw new Error(
      'Format d’image invalide (attendu : JPEG, PNG ou WebP en Data URL).',
    );
  }

  const fetchImpl: FetchLike =
    options.fetchImpl ?? (fetch as unknown as FetchLike);
  const settings = getAppSettings(db);

  // Step 1: Try Vision AI if configured, otherwise fallback to local OCR
  let clues = await tryVisionProviders(
    parsedImage.mimeType,
    parsedImage.base64,
    fetchImpl,
    settings,
  );

  if (!clues) {
    const ocrFn = options.ocrFn ?? runTesseractOcr;
    const rawText = await ocrFn(parsedImage.buffer);
    clues = parseOcrTextToClues(rawText);
  }

  // Step 2: Search bibliographic sources
  const rawCandidates: RawCandidate[] = [];

  if (clues.isbn13) {
    const exactMeta = await lookupIsbnMetadata(clues.isbn13, db, fetchImpl);
    if (exactMeta) {
      rawCandidates.push({
        isbn13: exactMeta.isbn13,
        title: exactMeta.title,
        subtitle: exactMeta.subtitle,
        publisher: exactMeta.publisher,
        coverUrl: exactMeta.coverUrl,
        authors: exactMeta.authors,
        type: inferBookTypeFromCandidate(
          exactMeta.title,
          exactMeta.subtitle,
          exactMeta.publisher,
          exactMeta.authors,
          clues.inferredType,
        ),
      });
    }
  }

  if (clues.searchQuery) {
    const [bnfList, gbList, olList] = await Promise.all([
      searchBnfByText(clues.searchQuery, fetchImpl, clues.inferredType),
      searchGoogleBooksByText(clues.searchQuery, fetchImpl, clues.inferredType),
      searchOpenLibraryByText(clues.searchQuery, fetchImpl, clues.inferredType),
    ]);
    rawCandidates.push(...bnfList, ...gbList, ...olList);
  }

  const merged = mergeCandidateList(rawCandidates);

  // If online catalogs returned nothing (or if clues had a title not in candidates), add clues fallback
  if (merged.length === 0 && clues.title) {
    merged.push({
      isbn13: clues.isbn13,
      title: clues.title,
      subtitle: clues.subtitle,
      publisher: clues.publisher,
      coverUrl: null,
      authors: clues.authors,
      type: clues.inferredType,
    });
  }

  // Step 3: Enrich every candidate with duplicate check against local SQLite library
  const candidates: CoverCandidate[] = merged.map((cand) => ({
    ...cand,
    duplicates: checkDuplicates(db, {
      isbn13: cand.isbn13,
      title: cand.title,
      subtitle: cand.subtitle,
      authors: cand.authors,
    }),
  }));

  return {
    clues,
    candidates,
    bestMatch: candidates[0] ?? null,
  };
}
