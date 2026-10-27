import Database from 'better-sqlite3';
import { BookType } from './db.js';
import {
  AuthorRole,
  BookAuthor,
  hasCommonAuthor,
  inferSeriesAndVolume,
  normalizeSeriesKey,
  normalizeTitleKey,
  serializeAuthorKey,
  stripAccents,
} from './normalize.js';
import { normalizeIsbn } from './isbn.js';

export interface CollectionDto {
  id: number;
  name: string;
  location: string;
  bookCount: number;
  createdAt: string;
}

export interface BookCollectionRef {
  id: number;
  name: string;
  location: string;
}

export interface BookDto {
  id: number;
  isbn13: string | null;
  title: string;
  subtitle: string | null;
  series: string | null;
  volumeNumber: number | null;
  publisher: string | null;
  coverUrl: string | null;
  authors: BookAuthor[];
  type: BookType;
  collections: BookCollectionRef[];
  createdAt: string;
}

export interface SeriesSummaryDto {
  seriesKey: string;
  name: string;
  books: BookDto[];
  ownedVolumes: number[];
  unnumberedBooksCount: number;
  maxOwnedVolume: number | null;
  targetVolumeCount: number | null;
  effectiveMaxVolume: number;
  missingVolumes: number[];
}

const VALID_TYPES = new Set<BookType>(['book', 'bd', 'manga', 'comic']);
const VALID_ROLES = new Set<AuthorRole>(['author', 'writer', 'illustrator']);

export function normalizeCollectionKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function listCollections(db: Database.Database): CollectionDto[] {
  const rows = db
    .prepare(
      `SELECT c.id, c.name, c.location, c.created_at,
              COUNT(bc.book_id) AS book_count
       FROM collection c
       LEFT JOIN book_collection bc ON bc.collection_id = c.id
       GROUP BY c.id
       ORDER BY c.name COLLATE NOCASE ASC, c.location COLLATE NOCASE ASC`,
    )
    .all() as Array<{
    id: number;
    name: string;
    location: string;
    created_at: string;
    book_count: number;
  }>;

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    location: r.location,
    bookCount: Number(r.book_count),
    createdAt: r.created_at,
  }));
}

export function getBookById(db: Database.Database, id: number): BookDto | null {
  const row = db
    .prepare(
      `SELECT id, isbn13, title, subtitle, series, volume_number, publisher, cover_path, authors_json, type, created_at
       FROM book WHERE id = ?`,
    )
    .get(id) as RawBookRow | undefined;

  if (!row) return null;
  return hydrateBooks(db, [row])[0];
}

interface RawBookRow {
  id: number;
  isbn13: string | null;
  title: string;
  subtitle: string | null;
  series?: string | null;
  series_key?: string | null;
  volume_number?: number | null;
  publisher?: string | null;
  cover_path?: string | null;
  authors_json: string;
  type: BookType;
  created_at: string;
  author_key?: string;
}

export function hydrateBooks(db: Database.Database, rows: RawBookRow[]): BookDto[] {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const placeholders = ids.map(() => '?').join(',');
  const colRows = db
    .prepare(
      `SELECT bc.book_id, c.id, c.name, c.location
       FROM book_collection bc
       JOIN collection c ON c.id = bc.collection_id
       WHERE bc.book_id IN (${placeholders})
       ORDER BY c.name COLLATE NOCASE ASC`,
    )
    .all(...ids) as Array<{
    book_id: number;
    id: number;
    name: string;
    location: string;
  }>;

  const colMap = new Map<number, BookCollectionRef[]>();
  for (const cr of colRows) {
    const list = colMap.get(cr.book_id) ?? [];
    list.push({ id: cr.id, name: cr.name, location: cr.location });
    colMap.set(cr.book_id, list);
  }

  return rows.map((r) => ({
    id: r.id,
    isbn13: r.isbn13,
    title: r.title,
    subtitle: r.subtitle ?? null,
    series: r.series ?? null,
    volumeNumber:
      typeof r.volume_number === 'number' && Number.isInteger(r.volume_number)
        ? r.volume_number
        : null,
    publisher: r.publisher ?? null,
    coverUrl: r.cover_path ? `/api/covers/${r.cover_path}` : null,
    authors: JSON.parse(r.authors_json) as BookAuthor[],
    type: r.type,
    collections: colMap.get(r.id) ?? [],
    createdAt: r.created_at,
  }));
}

export interface BookInput {
  isbn?: string | null;
  title?: string;
  subtitle?: string | null;
  series?: string | null;
  volumeNumber?: number | string | null;
  publisher?: string | null;
  authors?: Array<{ name?: string; role?: string } | string>;
  type?: string;
  collectionIds?: number[];
  coverDataUrl?: string | null;
  coverSourceUrl?: string | null;
  removeCover?: boolean;
}

