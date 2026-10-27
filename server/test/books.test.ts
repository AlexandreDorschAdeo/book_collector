import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('Books Catalog & FTS5 Search API (3.1, 3.2, 3.4 - book-catalog)', () => {
  let app: FastifyInstance;
  let salonId: number;
  let campagneId: number;

  beforeEach(async () => {
    app = buildApp({ dbPath: ':memory:' });
    salonId = (
      await app.inject({
        method: 'POST',
        url: '/api/collections',
        payload: { name: 'Bibliothèque principale', location: 'Salon' },
      })
    ).json().id;
    campagneId = (
      await app.inject({
        method: 'POST',
        url: '/api/collections',
        payload: { name: 'Étagère été', location: 'Maison de campagne' },
      })
    ).json().id;
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates a book with title, subtitle, writer and illustrator roles, and rejects missing required fields', async () => {
    const validRes = await app.inject({
      method: 'POST',
      url: '/api/books',
      payload: {
        isbn: '978-2-01-210133-3',
        title: 'Astérix',
        subtitle: 'Astérix le Gaulois',
        authors: [
          { name: 'René Goscinny', role: 'writer' },
          { name: 'Albert Uderzo', role: 'illustrator' },
        ],
        type: 'bd',
        collectionIds: [salonId],
      },
    });
    expect(validRes.statusCode).toBe(201);
    const created = validRes.json();
    expect(created).toMatchObject({
      isbn13: '9782012101333',
      title: 'Astérix',
      subtitle: 'Astérix le Gaulois',
      type: 'bd',
      authors: [
        { name: 'René Goscinny', role: 'writer' },
        { name: 'Albert Uderzo', role: 'illustrator' },
      ],
    });
    expect(created.collections).toHaveLength(1);

    const missingTitle = await app.inject({
      method: 'POST',
      url: '/api/books',
      payload: {
        title: '',
        authors: [{ name: 'Eiichiro Oda', role: 'author' }],
        type: 'manga',
        collectionIds: [salonId],
      },
    });
    expect(missingTitle.statusCode).toBe(400);

    const missingAuthor = await app.inject({
      method: 'POST',
      url: '/api/books',
      payload: {
        title: 'One Piece',
        authors: [],
        type: 'manga',
        collectionIds: [salonId],
      },
    });
    expect(missingAuthor.statusCode).toBe(400);

    const missingCollection = await app.inject({
      method: 'POST',
      url: '/api/books',
      payload: {
        title: 'One Piece',
        authors: [{ name: 'Eiichiro Oda', role: 'author' }],
        type: 'manga',
        collectionIds: [],
      },
    });
    expect(missingCollection.statusCode).toBe(400);
  });

  it('enforces belonging to >= 1 collection, supports multiple collections, moving, and deleting', async () => {
    const book = (
      await app.inject({
        method: 'POST',
        url: '/api/books',
        payload: {
          title: 'Watchmen',
          authors: [
            { name: 'Alan Moore', role: 'writer' },
            { name: 'Dave Gibbons', role: 'illustrator' },
          ],
          type: 'comic',
          collectionIds: [salonId],
        },
      })
    ).json();

    // Refuse removing its only collection
    const removeOnlyRes = await app.inject({
      method: 'DELETE',
      url: `/api/books/${book.id}/collections/${salonId}`,
    });
    expect(removeOnlyRes.statusCode).toBe(400);

    // Add to second collection
    const addSecondRes = await app.inject({
      method: 'POST',
      url: `/api/books/${book.id}/collections`,
      payload: { collectionId: campagneId },
    });
    expect(addSecondRes.statusCode).toBe(200);
    expect(addSecondRes.json().collections).toHaveLength(2);

    // Now removing from salonId succeeds
    const removeFirstRes = await app.inject({
      method: 'DELETE',
      url: `/api/books/${book.id}/collections/${salonId}`,
    });
    expect(removeFirstRes.statusCode).toBe(200);
    expect(removeFirstRes.json().collections.map((c: { id: number }) => c.id)).toEqual([
      campagneId,
    ]);

    // Move back from campagneId to salonId
    const moveRes = await app.inject({
      method: 'POST',
      url: `/api/books/${book.id}/move`,
      payload: { fromCollectionId: campagneId, toCollectionId: salonId },
    });
    expect(moveRes.statusCode).toBe(200);
    expect(moveRes.json().collections.map((c: { id: number }) => c.id)).toEqual([
      salonId,
    ]);

    // Delete book
    const delRes = await app.inject({
      method: 'DELETE',
      url: `/api/books/${book.id}`,
    });
    expect(delRes.statusCode).toBe(204);
  });

  it('lists books by collection with type filter and sort, and performs accent/case-insensitive FTS5 search across all collections without duplicates', async () => {
    const b1 = (
      await app.inject({
        method: 'POST',
        url: '/api/books',
        payload: {
          title: 'Astérix le Gaulois',
          subtitle: 'Tome 1',
          authors: [
            { name: 'René Goscinny', role: 'writer' },
            { name: 'Albert Uderzo', role: 'illustrator' },
          ],
          type: 'bd',
          collectionIds: [salonId, campagneId],
        },
      })
    ).json();

    await app.inject({
      method: 'POST',
      url: '/api/books',
      payload: {
        title: 'La Serpe d’or',
        subtitle: 'Tome 2',
        authors: [
          { name: 'René Goscinny', role: 'writer' },
          { name: 'Albert Uderzo', role: 'illustrator' },
        ],
        type: 'bd',
        collectionIds: [campagneId],
      },
    });

    await app.inject({
      method: 'POST',
      url: '/api/books',
      payload: {
        title: 'Akira',
        subtitle: 'Tome 1',
        authors: [{ name: 'Katsuhiro Otomo', role: 'author' }],
        type: 'manga',
        collectionIds: [salonId],
      },
    });

    // Filter collection salonId by type=bd
    const filteredRes = await app.inject({
      method: 'GET',
      url: `/api/collections/${salonId}/books?type=bd`,
    });
    expect(filteredRes.statusCode).toBe(200);
    expect(filteredRes.json()).toHaveLength(1);
    expect(filteredRes.json()[0].id).toBe(b1.id);

    // Search "asterix" (without accent) finds "Astérix le Gaulois" once with both collections
    const searchAsterix = await app.inject({
      method: 'GET',
      url: '/api/books?q=asterix',
    });
    expect(searchAsterix.statusCode).toBe(200);
    expect(searchAsterix.json()).toHaveLength(1);
    expect(searchAsterix.json()[0].title).toBe('Astérix le Gaulois');
    expect(searchAsterix.json()[0].collections).toHaveLength(2);

    // Search "uderzo" returns both BD books across both collections
    const searchUderzo = await app.inject({
      method: 'GET',
      url: '/api/books?q=uderzo',
    });
    expect(searchUderzo.statusCode).toBe(200);
    expect(searchUderzo.json()).toHaveLength(2);
  });

  it('stores publisher and local cover image (from Data URL or remote URL), serves cover, searches by publisher, and cleans up cover on removal', async () => {
    const sampleDataUrl =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

    const createRes = await app.inject({
      method: 'POST',
      url: '/api/books',
      payload: {
        isbn: '9782012101333',
        title: 'Astérix',
        subtitle: 'Astérix le Gaulois',
        publisher: 'Éditions Dargaud',
        coverDataUrl: sampleDataUrl,
        authors: [
          { name: 'René Goscinny', role: 'writer' },
          { name: 'Albert Uderzo', role: 'illustrator' },
        ],
        type: 'bd',
        collectionIds: [salonId],
      },
    });
    expect(createRes.statusCode).toBe(201);
    const created = createRes.json();
    expect(created.publisher).toBe('Éditions Dargaud');
    expect(created.coverUrl).toMatch(/^\/api\/covers\/book-\d+-\d+\.png$/);

    // Serve the saved cover image
    const coverRes = await app.inject({
      method: 'GET',
      url: created.coverUrl,
    });
    expect(coverRes.statusCode).toBe(200);
    expect(coverRes.headers['content-type']).toBe('image/png');

    // Search by publisher name (accent/case-insensitive)
    const searchPub = await app.inject({
      method: 'GET',
      url: '/api/books?q=dargaud',
    });
    expect(searchPub.statusCode).toBe(200);
    expect(searchPub.json()).toHaveLength(1);
    expect(searchPub.json()[0].id).toBe(created.id);

    // Remove cover via PUT removeCover: true
    const removeCoverRes = await app.inject({
      method: 'PUT',
      url: `/api/books/${created.id}`,
      payload: {
        removeCover: true,
        publisher: 'Hachette',
      },
    });
    expect(removeCoverRes.statusCode).toBe(200);
    expect(removeCoverRes.json().coverUrl).toBeNull();
    expect(removeCoverRes.json().publisher).toBe('Hachette');

    // Old cover file is deleted (404)
    const oldCoverRes = await app.inject({
      method: 'GET',
      url: created.coverUrl,
    });
    expect(oldCoverRes.statusCode).toBe(404);

    // Remote cover download via coverSourceUrl
    const appWithFetch = buildApp({
      dbPath: ':memory:',
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        text: async () => 'x'.repeat(400),
        json: async () => ({}),
        headers: { get: () => 'image/jpeg' },
      }),
    });
    const colRemote = (
      await appWithFetch.inject({
        method: 'POST',
        url: '/api/collections',
        payload: { name: 'Salon', location: 'Maison' },
      })
    ).json();
    const remoteBook = (
      await appWithFetch.inject({
        method: 'POST',
        url: '/api/books',
        payload: {
          title: 'Tintin au Tibet',
          publisher: 'Casterman',
          coverSourceUrl: 'https://covers.openlibrary.org/b/id/12345-L.jpg',
          authors: [{ name: 'Hergé', role: 'author' }],
          type: 'bd',
          collectionIds: [colRemote.id],
        },
      })
    ).json();
    expect(remoteBook.coverUrl).toMatch(/^\/api\/covers\/book-\d+-\d+\.jpg$/);
    await appWithFetch.close();
  });

  it('persists collections and books across server restarts on disk SQLite file (3.4)', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'book-collector-test-'));
    const dbFile = path.join(tmpDir, 'library.db');

    const app1 = buildApp({ dbPath: dbFile });
    const col = (
      await app1.inject({
        method: 'POST',
        url: '/api/collections',
        payload: { name: 'Salon', location: 'Appartement' },
      })
    ).json();
    await app1.inject({
      method: 'POST',
      url: '/api/books',
      payload: {
        title: 'Persistant',
        authors: [{ name: 'Auteur Test', role: 'author' }],
        type: 'book',
        collectionIds: [col.id],
      },
    });
    await app1.close();

    // Restart a new app instance pointing to the same SQLite volume file
    const app2 = buildApp({ dbPath: dbFile });
    const books = (
      await app2.inject({ method: 'GET', url: '/api/books' })
    ).json();
    expect(books).toHaveLength(1);
    expect(books[0].title).toBe('Persistant');
    await app2.close();

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('moves multiple books in bulk in a single transaction via POST /api/books/bulk-move', async () => {
    const b1 = (
      await app.inject({
        method: 'POST',
        url: '/api/books',
        payload: {
          title: 'Naruto Tome 1',
          authors: [{ name: 'Masashi Kishimoto', role: 'author' }],
          type: 'manga',
          collectionIds: [salonId],
        },
      })
    ).json();
    const b2 = (
      await app.inject({
        method: 'POST',
        url: '/api/books',
        payload: {
          title: 'Naruto Tome 2',
          authors: [{ name: 'Masashi Kishimoto', role: 'author' }],
          type: 'manga',
          collectionIds: [salonId],
        },
      })
    ).json();

    const emptyRes = await app.inject({
      method: 'POST',
      url: '/api/books/bulk-move',
      payload: { bookIds: [], toCollectionId: campagneId },
    });
    expect(emptyRes.statusCode).toBe(400);

    const moveRes = await app.inject({
      method: 'POST',
      url: '/api/books/bulk-move',
      payload: {
        bookIds: [b1.id, b2.id],
        fromCollectionId: salonId,
        toCollectionId: campagneId,
      },
    });
    expect(moveRes.statusCode).toBe(200);
    const body = moveRes.json();
    expect(body.updatedCount).toBe(2);
    expect(
      body.books.every((b: { collections: Array<{ id: number }> }) =>
        b.collections.map((c) => c.id).join(',') === String(campagneId),
      ),
    ).toBe(true);
  });

  it('updates selected fields across multiple books in bulk via POST /api/books/bulk-update and updates FTS index', async () => {
    const b1 = (
      await app.inject({
        method: 'POST',
        url: '/api/books',
        payload: {
          title: 'Dragon Ball Tome 1',
          subtitle: 'Ancienne édition',
          publisher: 'Ancien Éditeur',
          authors: [{ name: 'Auteur Inconnu', role: 'author' }],
          type: 'book',
          collectionIds: [salonId],
        },
      })
    ).json();
    const b2 = (
      await app.inject({
        method: 'POST',
        url: '/api/books',
        payload: {
          title: 'Dragon Ball Tome 2',
          subtitle: 'Tome 2',
          publisher: 'Autre Éditeur',
          authors: [{ name: 'Auteur Inconnu', role: 'author' }],
          type: 'book',
          collectionIds: [salonId],
        },
      })
    ).json();

    const noFieldsRes = await app.inject({
      method: 'POST',
      url: '/api/books/bulk-update',
      payload: { bookIds: [b1.id, b2.id], fields: {} },
    });
    expect(noFieldsRes.statusCode).toBe(400);

    const bulkRes = await app.inject({
      method: 'POST',
      url: '/api/books/bulk-update',
      payload: {
        bookIds: [b1.id, b2.id],
        fields: {
          type: 'manga',
          publisher: 'Glénat',
          authors: [{ name: 'Akira Toriyama', role: 'author' }],
        },
      },
    });
    expect(bulkRes.statusCode).toBe(200);
    const body = bulkRes.json();
    expect(body.updatedCount).toBe(2);
    expect(body.books[0]).toMatchObject({
      id: b1.id,
      title: 'Dragon Ball Tome 1',
      subtitle: 'Ancienne édition',
      publisher: 'Glénat',
      type: 'manga',
      authors: [{ name: 'Akira Toriyama', role: 'author' }],
    });
    expect(body.books[1]).toMatchObject({
      id: b2.id,
      title: 'Dragon Ball Tome 2',
      subtitle: 'Tome 2',
      publisher: 'Glénat',
      type: 'manga',
      authors: [{ name: 'Akira Toriyama', role: 'author' }],
    });

    // FTS search on the newly applied author and publisher finds both books
    const searchToriyama = await app.inject({
      method: 'GET',
      url: '/api/books?q=toriyama',
    });
    expect(searchToriyama.json()).toHaveLength(2);

    const searchGlenat = await app.inject({
      method: 'GET',
      url: '/api/books?q=glenat',
    });
    expect(searchGlenat.json()).toHaveLength(2);
  });
});
