import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildApp } from '../src/app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webDistDir = path.resolve(__dirname, '../../web/dist');

describe('End-to-End Integration & Static PWA Serving', () => {
  it('serves built frontend, PWA manifest/service worker, and executes full multi-collection scan & duplicate workflow', async () => {
    const app = buildApp({
      dbPath: ':memory:',
      staticDir: webDistDir,
      lookupFn: async (isbn13) => {
        if (isbn13 === '9782012101333') {
          return {
            title: 'Astérix',
            subtitle: 'Astérix le Gaulois',
            authors: [
              { name: 'René Goscinny', role: 'writer' },
              { name: 'Albert Uderzo', role: 'illustrator' },
            ],
          };
        }
        if (isbn13 === '9780306406157') {
          return {
            title: 'ASTERIX',
            subtitle: 'ASTERIX LE GAULOIS',
            authors: [{ name: 'Uderzo, Albert', role: 'illustrator' }],
          };
        }
        return null;
      },
    });

    // 1. Static files and PWA assets served
    const indexRes = await app.inject({ method: 'GET', url: '/' });
    expect(indexRes.statusCode).toBe(200);
    expect(indexRes.payload).toContain('Ma Bibliothèque');

    const manifestRes = await app.inject({
      method: 'GET',
      url: '/manifest.webmanifest',
    });
    expect(manifestRes.statusCode).toBe(200);
    expect(JSON.parse(manifestRes.payload).display).toBe('standalone');

    const swRes = await app.inject({ method: 'GET', url: '/sw.js' });
    expect(swRes.statusCode).toBe(200);

    // 2. Create two collections in different locations
    const colSalon = (
      await app.inject({
        method: 'POST',
        url: '/api/collections',
        payload: { name: 'BD', location: 'Salon' },
      })
    ).json();
    const colCampagne = (
      await app.inject({
        method: 'POST',
        url: '/api/collections',
        payload: { name: 'BD', location: 'Maison de campagne' },
      })
    ).json();

    // 3. Scan first book -> not owned yet -> add to Salon
    const lookup1 = (
      await app.inject({
        method: 'GET',
        url: '/api/lookup?isbn=9782012101333',
      })
    ).json();
    expect(lookup1.duplicates.sameIsbn).toHaveLength(0);
    expect(lookup1.duplicates.otherEditions).toHaveLength(0);

    await app.inject({
      method: 'POST',
      url: '/api/books',
      payload: {
        isbn: lookup1.isbn13,
        title: lookup1.metadata.title,
        subtitle: lookup1.metadata.subtitle,
        authors: lookup1.metadata.authors,
        type: 'bd',
        collectionIds: [colSalon.id],
      },
    });

    // 4. Rescan same ISBN -> flagged in sameIsbn with collection and location
    const lookup2 = (
      await app.inject({
        method: 'GET',
        url: '/api/lookup?isbn=9782012101333',
      })
    ).json();
    expect(lookup2.duplicates.sameIsbn).toHaveLength(1);
    expect(lookup2.duplicates.sameIsbn[0].collections[0]).toMatchObject({
      id: colSalon.id,
      name: 'BD',
      location: 'Salon',
    });

    // 5. Scan different edition (different ISBN, same title+subtitle & shared author) -> flagged in otherEditions
    const lookup3 = (
      await app.inject({
        method: 'GET',
        url: '/api/lookup?isbn=9780306406157',
      })
    ).json();
    expect(lookup3.duplicates.sameIsbn).toHaveLength(0);
    expect(lookup3.duplicates.otherEditions).toHaveLength(1);
    expect(lookup3.duplicates.otherEditions[0].isbn13).toBe('9782012101333');

    // Add second book to Maison de campagne
    await app.inject({
      method: 'POST',
      url: '/api/books',
      payload: {
        isbn: '9791032700006',
        title: 'Le Chat du Rabbin',
        subtitle: 'Tome 1 : La Bar-Mitsva',
        authors: [{ name: 'Joann Sfar', role: 'author' }],
        type: 'bd',
        collectionIds: [colCampagne.id],
      },
    });

    // 6. Search across all collections
    const searchRes = (
      await app.inject({
        method: 'GET',
        url: '/api/books?q=gaulois',
      })
    ).json();
    expect(searchRes).toHaveLength(1);
    expect(searchRes[0].collections[0].location).toBe('Salon');

    await app.close();
  });
});