export function validateBookInput(
  db: Database.Database,
  input: BookInput,
): {
  ok: true;
  data: {
    isbn13: string | null;
    title: string;
    subtitle: string | null;
    series: string | null;
    seriesKey: string | null;
    volumeNumber: number | null;
    publisher: string | null;
    authors: BookAuthor[];
    authorsText: string;
    type: BookType;
    collectionIds: number[];
    titleKey: string;
    authorKey: string;
  };
} | { ok: false; status: number; error: string } {
  const title = (input.title ?? '').trim();
  if (!title) {
    return { ok: false, status: 400, error: 'Le titre est obligatoire.' };
  }

  const subtitleRaw = (input.subtitle ?? '').trim();
  const subtitle = subtitleRaw ? subtitleRaw : null;

  const seriesRaw = (input.series ?? '').trim();
  const seriesKeyCandidate = seriesRaw ? normalizeSeriesKey(seriesRaw) : '';
  const series = seriesRaw && seriesKeyCandidate ? seriesRaw : null;
  const seriesKey = series ? seriesKeyCandidate : null;

  let volumeNumber: number | null = null;
  if (
    input.volumeNumber !== undefined &&
    input.volumeNumber !== null &&
    String(input.volumeNumber).trim() !== ''
  ) {
    const parsedVol = Number(String(input.volumeNumber).trim());
    if (!Number.isInteger(parsedVol) || parsedVol < 1) {
      return {
        ok: false,
        status: 400,
        error: 'Le numéro de tome doit être un entier positif (≥ 1).',
      };
    }
    volumeNumber = parsedVol;
  }

  const publisherRaw = (input.publisher ?? '').trim();
  const publisher = publisherRaw ? publisherRaw : null;

  const rawAuthors = Array.isArray(input.authors) ? input.authors : [];
  const authors: BookAuthor[] = [];
  for (const a of rawAuthors) {
    if (typeof a === 'string') {
      const name = a.trim();
      if (name) authors.push({ name, role: 'author' });
    } else if (a && typeof a === 'object') {
      const name = (a.name ?? '').trim();
      const role = (a.role ?? 'author') as AuthorRole;
      if (name) {
        authors.push({
          name,
          role: VALID_ROLES.has(role) ? role : 'author',
        });
      }
    }
  }

  if (authors.length === 0) {
    return { ok: false, status: 400, error: 'Au moins un auteur est obligatoire.' };
  }

  const type = (input.type ?? 'book') as BookType;
  if (!VALID_TYPES.has(type)) {
    return {
      ok: false,
      status: 400,
      error: 'Type de livre invalide (attendu : book, bd, manga ou comic).',
    };
  }

  const rawCols = Array.isArray(input.collectionIds) ? input.collectionIds : [];
  const collectionIds = Array.from(
    new Set(rawCols.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)),
  );
  if (collectionIds.length === 0) {
    return {
      ok: false,
      status: 400,
      error: 'Un livre doit appartenir à au moins une collection.',
    };
  }

  const placeholders = collectionIds.map(() => '?').join(',');
  const existingCols = db
    .prepare(`SELECT id FROM collection WHERE id IN (${placeholders})`)
    .all(...collectionIds) as Array<{ id: number }>;
  if (existingCols.length !== collectionIds.length) {
    return { ok: false, status: 400, error: 'Collection introuvable.' };
  }

  let isbn13: string | null = null;
  if (input.isbn !== undefined && input.isbn !== null && String(input.isbn).trim() !== '') {
    isbn13 = normalizeIsbn(String(input.isbn));
    if (!isbn13) {
      return { ok: false, status: 400, error: 'ISBN invalide (clé de contrôle incorrecte).' };
    }
  }

  const titleKey = normalizeTitleKey(title, subtitle);
  const authorKey = serializeAuthorKey(authors);
  const authorsText = authors.map((a) => a.name).join(', ');

  return {
    ok: true,
    data: {
      isbn13,
      title,
      subtitle,
      series,
      seriesKey,
      volumeNumber,
      publisher,
      authors,
      authorsText,
      type,
      collectionIds,
      titleKey,
      authorKey,
    },
  };
}

