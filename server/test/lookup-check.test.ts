import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';

describe('Lookup and Duplicate Detection API (4.3, 5.2)', () => {
  let app: FastifyInstance;
  let salonId: number;

  beforeEach(async () => {
    app = buildApp({
      dbPath: ':memory:',
      lookupFn: async (isbn13) => {
        if (isbn13 === '9782012101333') {
          return {
            title: 'Astérix le Gaulois',
            subtitle: null,
            authors: [
              { name: 'René Goscinny', role: 'writer' },
              { name: 'Albert Uderzo', role: 'illustrator' },
            ],
          };
        }
        return null;
      },
    });

    salonId = (
      await app.inject({
        method: 'POST',
        url: '/api/collections',
        payload: { name: 'BD', location: 'Salon' },
      })
    ).json().id;
  });

  afterEach(async () => {
    await app.close();
  });

  it('normalizes ISBN-10 on GET /api/lookup and returns metadata + duplicate check', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/lookup?isbn=2-01-210133-X',
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      isbn13: '9782012101333',
      found: true,
      metadata: {
        title: 'Astérix le Gaulois',
        subtitle: null,
        publisher: null,
        coverUrl: null,
        authors: [
          { name: 'René Goscinny', role: 'writer' },
          { name: 'Albert Uderzo', role: 'illustrator' },
        ],
      },
      duplicates: {
        sameIsbn: [],
        otherEditions: [],
      },
    });
  });

  it('rejects invalid ISBN on GET /api/lookup', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/lookup?isbn=9782012101334',
    });
    expect(res.statusCode).toBe(400);
  });

  it('detects sameIsbn, otherEditions, ignores different authors or different tomes, and supports check without ISBN', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/books',
      payload: {
        isbn: '9782012101333',
        title: 'Astérix le Gaulois',
        authors: [
          { name: 'René Goscinny', role: 'writer' },
          { name: 'Albert Uderzo', role: 'illustrator' },
        ],
        type: 'bd',
        collectionIds: [salonId],
      },
    });

    await app.inject({
      method: 'POST',
      url: '/api/books',
      payload: {
        isbn: '9782723488525',
        title: 'One Piece',
        subtitle: 'Tome 1',
        authors: [{ name: 'Eiichiro Oda', role: 'author' }],
        type: 'manga',
        collectionIds: [salonId],
      },
    });

    // 1. Exact same ISBN
    const sameRes = await app.inject({
      method: 'GET',
      url: '/api/check?isbn=9782012101333&title=ASTERIX%20LE%20GAULOIS&author=Albert%20Uderzo',
    });
    expect(sameRes.statusCode).toBe(200);
    expect(sameRes.json().sameIsbn).toHaveLength(1);
    expect(sameRes.json().sameIsbn[0].collections[0]).toMatchObject({
      name: 'BD',
      location: 'Salon',
    });
    expect(sameRes.json().otherEditions).toHaveLength(0);

    // 2. Different ISBN (another edition), typographic variant on title, shared author
    const otherEdRes = await app.inject({
      method: 'GET',
      url: '/api/check?isbn=9780306406157&title=ASTERIX%20LE%20GAULOIS&author=Uderzo,%20Albert',
    });
    expect(otherEdRes.statusCode).toBe(200);
    expect(otherEdRes.json().sameIsbn).toHaveLength(0);
    expect(otherEdRes.json().otherEditions).toHaveLength(1);
    expect(otherEdRes.json().otherEditions[0].title).toBe('Astérix le Gaulois');

    // 3. Same title, different author -> not flagged
    const diffAuthorRes = await app.inject({
      method: 'GET',
      url: '/api/check?isbn=9780306406157&title=Ast%C3%A9rix%20le%20Gaulois&author=Autre%20Auteur',
    });
    expect(diffAuthorRes.json().otherEditions).toHaveLength(0);

    // 4. Different tome (One Piece Tome 2 vs Tome 1) -> not flagged
    const diffTomeRes = await app.inject({
      method: 'GET',
      url: '/api/check?title=One%20Piece&subtitle=Tome%202&author=Eiichiro%20Oda',
    });
    expect(diffTomeRes.json().otherEditions).toHaveLength(0);

    // 5. Manual entry without ISBN for existing title+author -> flagged in otherEditions
    const manualRes = await app.inject({
      method: 'GET',
      url: '/api/check?title=One%20Piece,%20tome%201&author=Eiichiro%20Oda',
    });
    expect(manualRes.json().otherEditions).toHaveLength(1);
  });
});
