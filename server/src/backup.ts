import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { seedDefaultAdminUser } from './auth.js';
import { ensureCoversDir } from './covers.js';
import { normalizeSeriesKey } from './normalize.js';

export interface BackupCollectionRow {
  id: number;
  name: string;
  location: string;
  name_key: string;
  location_key: string;
  created_at: string;
}

export interface BackupBookRow {
  id: number;
  isbn13: string | null;
  title: string;
  subtitle: string | null;
  series?: string | null;
  series_key?: string | null;
  volume_number?: number | null;
  publisher: string | null;
  cover_path: string | null;
  authors_json: string;
  authors_text: string;
  type: 'book' | 'bd' | 'manga' | 'comic';
  title_key: string;
  author_key: string;
  created_at: string;
}

export interface BackupSeriesConfigRow {
  series_key: string;
  series_name: string;
  target_volume_count: number | null;
  updated_at: string;
}

export interface BackupBookCollectionRow {
  book_id: number;
  collection_id: number;
}

export interface BackupMetadataCacheRow {
  isbn13: string;
  payload_json: string;
  updated_at: string;
}

export interface BackupAppSettingRow {
  key: string;
  value: string;
  updated_at: string;
}

export interface BackupAppUserRow {
  id: number;
  username: string;
  password_hash: string;
  can_add_books: number;
  can_edit_books: number;
  can_delete_books: number;
  can_manage_users: number;
  created_at: string;
}

export interface BackupCoverEntry {
  filename: string;
  contentBase64: string;
}

export interface BackupStats {
  booksCount: number;
  collectionsCount: number;
  coversCount: number;
  usersCount: number;
}

export interface BackupBundle {
  format: 'book-collector-backup';
  version: 1;
  date: string;
  createdAt: string;
  stats: BackupStats;
  data: {
    collections: BackupCollectionRow[];
    books: BackupBookRow[];
    bookCollections: BackupBookCollectionRow[];
    seriesConfigs?: BackupSeriesConfigRow[];
    metadataCache: BackupMetadataCacheRow[];
    appSettings: BackupAppSettingRow[];
    appUsers: BackupAppUserRow[];
    covers: BackupCoverEntry[];
  };
}

export interface BackupMetadata {
  filename: string;
  date: string;
  createdAt: string;
  sizeBytes: number;
  stats: BackupStats;
}

const BACKUP_FILENAME_REGEX = /^backup-(\d{4}-\d{2}-\d{2})\.json$/;
const SAFE_COVER_FILENAME_REGEX = /^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)$/i;
const VALID_BOOK_TYPES = new Set(['book', 'bd', 'manga', 'comic']);

export function formatBackupDate(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function isValidBackupFilename(filename: string): boolean {
  if (!filename || typeof filename !== 'string') return false;
  if (path.basename(filename) !== filename) return false;
  return BACKUP_FILENAME_REGEX.test(filename);
}

export function ensureBackupsDir(backupsDir: string): void {
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }
}

