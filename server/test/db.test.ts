import { describe, it, expect } from 'vitest';
import { openDatabase, runMigrations } from '../src/db.js';

describe('SQLite schema and migrations (2.1)', () => {
  it('creates collection, book, book_collection, metadata_cache and book_fts on an empty database', () => {
    const db = openDatabase(':memory:');
    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type IN ('table', 'view') ORDER BY name",
      )
      .all() as Array<{ name: string }>;
    const names = tables.map((t) => t.name);

    expect(names).toContain('collection');
    expect(names).toContain('book');
    expect(names).toContain('book_collection');
    expect(names).toContain('metadata_cache');
    expect(names).toContain('book_fts');

    const cols = db.prepare('PRAGMA table_info(book)').all() as Array<{
      name: string;
    }>;
    const colNames = cols.map((c) => c.name);
    expect(colNames).toContain('publisher');
    expect(colNames).toContain('cover_path');
    db.close();
  });

  it('migrates an existing v1 database by adding publisher and cover_path and rebuilding book_fts', () => {
    const db = openDatabase(':memory:');
    // Simulate a legacy v1 database without publisher and cover_path
    db.exec(`
      DROP TRIGGER IF EXISTS book_ai;
      DROP TRIGGER IF EXISTS book_ad;
      DROP TRIGGER IF EXISTS book_au;
      DROP TABLE IF EXISTS book_fts;
      DROP TABLE IF EXISTS book_collection;
      DROP TABLE IF EXISTS book;

      CREATE TABLE book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        isbn13 TEXT,
        title TEXT NOT NULL,
        subtitle TEXT,
        authors_json TEXT NOT NULL,
        authors_text TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('book', 'bd', 'manga', 'comic')),
        title_key TEXT NOT NULL,
        author_key TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE VIRTUAL TABLE book_fts USING fts5(
        title,
        subtitle,
        authors_text,
        isbn13,
        content='book',
        content_rowid='id',
        tokenize='unicode61 remove_diacritics 2'
      );

      INSERT INTO book (isbn13, title, subtitle, authors_json, authors_text, type, title_key, author_key)
      VALUES ('9782012101333', 'Astérix', 'Le Gaulois', '[]', 'Goscinny', 'bd', 'asterix le gaulois', 'goscinny');
    `);

    // Re-run migrations on top of legacy v1 schema
    runMigrations(db);

    const cols = db.prepare('PRAGMA table_info(book)').all() as Array<{
      name: string;
    }>;
    const colNames = cols.map((c) => c.name);
    expect(colNames).toContain('publisher');
    expect(colNames).toContain('cover_path');

    db.prepare('UPDATE book SET publisher = ? WHERE id = 1').run('Dargaud');
    const matched = db
      .prepare('SELECT rowid FROM book_fts WHERE book_fts MATCH ?')
      .all('"dargaud"*') as Array<{ rowid: number }>;
    expect(matched).toHaveLength(1);
    db.close();
  });
});
