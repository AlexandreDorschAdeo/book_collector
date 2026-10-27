import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { seedDefaultAdminUser } from './auth.js';

export type BookType = 'book' | 'bd' | 'manga' | 'comic';

export function openDatabase(dbPath = ':memory:'): Database.Database {
  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  runMigrations(db);
  return db;
}

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS collection (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT NOT NULL DEFAULT '',
      name_key TEXT NOT NULL,
      location_key TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(name_key, location_key)
    );

    CREATE TABLE IF NOT EXISTS book (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      isbn13 TEXT,
      title TEXT NOT NULL,
      subtitle TEXT,
      series TEXT,
      series_key TEXT,
      volume_number INTEGER,
      publisher TEXT,
      cover_path TEXT,
      authors_json TEXT NOT NULL,
      authors_text TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('book', 'bd', 'manga', 'comic')),
      title_key TEXT NOT NULL,
      author_key TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_book_isbn13 ON book(isbn13);
    CREATE INDEX IF NOT EXISTS idx_book_title_key ON book(title_key);

    CREATE TABLE IF NOT EXISTS series_config (
      series_key TEXT PRIMARY KEY,
      series_name TEXT NOT NULL,
      target_volume_count INTEGER,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS book_collection (
      book_id INTEGER NOT NULL REFERENCES book(id) ON DELETE CASCADE,
      collection_id INTEGER NOT NULL REFERENCES collection(id) ON DELETE CASCADE,
      PRIMARY KEY (book_id, collection_id)
    );

    CREATE INDEX IF NOT EXISTS idx_book_collection_cid ON book_collection(collection_id);

    CREATE TABLE IF NOT EXISTS metadata_cache (
      isbn13 TEXT PRIMARY KEY,
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS app_setting (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS app_user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      can_add_books INTEGER NOT NULL DEFAULT 0,
      can_edit_books INTEGER NOT NULL DEFAULT 0,
      can_delete_books INTEGER NOT NULL DEFAULT 0,
      can_manage_users INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_session (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_user_session_user_id ON user_session(user_id);
  `);

  seedDefaultAdminUser(db);

  const columns = db
    .prepare('PRAGMA table_info(book)')
    .all() as Array<{ name: string }>;
  const colNames = new Set(columns.map((c) => c.name));

  if (!colNames.has('publisher')) {
    db.exec('ALTER TABLE book ADD COLUMN publisher TEXT;');
  }
  if (!colNames.has('cover_path')) {
    db.exec('ALTER TABLE book ADD COLUMN cover_path TEXT;');
  }
  if (!colNames.has('series')) {
    db.exec('ALTER TABLE book ADD COLUMN series TEXT;');
  }
  if (!colNames.has('series_key')) {
    db.exec('ALTER TABLE book ADD COLUMN series_key TEXT;');
  }
  if (!colNames.has('volume_number')) {
    db.exec('ALTER TABLE book ADD COLUMN volume_number INTEGER;');
  }
  db.exec('CREATE INDEX IF NOT EXISTS idx_book_series_key ON book(series_key);');

  const ftsRow = db
    .prepare(
      "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'book_fts'",
    )
    .get() as { sql?: string } | undefined;

  if (
    !ftsRow?.sql ||
    !ftsRow.sql.includes('publisher') ||
    !ftsRow.sql.includes('series')
  ) {
    db.exec(`
      DROP TRIGGER IF EXISTS book_ai;
      DROP TRIGGER IF EXISTS book_ad;
      DROP TRIGGER IF EXISTS book_au;
      DROP TABLE IF EXISTS book_fts;

      CREATE VIRTUAL TABLE book_fts USING fts5(
        title,
        subtitle,
        series,
        authors_text,
        publisher,
        isbn13,
        content='book',
        content_rowid='id',
        tokenize='unicode61 remove_diacritics 2'
      );

      CREATE TRIGGER book_ai AFTER INSERT ON book BEGIN
        INSERT INTO book_fts(rowid, title, subtitle, series, authors_text, publisher, isbn13)
        VALUES (new.id, new.title, COALESCE(new.subtitle, ''), COALESCE(new.series, ''), new.authors_text, COALESCE(new.publisher, ''), COALESCE(new.isbn13, ''));
      END;

      CREATE TRIGGER book_ad AFTER DELETE ON book BEGIN
        INSERT INTO book_fts(book_fts, rowid, title, subtitle, series, authors_text, publisher, isbn13)
        VALUES ('delete', old.id, old.title, COALESCE(old.subtitle, ''), COALESCE(old.series, ''), old.authors_text, COALESCE(old.publisher, ''), COALESCE(old.isbn13, ''));
      END;

      CREATE TRIGGER book_au AFTER UPDATE ON book BEGIN
        INSERT INTO book_fts(book_fts, rowid, title, subtitle, series, authors_text, publisher, isbn13)
        VALUES ('delete', old.id, old.title, COALESCE(old.subtitle, ''), COALESCE(old.series, ''), old.authors_text, COALESCE(old.publisher, ''), COALESCE(old.isbn13, ''));
        INSERT INTO book_fts(rowid, title, subtitle, series, authors_text, publisher, isbn13)
        VALUES (new.id, new.title, COALESCE(new.subtitle, ''), COALESCE(new.series, ''), new.authors_text, COALESCE(new.publisher, ''), COALESCE(new.isbn13, ''));
      END;

      INSERT INTO book_fts(book_fts) VALUES('rebuild');
    `);
  }
}