export function createBackupBundle(
  db: Database.Database,
  coversDir: string,
  now: Date = new Date(),
): BackupBundle {
  const collections = db
    .prepare(
      'SELECT id, name, location, name_key, location_key, created_at FROM collection ORDER BY id ASC',
    )
    .all() as BackupCollectionRow[];

  const books = db
    .prepare(
      `SELECT id, isbn13, title, subtitle, series, series_key, volume_number, publisher, cover_path,
              authors_json, authors_text, type, title_key, author_key, created_at
       FROM book
       ORDER BY id ASC`,
    )
    .all() as BackupBookRow[];

  const bookCollections = db
    .prepare(
      'SELECT book_id, collection_id FROM book_collection ORDER BY book_id ASC, collection_id ASC',
    )
    .all() as BackupBookCollectionRow[];

  const seriesConfigs = db
    .prepare(
      'SELECT series_key, series_name, target_volume_count, updated_at FROM series_config ORDER BY series_key ASC',
    )
    .all() as BackupSeriesConfigRow[];

  const metadataCache = db
    .prepare(
      'SELECT isbn13, payload_json, updated_at FROM metadata_cache ORDER BY isbn13 ASC',
    )
    .all() as BackupMetadataCacheRow[];

  const appSettings = db
    .prepare(
      'SELECT key, value, updated_at FROM app_setting ORDER BY key ASC',
    )
    .all() as BackupAppSettingRow[];

  const appUsers = db
    .prepare(
      `SELECT id, username, password_hash, can_add_books, can_edit_books,
              can_delete_books, can_manage_users, created_at
       FROM app_user
       ORDER BY id ASC`,
    )
    .all() as BackupAppUserRow[];

  const coverFiles = new Set<string>();
  for (const b of books) {
    if (b.cover_path) {
      const safe = path.basename(b.cover_path);
      if (SAFE_COVER_FILENAME_REGEX.test(safe)) {
        coverFiles.add(safe);
      }
    }
  }
  if (fs.existsSync(coversDir)) {
    try {
      for (const entry of fs.readdirSync(coversDir)) {
        if (SAFE_COVER_FILENAME_REGEX.test(entry)) {
          coverFiles.add(entry);
        }
      }
    } catch {
      // ignore directory read errors
    }
  }

  const covers: BackupCoverEntry[] = [];
  for (const filename of Array.from(coverFiles).sort()) {
    const fullPath = path.join(coversDir, filename);
    if (fs.existsSync(fullPath)) {
      try {
        const buf = fs.readFileSync(fullPath);
        covers.push({
          filename,
          contentBase64: buf.toString('base64'),
        });
      } catch {
        // ignore unreadable cover file
      }
    }
  }

  const date = formatBackupDate(now);
  const createdAt = now.toISOString();
  const stats: BackupStats = {
    booksCount: books.length,
    collectionsCount: collections.length,
    coversCount: covers.length,
    usersCount: appUsers.length,
  };

  return {
    format: 'book-collector-backup',
    version: 1,
    date,
    createdAt,
    stats,
    data: {
      collections,
      books,
      bookCollections,
      seriesConfigs,
      metadataCache,
      appSettings,
      appUsers,
      covers,
    },
  };
}

export function pruneOldBackups(
  backupsDir: string,
  maxDays = 7,
): string[] {
  if (!fs.existsSync(backupsDir)) return [];
  const entries = fs
    .readdirSync(backupsDir)
    .filter((f) => isValidBackupFilename(f))
    .sort((a, b) => b.localeCompare(a));

  const toDelete = entries.slice(Math.max(0, maxDays));
  const deleted: string[] = [];
  for (const filename of toDelete) {
    try {
      fs.unlinkSync(path.join(backupsDir, filename));
      deleted.push(filename);
    } catch {
      // ignore deletion error
    }
  }
  return deleted;
}

export function writeDailyBackup(
  db: Database.Database,
  coversDir: string,
  backupsDir: string,
  now: Date = new Date(),
  maxDays = 7,
): BackupMetadata {
  ensureBackupsDir(backupsDir);
  const bundle = createBackupBundle(db, coversDir, now);
  const filename = `backup-${bundle.date}.json`;
  const finalPath = path.join(backupsDir, filename);
  const tmpPath = path.join(
    backupsDir,
    `.${filename}.tmp-${process.pid}-${Date.now()}`,
  );

  const serialized = JSON.stringify(bundle, null, 2);
  fs.writeFileSync(tmpPath, serialized, 'utf-8');
  fs.renameSync(tmpPath, finalPath);

  pruneOldBackups(backupsDir, maxDays);

  const sizeBytes = Buffer.byteLength(serialized, 'utf-8');
  return {
    filename,
    date: bundle.date,
    createdAt: bundle.createdAt,
    sizeBytes,
    stats: bundle.stats,
  };
}

