import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { openDatabase } from '../src/db.js';
import { createUser } from '../src/auth.js';
import { updateAppSettings, getAppSettings } from '../src/settings.js';
import { searchAndListBooks } from '../src/repository.js';
import { buildApp } from '../src/app.js';
import {
  createBackupBundle,
  listBackups,
  restoreBackupBundle,
  validateBackupBundle,
  writeDailyBackup,
} from '../src/backup.js';

describe('Backup & Restore core engine (backup.ts)', () => {
  let tmpDir: string;
  let coversDir: string;
  let backupsDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'book-collector-backup-'));
    coversDir = path.join(tmpDir, 'covers');
    backupsDir = path.join(tmpDir, 'backups');
    fs.mkdirSync(coversDir, { recursive: true });
    fs.mkdirSync(backupsDir, { recursive: true });
  });

  afterEach(() => {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup error
    }
  });

  it('serializes and restores books, collections, covers, users, settings, and rebuilds FTS5', () => {
    const db = openDatabase(':memory:');

    // 1. Seed collection, book, cover, user, setting
    const colInfo = db
      .prepare(
        `INSERT INTO collection (name, location, name_key, location_key)
         VALUES ('Salon', 'Rez-de-chaussée', 'salon', 'rez de chaussee')`,
      )
      .run();
    const colId = Number(colInfo.lastInsertRowid);

    const coverBytes = Buffer.from('fake-jpeg-binary-content', 'utf-8');
    const coverFilename = 'book-1-1700000000.jpg';
    fs.writeFileSync(path.join(coversDir, coverFilename), coverBytes);

    const bookInfo = db
      .prepare(
        `INSERT INTO book (
           isbn13, title, subtitle, publisher, cover_path,
           authors_json, authors_text, type, title_key, author_key
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        '9782070368228',
        'Dune',
        'Tome 1',
        'Pocket',
        coverFilename,
        JSON.stringify([{ name: 'Frank Herbert', role: 'author' }]),
        'Frank Herbert',
        'book',
        'dune::tome 1',
        'frank herbert',
      );
    const bookId = Number(bookInfo.lastInsertRowid);
    db.prepare(
      'INSERT INTO book_collection (book_id, collection_id) VALUES (?, ?)',
    ).run(bookId, colId);

    createUser(db, {
      username: 'marie',
      password: 'secret-password',
      canAddBooks: true,
      canEditBooks: true,
      canDeleteBooks: false,
      canManageUsers: false,
    });

    updateAppSettings(db, {
      visionProvider: 'gemini',
      geminiModel: 'gemini-2.0-flash',
      googleBooksApiKey: 'gb-key-123',
    });

    // 2. Create backup bundle
    const bundle = createBackupBundle(
      db,
      coversDir,
      new Date('2026-10-27T10:00:00.000Z'),
    );
    expect(bundle.format).toBe('book-collector-backup');
    expect(bundle.version).toBe(1);
    expect(bundle.date).toBe('2026-10-27');
    expect(bundle.stats).toEqual({
      booksCount: 1,
      collectionsCount: 1,
      coversCount: 1,
      usersCount: 2, // admin + marie
    });
    expect(bundle.data.covers).toEqual([
      {
        filename: coverFilename,
        contentBase64: coverBytes.toString('base64'),
      },
    ]);

    // 3. Wipe DB and covers completely (simulate destructive changes)
    db.prepare('DELETE FROM book_collection').run();
    db.prepare('DELETE FROM book').run();
    db.prepare('DELETE FROM collection').run();
    db.prepare('DELETE FROM app_setting').run();
    db.prepare("DELETE FROM app_user WHERE username = 'marie'").run();
    fs.unlinkSync(path.join(coversDir, coverFilename));
    fs.writeFileSync(
      path.join(coversDir, 'orphan-999.jpg'),
      Buffer.from('orphan'),
    );

    expect(searchAndListBooks(db, { q: 'Dune' })).toHaveLength(0);

    // 4. Restore from bundle
    const restoreRes = restoreBackupBundle(db, coversDir, bundle);
    expect(restoreRes.ok).toBe(true);

    // Verify FTS5 search works after restore
    const foundBooks = searchAndListBooks(db, { q: 'Dune' });
    expect(foundBooks).toHaveLength(1);
    expect(foundBooks[0].title).toBe('Dune');
    expect(foundBooks[0].collections[0].name).toBe('Salon');

    // Verify cover file restored and orphan cover removed
    expect(fs.existsSync(path.join(coversDir, coverFilename))).toBe(true);
    expect(
      fs.readFileSync(path.join(coversDir, coverFilename)).equals(coverBytes),
    ).toBe(true);
    expect(fs.existsSync(path.join(coversDir, 'orphan-999.jpg'))).toBe(false);

    // Verify user & settings restored
    const marieRow = db
      .prepare("SELECT username, can_edit_books FROM app_user WHERE username = 'marie'")
      .get() as { username: string; can_edit_books: number } | undefined;
    expect(marieRow).toEqual({ username: 'marie', can_edit_books: 1 });
    expect(getAppSettings(db).googleBooksApiKey).toBe('gb-key-123');

    db.close();
  });

  it('updates a single daily backup per date and prunes backups beyond 7 days', () => {
    const db = openDatabase(':memory:');

    // Write twice on the same day -> only 1 file for that date, updated in place
    writeDailyBackup(
      db,
      coversDir,
      backupsDir,
      new Date('2026-10-20T09:00:00.000Z'),
    );
    db.prepare(
      `INSERT INTO collection (name, location, name_key, location_key)
       VALUES ('Bureau', 'Étage', 'bureau', 'etage')`,
    ).run();
    const metaSameDay = writeDailyBackup(
      db,
      coversDir,
      backupsDir,
      new Date('2026-10-20T18:30:00.000Z'),
    );
    expect(metaSameDay.filename).toBe('backup-2026-10-20.json');
    expect(metaSameDay.stats.collectionsCount).toBe(1);
    expect(listBackups(backupsDir)).toHaveLength(1);

    // Write 7 more distinct days (total 8 distinct dates: Oct 20 .. Oct 27)
    const dates = [
      '2026-10-21',
      '2026-10-22',
      '2026-10-23',
      '2026-10-24',
      '2026-10-25',
      '2026-10-26',
      '2026-10-27',
    ];
    for (const d of dates) {
      writeDailyBackup(
        db,
        coversDir,
        backupsDir,
        new Date(`${d}T12:00:00.000Z`),
      );
    }

    const listed = listBackups(backupsDir);
    expect(listed).toHaveLength(7);
    expect(listed.map((b) => b.date)).toEqual([
      '2026-10-27',
      '2026-10-26',
      '2026-10-25',
      '2026-10-24',
      '2026-10-23',
      '2026-10-22',
      '2026-10-21',
    ]);
    expect(
      fs.existsSync(path.join(backupsDir, 'backup-2026-10-20.json')),
    ).toBe(false);

    db.close();
  });

  it('rejects invalid backup payloads without corrupting existing data', () => {
    const db = openDatabase(':memory:');
    db.prepare(
      `INSERT INTO collection (name, location, name_key, location_key)
       VALUES ('Intacte', '', 'intacte', '')`,
    ).run();

    expect(validateBackupBundle(null).ok).toBe(false);
    expect(validateBackupBundle({ format: 'wrong', version: 1 }).ok).toBe(false);

    const res = restoreBackupBundle(db, coversDir, {
      format: 'book-collector-backup',
      version: 1,
      data: { collections: 'invalid' },
    });
    expect(res.ok).toBe(false);

    const count = db
      .prepare('SELECT COUNT(*) AS cnt FROM collection')
      .get() as { cnt: number };
    expect(count.cnt).toBe(1);

    db.close();
  });

  it('triggers daily backups automatically on book add/modify, enforces 7-day retention, and supports API download/restore/upload', async () => {
    let currentNow = new Date('2026-10-20T10:00:00.000Z');
    const app = buildApp({
      dbPath: ':memory:',
      coversDir,
      backupsDir,
      nowFn: () => currentNow,
    });

    // 1. Creating a collection alone does NOT create a daily book backup
    const colRes = await app.inject({
      method: 'POST',
      url: '/api/collections',
      payload: { name: 'Salon', location: 'RDC' },
    });
    expect(colRes.statusCode).toBe(201);
    const colId = colRes.json().id;

    const initialBackups = await app.inject({
      method: 'GET',
      url: '/api/backups',
    });
    expect(initialBackups.statusCode).toBe(200);
    expect(initialBackups.json()).toHaveLength(0);

    // 2. Adding a book on 2026-10-20 automatically creates backup-2026-10-20.json
    const addRes = await app.inject({
      method: 'POST',
      url: '/api/books',
      payload: {
        isbn: '978-2-01-210133-3',
        title: 'Astérix',
        subtitle: 'Tome 1',
        authors: [{ name: 'René Goscinny', role: 'writer' }],
        type: 'bd',
        collectionIds: [colId],
      },
    });
    expect(addRes.statusCode).toBe(201);
    const bookId = addRes.json().id;

    let backupsList = (
      await app.inject({ method: 'GET', url: '/api/backups' })
    ).json();
    expect(backupsList).toHaveLength(1);
    expect(backupsList[0].filename).toBe('backup-2026-10-20.json');
    expect(backupsList[0].stats.booksCount).toBe(1);

    // 3. Modifying the book on the same day updates backup-2026-10-20.json without duplicating
    currentNow = new Date('2026-10-20T15:30:00.000Z');
    const updateRes = await app.inject({
      method: 'PUT',
      url: `/api/books/${bookId}`,
      payload: {
        title: 'Astérix le Gaulois',
        series: 'Astérix',
        volumeNumber: 1,
        publisher: 'Dargaud',
      },
    });
    expect(updateRes.statusCode).toBe(200);

    await app.inject({
      method: 'PUT',
      url: '/api/series/target',
      payload: { series: 'Astérix', targetVolumeCount: 40 },
    });

    backupsList = (
      await app.inject({ method: 'GET', url: '/api/backups' })
    ).json();
    expect(backupsList).toHaveLength(1);
    expect(backupsList[0].createdAt).toBe('2026-10-20T15:30:00.000Z');

    // 4. Download the backup file
    const downloadRes = await app.inject({
      method: 'GET',
      url: '/api/backups/backup-2026-10-20.json/download',
    });
    expect(downloadRes.statusCode).toBe(200);
    expect(downloadRes.headers['content-disposition']).toContain(
      'backup-2026-10-20.json',
    );
    const downloadedBundle = downloadRes.json();
    expect(downloadedBundle.data.books[0].title).toBe('Astérix le Gaulois');

    // 5. Modify book on a later day (2026-10-21) via bulk-update, then delete the book
    currentNow = new Date('2026-10-21T11:00:00.000Z');
    await app.inject({
      method: 'POST',
      url: '/api/books/bulk-update',
      payload: {
        bookIds: [bookId],
        fields: { publisher: 'Hachette' },
      },
    });

    await app.inject({
      method: 'DELETE',
      url: `/api/books/${bookId}`,
    });
    expect(
      (await app.inject({ method: 'GET', url: '/api/books' })).json(),
    ).toHaveLength(0);

    // 6. Restore from server backup-2026-10-20.json -> book is back with publisher 'Dargaud'
    const restoreRes = await app.inject({
      method: 'POST',
      url: '/api/backups/backup-2026-10-20.json/restore',
    });
    expect(restoreRes.statusCode).toBe(200);
    const booksAfterRestore = (
      await app.inject({ method: 'GET', url: '/api/books' })
    ).json();
    expect(booksAfterRestore).toHaveLength(1);
    expect(booksAfterRestore[0].publisher).toBe('Dargaud');
    expect(booksAfterRestore[0].series).toBe('Astérix');
    expect(booksAfterRestore[0].volumeNumber).toBe(1);

    const seriesAfterRestore = (
      await app.inject({ method: 'GET', url: '/api/series' })
    ).json();
    expect(seriesAfterRestore).toHaveLength(1);
    expect(seriesAfterRestore[0].targetVolumeCount).toBe(40);

    // 7. Restore via uploaded external backup bundle
    downloadedBundle.data.books[0].publisher = 'Éditions Albert René';
    const uploadRestoreRes = await app.inject({
      method: 'POST',
      url: '/api/backups/restore-upload',
      payload: downloadedBundle,
    });
    expect(uploadRestoreRes.statusCode).toBe(200);
    const booksAfterUpload = (
      await app.inject({ method: 'GET', url: '/api/books' })
    ).json();
    expect(booksAfterUpload[0].publisher).toBe('Éditions Albert René');

    await app.close();
  });
});
