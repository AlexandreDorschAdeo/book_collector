import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';

describe('Collections API (2.2 - collection-management)', () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = buildApp({ dbPath: ':memory:' });
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates a collection with name and location and lists it with bookCount', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/collections',
      payload: { name: 'BD', location: 'Salon' },
    });
    expect(createRes.statusCode).toBe(201);
    expect(createRes.json()).toMatchObject({
      name: 'BD',
      location: 'Salon',
      bookCount: 0,
    });

    const listRes = await app.inject({
      method: 'GET',
      url: '/api/collections',
    });
    expect(listRes.statusCode).toBe(200);
    expect(listRes.json()).toHaveLength(1);
    expect(listRes.json()[0]).toMatchObject({
      name: 'BD',
      location: 'Salon',
      bookCount: 0,
    });
  });

  it('rejects creation without a name', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/collections',
      payload: { name: '   ', location: 'Salon' },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toContain('obligatoire');
  });

  it('rejects duplicate name + location case-insensitively', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/collections',
      payload: { name: 'BD', location: 'Salon' },
    });

    const dupRes = await app.inject({
      method: 'POST',
      url: '/api/collections',
      payload: { name: 'bd', location: 'salon' },
    });
    expect(dupRes.statusCode).toBe(409);
  });

  it('renames and updates location of a collection, and deletes an empty collection', async () => {
    const created = (
      await app.inject({
        method: 'POST',
        url: '/api/collections',
        payload: { name: 'Romans', location: 'Bureau' },
      })
    ).json();

    const updateRes = await app.inject({
      method: 'PUT',
      url: `/api/collections/${created.id}`,
      payload: { name: 'Romans SF', location: 'Chambre' },
    });
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.json()).toMatchObject({
      id: created.id,
      name: 'Romans SF',
      location: 'Chambre',
    });

    const delRes = await app.inject({
      method: 'DELETE',
      url: `/api/collections/${created.id}`,
    });
    expect(delRes.statusCode).toBe(204);

    const listRes = await app.inject({ method: 'GET', url: '/api/collections' });
    expect(listRes.json()).toHaveLength(0);
  });

  it('refuses deleting a collection with an orphan book, but allows deleting when all its books belong to another collection', async () => {
    const c1 = (
      await app.inject({
        method: 'POST',
        url: '/api/collections',
        payload: { name: 'Salon', location: 'Maison' },
      })
    ).json();
    const c2 = (
      await app.inject({
        method: 'POST',
        url: '/api/collections',
        payload: { name: 'Chambre', location: 'Maison' },
      })
    ).json();

    const book = (
      await app.inject({
        method: 'POST',
        url: '/api/books',
        payload: {
          title: 'Dune',
          authors: [{ name: 'Frank Herbert', role: 'author' }],
          type: 'book',
          collectionIds: [c1.id],
        },
      })
    ).json();

    // Refuse delete when book only belongs to c1
    const failDel = await app.inject({
      method: 'DELETE',
      url: `/api/collections/${c1.id}`,
    });
    expect(failDel.statusCode).toBe(409);

    // Attach book to c2 as well
    await app.inject({
      method: 'POST',
      url: `/api/books/${book.id}/collections`,
      payload: { collectionId: c2.id },
    });

    // Now deleting c1 succeeds and book remains in c2
    const okDel = await app.inject({
      method: 'DELETE',
      url: `/api/collections/${c1.id}`,
    });
    expect(okDel.statusCode).toBe(204);

    const remainingBook = (
      await app.inject({
        method: 'GET',
        url: `/api/books/${book.id}`,
      })
    ).json();
    expect(remainingBook.collections).toEqual([
      { id: c2.id, name: 'Chambre', location: 'Maison' },
    ]);
  });
});