export function searchAndListBooks(
  db: Database.Database,
  params: {
    collectionId?: number;
    type?: string;
    seriesKey?: string;
    sort?: string;
    q?: string;
  },
): BookDto[] {
  const { collectionId, type, seriesKey, sort = 'title', q } = params;
  const conditions: string[] = [];
  const args: unknown[] = [];

  if (collectionId !== undefined) {
    conditions.push(
      'EXISTS (SELECT 1 FROM book_collection bc WHERE bc.book_id = b.id AND bc.collection_id = ?)',
    );
    args.push(collectionId);
  }

  if (type && VALID_TYPES.has(type as BookType)) {
    conditions.push('b.type = ?');
    args.push(type);
  }

  if (seriesKey) {
    const normalizedKey = normalizeSeriesKey(seriesKey);
    if (normalizedKey) {
      conditions.push('b.series_key = ?');
      args.push(normalizedKey);
    }
  }

  const queryText = (q ?? '').trim();
  if (queryText) {
    const cleanedTokens = stripAccents(queryText)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (cleanedTokens.length > 0) {
      const ftsQuery = cleanedTokens.map((t) => `"${t}"*`).join(' AND ');
      conditions.push(
        'b.id IN (SELECT rowid FROM book_fts WHERE book_fts MATCH ?)',
      );
      args.push(ftsQuery);
    }
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  let orderClause =
    'ORDER BY b.title COLLATE NOCASE ASC, COALESCE(b.volume_number, 999999) ASC, b.id ASC';
  if (sort === 'author') {
    orderClause = 'ORDER BY b.authors_text COLLATE NOCASE ASC, b.title COLLATE NOCASE ASC';
  } else if (sort === 'date' || sort === 'created_at') {
    orderClause = 'ORDER BY b.created_at DESC, b.id DESC';
  } else if (sort === 'series') {
    orderClause =
      'ORDER BY CASE WHEN b.series IS NULL THEN 1 ELSE 0 END ASC, b.series COLLATE NOCASE ASC, COALESCE(b.volume_number, 999999) ASC, b.title COLLATE NOCASE ASC, b.id ASC';
  }

  const rows = db
    .prepare(
      `SELECT b.id, b.isbn13, b.title, b.subtitle, b.series, b.volume_number, b.publisher, b.cover_path, b.authors_json, b.type, b.created_at
       FROM book b
       ${whereClause}
       ${orderClause}`,
    )
    .all(...args) as RawBookRow[];

  return hydrateBooks(db, rows);
}

export function checkDuplicates(
  db: Database.Database,
  params: {
    isbn13?: string | null;
    title?: string | null;
    subtitle?: string | null;
    authors?: Array<BookAuthor | string>;
  },
): { sameIsbn: BookDto[]; otherEditions: BookDto[] } {
  const { isbn13, title, subtitle, authors = [] } = params;

  let sameIsbn: BookDto[] = [];
  if (isbn13) {
    const rows = db
      .prepare(
        `SELECT id, isbn13, title, subtitle, series, volume_number, publisher, cover_path, authors_json, type, created_at
         FROM book WHERE isbn13 = ? ORDER BY id ASC`,
      )
      .all(isbn13) as RawBookRow[];
    sameIsbn = hydrateBooks(db, rows);
  }

  let otherEditions: BookDto[] = [];
  const titleKey = title ? normalizeTitleKey(title, subtitle) : '';
  if (titleKey && authors.length > 0) {
    const candidates = db
      .prepare(
        `SELECT id, isbn13, title, subtitle, series, volume_number, publisher, cover_path, authors_json, type, created_at, author_key
         FROM book WHERE title_key = ? ORDER BY id ASC`,
      )
      .all(titleKey) as RawBookRow[];

    const sameIsbnIds = new Set(sameIsbn.map((b) => b.id));
    const filtered = candidates.filter((row) => {
      if (sameIsbnIds.has(row.id)) return false;
      if (isbn13 && row.isbn13 === isbn13) return false;
      return hasCommonAuthor(authors, row.author_key ?? '');
    });

    otherEditions = hydrateBooks(db, filtered);
  }

  return { sameIsbn, otherEditions };
}

export function listSeriesSummaries(db: Database.Database): SeriesSummaryDto[] {
  const rows = db
    .prepare(
      `SELECT id, isbn13, title, subtitle, series, series_key, volume_number, publisher, cover_path, authors_json, type, created_at
       FROM book
       WHERE series_key IS NOT NULL AND series_key != ''
       ORDER BY series_key ASC, COALESCE(volume_number, 999999) ASC, title COLLATE NOCASE ASC, id ASC`,
    )
    .all() as RawBookRow[];

  if (rows.length === 0) return [];

  const hydrated = hydrateBooks(db, rows);
  const bookById = new Map<number, BookDto>();
  for (const b of hydrated) {
    bookById.set(b.id, b);
  }

  const configRows = db
    .prepare(
      'SELECT series_key, series_name, target_volume_count FROM series_config',
    )
    .all() as Array<{
    series_key: string;
    series_name: string;
    target_volume_count: number | null;
  }>;
  const configMap = new Map<
    string,
    { seriesName: string; targetVolumeCount: number | null }
  >();
  for (const cfg of configRows) {
    configMap.set(cfg.series_key, {
      seriesName: cfg.series_name,
      targetVolumeCount:
        typeof cfg.target_volume_count === 'number' &&
        Number.isInteger(cfg.target_volume_count) &&
        cfg.target_volume_count >= 1
          ? cfg.target_volume_count
          : null,
    });
  }

  const groups = new Map<
    string,
    { displayName: string; books: BookDto[] }
  >();
  for (const row of rows) {
    const sKey = row.series_key!;
    const dto = bookById.get(row.id)!;
    const existing = groups.get(sKey);
    if (!existing) {
      const cfgName = configMap.get(sKey)?.seriesName;
      groups.set(sKey, {
        displayName: cfgName || row.series || sKey,
        books: [dto],
      });
    } else {
      existing.books.push(dto);
    }
  }

  const summaries: SeriesSummaryDto[] = [];
  for (const [seriesKey, group] of groups.entries()) {
    const ownedSet = new Set<number>();
    let unnumberedBooksCount = 0;
    for (const b of group.books) {
      if (
        typeof b.volumeNumber === 'number' &&
        Number.isInteger(b.volumeNumber) &&
        b.volumeNumber >= 1
      ) {
        ownedSet.add(b.volumeNumber);
      } else {
        unnumberedBooksCount += 1;
      }
    }

    const ownedVolumes = Array.from(ownedSet).sort((a, b) => a - b);
    const maxOwnedVolume =
      ownedVolumes.length > 0 ? ownedVolumes[ownedVolumes.length - 1] : null;
    const targetVolumeCount = configMap.get(seriesKey)?.targetVolumeCount ?? null;
    const effectiveMaxVolume = Math.max(
      maxOwnedVolume ?? 0,
      targetVolumeCount ?? 0,
    );

    const missingVolumes: number[] = [];
    for (let v = 1; v <= effectiveMaxVolume; v++) {
      if (!ownedSet.has(v)) {
        missingVolumes.push(v);
      }
    }

    summaries.push({
      seriesKey,
      name: group.displayName,
      books: group.books,
      ownedVolumes,
      unnumberedBooksCount,
      maxOwnedVolume,
      targetVolumeCount,
      effectiveMaxVolume,
      missingVolumes,
    });
  }

  summaries.sort((a, b) =>
    a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }),
  );
  return summaries;
}