export function listBackups(backupsDir: string): BackupMetadata[] {
  if (!fs.existsSync(backupsDir)) return [];
  const files = fs
    .readdirSync(backupsDir)
    .filter((f) => isValidBackupFilename(f))
    .sort((a, b) => b.localeCompare(a));

  const results: BackupMetadata[] = [];
  for (const filename of files) {
    const fullPath = path.join(backupsDir, filename);
    try {
      const stat = fs.statSync(fullPath);
      const raw = fs.readFileSync(fullPath, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<BackupBundle>;
      const match = BACKUP_FILENAME_REGEX.exec(filename);
      const date = parsed.date ?? (match ? match[1] : '');
      const createdAt = parsed.createdAt ?? stat.mtime.toISOString();
      const stats: BackupStats = {
        booksCount: Number(
          parsed.stats?.booksCount ?? parsed.data?.books?.length ?? 0,
        ),
        collectionsCount: Number(
          parsed.stats?.collectionsCount ??
            parsed.data?.collections?.length ??
            0,
        ),
        coversCount: Number(
          parsed.stats?.coversCount ?? parsed.data?.covers?.length ?? 0,
        ),
        usersCount: Number(
          parsed.stats?.usersCount ?? parsed.data?.appUsers?.length ?? 0,
        ),
      };
      results.push({
        filename,
        date,
        createdAt,
        sizeBytes: stat.size,
        stats,
      });
    } catch {
      // skip unreadable or malformed file
    }
  }
  return results;
}

export function validateBackupBundle(
  rawInput: unknown,
): { ok: true; bundle: BackupBundle } | { ok: false; error: string } {
  if (!rawInput || typeof rawInput !== 'object') {
    return {
      ok: false,
      error: 'Fichier de sauvegarde invalide (objet JSON attendu).',
    };
  }

  const candidate = rawInput as Record<string, unknown>;
  if (candidate.format !== 'book-collector-backup' || candidate.version !== 1) {
    return {
      ok: false,
      error:
        'Format ou version de sauvegarde non reconnu (attendu : book-collector-backup v1).',
    };
  }

  if (!candidate.data || typeof candidate.data !== 'object') {
    return {
      ok: false,
      error: 'Fichier de sauvegarde incomplet : section "data" manquante.',
    };
  }

  const data = candidate.data as Record<string, unknown>;
  if (
    !Array.isArray(data.collections) ||
    !Array.isArray(data.books) ||
    !Array.isArray(data.bookCollections)
  ) {
    return {
      ok: false,
      error:
        'Fichier de sauvegarde invalide : les listes collections, books et bookCollections sont requises.',
    };
  }

  const collections: BackupCollectionRow[] = [];
  for (const c of data.collections) {
    if (
      !c ||
      typeof c !== 'object' ||
      !Number.isInteger((c as BackupCollectionRow).id) ||
      typeof (c as BackupCollectionRow).name !== 'string' ||
      typeof (c as BackupCollectionRow).name_key !== 'string' ||
      typeof (c as BackupCollectionRow).location_key !== 'string'
    ) {
      return {
        ok: false,
        error: 'Fichier de sauvegarde invalide : collection mal formée.',
      };
    }
    const row = c as BackupCollectionRow;
    collections.push({
      id: row.id,
      name: row.name,
      location: typeof row.location === 'string' ? row.location : '',
      name_key: row.name_key,
      location_key: row.location_key,
      created_at:
        typeof row.created_at === 'string'
          ? row.created_at
          : new Date().toISOString(),
    });
  }

  const books: BackupBookRow[] = [];
  for (const b of data.books) {
    if (
      !b ||
      typeof b !== 'object' ||
      !Number.isInteger((b as BackupBookRow).id) ||
      typeof (b as BackupBookRow).title !== 'string' ||
      typeof (b as BackupBookRow).authors_json !== 'string' ||
      typeof (b as BackupBookRow).authors_text !== 'string' ||
      typeof (b as BackupBookRow).type !== 'string' ||
      !VALID_BOOK_TYPES.has((b as BackupBookRow).type) ||
      typeof (b as BackupBookRow).title_key !== 'string' ||
      typeof (b as BackupBookRow).author_key !== 'string'
    ) {
      return {
        ok: false,
        error: 'Fichier de sauvegarde invalide : livre mal formé.',
      };
    }
    const row = b as BackupBookRow;
    const rawSeries =
      typeof row.series === 'string' && row.series.trim()
        ? row.series.trim()
        : null;
    const computedSeriesKey = rawSeries
      ? typeof row.series_key === 'string' && row.series_key.trim()
        ? row.series_key.trim()
        : normalizeSeriesKey(rawSeries)
      : null;
    const rawVol =
      typeof row.volume_number === 'number' &&
      Number.isInteger(row.volume_number) &&
      row.volume_number >= 1
        ? row.volume_number
        : null;
    books.push({
      id: row.id,
      isbn13: typeof row.isbn13 === 'string' ? row.isbn13 : null,
      title: row.title,
      subtitle: typeof row.subtitle === 'string' ? row.subtitle : null,
      series: rawSeries && computedSeriesKey ? rawSeries : null,
      series_key: rawSeries && computedSeriesKey ? computedSeriesKey : null,
      volume_number: rawVol,
      publisher: typeof row.publisher === 'string' ? row.publisher : null,
      cover_path:
        typeof row.cover_path === 'string'
          ? path.basename(row.cover_path)
          : null,
      authors_json: row.authors_json,
      authors_text: row.authors_text,
      type: row.type,
      title_key: row.title_key,
      author_key: row.author_key,
      created_at:
        typeof row.created_at === 'string'
          ? row.created_at
          : new Date().toISOString(),
    });
  }

  const bookCollections: BackupBookCollectionRow[] = [];
  for (const bc of data.bookCollections) {
    if (
      !bc ||
      typeof bc !== 'object' ||
      !Number.isInteger((bc as BackupBookCollectionRow).book_id) ||
      !Number.isInteger((bc as BackupBookCollectionRow).collection_id)
    ) {
      return {
        ok: false,
        error:
          'Fichier de sauvegarde invalide : liaison livre-collection mal formée.',
      };
    }
    const row = bc as BackupBookCollectionRow;
    bookCollections.push({
      book_id: row.book_id,
      collection_id: row.collection_id,
    });
  }

  const seriesConfigs: BackupSeriesConfigRow[] = [];
  if (Array.isArray(data.seriesConfigs)) {
    for (const sc of data.seriesConfigs) {
      if (
        sc &&
        typeof sc === 'object' &&
        typeof (sc as BackupSeriesConfigRow).series_key === 'string' &&
        typeof (sc as BackupSeriesConfigRow).series_name === 'string'
      ) {
        const row = sc as BackupSeriesConfigRow;
        const targetVol =
          typeof row.target_volume_count === 'number' &&
          Number.isInteger(row.target_volume_count) &&
          row.target_volume_count >= 1
            ? row.target_volume_count
            : null;
        seriesConfigs.push({
          series_key: row.series_key,
          series_name: row.series_name,
          target_volume_count: targetVol,
          updated_at:
            typeof row.updated_at === 'string'
              ? row.updated_at
              : new Date().toISOString(),
        });
      }
    }
  }

  const metadataCache: BackupMetadataCacheRow[] = [];
  if (Array.isArray(data.metadataCache)) {
    for (const mc of data.metadataCache) {
      if (
        mc &&
        typeof mc === 'object' &&
        typeof (mc as BackupMetadataCacheRow).isbn13 === 'string' &&
        typeof (mc as BackupMetadataCacheRow).payload_json === 'string'
      ) {
        const row = mc as BackupMetadataCacheRow;
        metadataCache.push({
          isbn13: row.isbn13,
          payload_json: row.payload_json,
          updated_at:
            typeof row.updated_at === 'string'
              ? row.updated_at
              : new Date().toISOString(),
        });
      }
    }
  }

  const appSettings: BackupAppSettingRow[] = [];
  if (Array.isArray(data.appSettings)) {
    for (const s of data.appSettings) {
      if (
        s &&
        typeof s === 'object' &&
        typeof (s as BackupAppSettingRow).key === 'string' &&
        typeof (s as BackupAppSettingRow).value === 'string'
      ) {
        const row = s as BackupAppSettingRow;
        appSettings.push({
          key: row.key,
          value: row.value,
          updated_at:
            typeof row.updated_at === 'string'
              ? row.updated_at
              : new Date().toISOString(),
        });
      }
    }
  }

  const appUsers: BackupAppUserRow[] = [];
  if (Array.isArray(data.appUsers)) {
    for (const u of data.appUsers) {
      if (
        !u ||
        typeof u !== 'object' ||
        !Number.isInteger((u as BackupAppUserRow).id) ||
        typeof (u as BackupAppUserRow).username !== 'string' ||
        typeof (u as BackupAppUserRow).password_hash !== 'string'
      ) {
        return {
          ok: false,
          error:
            'Fichier de sauvegarde invalide : compte utilisateur mal formé.',
        };
      }
      const row = u as BackupAppUserRow;
      appUsers.push({
        id: row.id,
        username: row.username,
        password_hash: row.password_hash,
        can_add_books: row.can_add_books ? 1 : 0,
        can_edit_books: row.can_edit_books ? 1 : 0,
        can_delete_books: row.can_delete_books ? 1 : 0,
        can_manage_users: row.can_manage_users ? 1 : 0,
        created_at:
          typeof row.created_at === 'string'
            ? row.created_at
            : new Date().toISOString(),
      });
    }
  }

  const covers: BackupCoverEntry[] = [];
  if (Array.isArray(data.covers)) {
    for (const cov of data.covers) {
      if (
        !cov ||
        typeof cov !== 'object' ||
        typeof (cov as BackupCoverEntry).filename !== 'string' ||
        typeof (cov as BackupCoverEntry).contentBase64 !== 'string'
      ) {
        return {
          ok: false,
          error:
            'Fichier de sauvegarde invalide : image de couverture mal formée.',
        };
      }
      const safeName = path.basename((cov as BackupCoverEntry).filename);
      if (!SAFE_COVER_FILENAME_REGEX.test(safeName)) {
        return {
          ok: false,
          error: `Nom de fichier de couverture invalide : ${safeName}`,
        };
      }
      covers.push({
        filename: safeName,
        contentBase64: (cov as BackupCoverEntry).contentBase64,
      });
    }
  }

  const date =
    typeof candidate.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(candidate.date)
      ? candidate.date
      : formatBackupDate();
  const createdAt =
    typeof candidate.createdAt === 'string'
      ? candidate.createdAt
      : new Date().toISOString();

  const stats: BackupStats = {
    booksCount: books.length,
    collectionsCount: collections.length,
    coversCount: covers.length,
    usersCount: appUsers.length,
  };

  return {
    ok: true,
    bundle: {
      format: 'book-collector-backup',
      version: 1,
      date,
      createdAt,
      stats,
      data: {
        collections,
        books,
        bookCollections,
        seriesConfigs,
        metadataCache,
        appSettings,
        appUsers,
        covers,
      },
    },
  };
}

export function restoreBackupBundle(
  db: Database.Database,
  coversDir: string,
  rawInput: unknown,
): { ok: true; stats: BackupStats } | { ok: false; error: string } {
  const validated = validateBackupBundle(rawInput);
  if (!validated.ok) {
    return validated;
  }

  const { bundle } = validated;

  const tx = db.transaction(() => {
    const existingSessions = db
      .prepare(
        'SELECT token, user_id, expires_at, created_at FROM user_session',
      )
      .all() as Array<{
      token: string;
      user_id: number;
      expires_at: string;
      created_at: string;
    }>;

    db.prepare('DELETE FROM book_collection').run();
    db.prepare('DELETE FROM book').run();
    db.prepare('DELETE FROM collection').run();
    db.prepare('DELETE FROM series_config').run();
    db.prepare('DELETE FROM metadata_cache').run();
    db.prepare('DELETE FROM app_setting').run();
    db.prepare('DELETE FROM user_session').run();
    db.prepare('DELETE FROM app_user').run();

    const insertCollection = db.prepare(
      `INSERT INTO collection (id, name, location, name_key, location_key, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    );
    for (const c of bundle.data.collections) {
      insertCollection.run(
        c.id,
        c.name,
        c.location,
        c.name_key,
        c.location_key,
        c.created_at,
      );
    }

    const insertBook = db.prepare(
      `INSERT INTO book (
         id, isbn13, title, subtitle, series, series_key, volume_number, publisher, cover_path,
         authors_json, authors_text, type, title_key, author_key, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const b of bundle.data.books) {
      insertBook.run(
        b.id,
        b.isbn13,
        b.title,
        b.subtitle,
        b.series ?? null,
        b.series_key ?? null,
        b.volume_number ?? null,
        b.publisher,
        b.cover_path,
        b.authors_json,
        b.authors_text,
        b.type,
        b.title_key,
        b.author_key,
        b.created_at,
      );
    }

    const insertBookCollection = db.prepare(
      'INSERT OR IGNORE INTO book_collection (book_id, collection_id) VALUES (?, ?)',
    );
    for (const bc of bundle.data.bookCollections) {
      insertBookCollection.run(bc.book_id, bc.collection_id);
    }

    const insertSeriesConfig = db.prepare(
      `INSERT OR REPLACE INTO series_config (series_key, series_name, target_volume_count, updated_at)
       VALUES (?, ?, ?, ?)`,
    );
    for (const sc of bundle.data.seriesConfigs ?? []) {
      insertSeriesConfig.run(
        sc.series_key,
        sc.series_name,
        sc.target_volume_count,
        sc.updated_at,
      );
    }

    const insertMetadata = db.prepare(
      'INSERT OR REPLACE INTO metadata_cache (isbn13, payload_json, updated_at) VALUES (?, ?, ?)',
    );
    for (const mc of bundle.data.metadataCache) {
      insertMetadata.run(mc.isbn13, mc.payload_json, mc.updated_at);
    }

    const insertSetting = db.prepare(
      'INSERT OR REPLACE INTO app_setting (key, value, updated_at) VALUES (?, ?, ?)',
    );
    for (const s of bundle.data.appSettings) {
      insertSetting.run(s.key, s.value, s.updated_at);
    }

    const insertUser = db.prepare(
      `INSERT INTO app_user (
         id, username, password_hash, can_add_books, can_edit_books,
         can_delete_books, can_manage_users, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const u of bundle.data.appUsers) {
      insertUser.run(
        u.id,
        u.username,
        u.password_hash,
        u.can_add_books ? 1 : 0,
        u.can_edit_books ? 1 : 0,
        u.can_delete_books ? 1 : 0,
        u.can_manage_users ? 1 : 0,
        u.created_at,
      );
    }

    if (bundle.data.appUsers.length === 0) {
      seedDefaultAdminUser(db);
    }

    const validUserIds = new Set(
      (
        db.prepare('SELECT id FROM app_user').all() as Array<{ id: number }>
      ).map((u) => u.id),
    );
    const insertSession = db.prepare(
      'INSERT OR IGNORE INTO user_session (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)',
    );
    for (const sess of existingSessions) {
      if (validUserIds.has(sess.user_id)) {
        insertSession.run(
          sess.token,
          sess.user_id,
          sess.expires_at,
          sess.created_at,
        );
      }
    }

    db.exec("INSERT INTO book_fts(book_fts) VALUES('rebuild');");
  });

  tx();

  ensureCoversDir(coversDir);
  try {
    for (const entry of fs.readdirSync(coversDir)) {
      if (SAFE_COVER_FILENAME_REGEX.test(entry)) {
        try {
          fs.unlinkSync(path.join(coversDir, entry));
        } catch {
          // ignore unlink error
        }
      }
    }
  } catch {
    // ignore readdir error
  }

  for (const cov of bundle.data.covers) {
    const safeName = path.basename(cov.filename);
    if (SAFE_COVER_FILENAME_REGEX.test(safeName)) {
      const buf = Buffer.from(cov.contentBase64, 'base64');
      fs.writeFileSync(path.join(coversDir, safeName), buf);
    }
  }

  return {
    ok: true,
    stats: {
      booksCount: bundle.data.books.length,
      collectionsCount: bundle.data.collections.length,
      coversCount: bundle.data.covers.length,
      usersCount:
        bundle.data.appUsers.length > 0 ? bundle.data.appUsers.length : 1,
    },
  };
}