export function setSeriesTargetVolumeCount(
  db: Database.Database,
  seriesNameOrKey: string,
  targetVolumeCount: number | null,
): { ok: true; seriesKey: string; targetVolumeCount: number | null } | { ok: false; status: number; error: string } {
  const raw = (seriesNameOrKey ?? '').trim();
  const seriesKey = normalizeSeriesKey(raw);
  if (!seriesKey) {
    return {
      ok: false,
      status: 400,
      error: 'Nom ou identifiant de série manquant.',
    };
  }

  if (targetVolumeCount !== null && targetVolumeCount !== undefined) {
    if (!Number.isInteger(targetVolumeCount) || targetVolumeCount < 1) {
      return {
        ok: false,
        status: 400,
        error: 'Le dernier tome paru doit être un entier positif (≥ 1).',
      };
    }
  }

  const existingBookSeries = db
    .prepare(
      'SELECT series FROM book WHERE series_key = ? AND series IS NOT NULL LIMIT 1',
    )
    .get(seriesKey) as { series: string } | undefined;
  const displayName = existingBookSeries?.series ?? raw;

  if (targetVolumeCount === null || targetVolumeCount === undefined) {
    db.prepare('DELETE FROM series_config WHERE series_key = ?').run(seriesKey);
    return { ok: true, seriesKey, targetVolumeCount: null };
  }

  db.prepare(
    `INSERT INTO series_config (series_key, series_name, target_volume_count, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(series_key) DO UPDATE SET
       series_name = excluded.series_name,
       target_volume_count = excluded.target_volume_count,
       updated_at = datetime('now')`,
  ).run(seriesKey, displayName, targetVolumeCount);

  return { ok: true, seriesKey, targetVolumeCount };
}

export function extractVolumeForBook(
  title: string,
  subtitle: string | null,
): number | null {
  const inferred = inferSeriesAndVolume(title, subtitle);
  return inferred.volumeNumber;
}

