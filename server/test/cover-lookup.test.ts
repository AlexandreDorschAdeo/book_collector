import { describe, it, expect, vi, afterEach } from 'vitest';
import { buildApp } from '../src/app.js';
import { FetchLike } from '../src/metadata.js';

const SAMPLE_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

describe('POST /api/lookup-cover (cover-photo-lookup 1.1, 1.2, 1.3)', () => {
  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.OLLAMA_URL;
  });

  it('extracts text via local OCR by default, queries BnF/Google Books/Open Library, merges candidates, and checks duplicates', async () => {
    const bnfXml = `
      <srw:searchRetrieveResponse xmlns:mxc="info:lc/xmlns/marcxchange-v2">
        <mxc:record>
          <mxc:datafield tag="010" ind1=" " ind2=" ">
            <mxc:subfield code="a">978-2-205-05633-4</mxc:subfield>
          </mxc:datafield>
          <mxc:datafield tag="200" ind1="1" ind2=" ">
            <mxc:subfield code="a">Blacksad</mxc:subfield>
            <mxc:subfield code="e">Quelque part entre les ombres</mxc:subfield>
          </mxc:datafield>
          <mxc:datafield tag="214" ind1=" " ind2="0">
            <mxc:subfield code="c">Dargaud</mxc:subfield>
          </mxc:datafield>
          <mxc:datafield tag="700" ind1=" " ind2="1">
            <mxc:subfield code="a">Canales</mxc:subfield>
            <mxc:subfield code="b">Juan Díaz</mxc:subfield>
            <mxc:subfield code="4">690</mxc:subfield>
          </mxc:datafield>
          <mxc:datafield tag="701" ind1=" " ind2="1">
            <mxc:subfield code="a">Guarnido</mxc:subfield>
            <mxc:subfield code="b">Juanjo</mxc:subfield>
            <mxc:subfield code="4">440</mxc:subfield>
          </mxc:datafield>
        </mxc:record>
      </srw:searchRetrieveResponse>
    `;

    const mockFetch = vi.fn<FetchLike>(async (url) => {
      if (url.includes('catalogue.bnf.fr')) {
        return {
          ok: true,
          status: 200,
          text: async () => bnfXml,
          json: async () => ({}),
        };
      }
      if (url.includes('googleapis.com/books/v1/volumes')) {
        return {
          ok: true,
          status: 200,
          text: async () => '',
          json: async () => ({
            items: [
              {
                volumeInfo: {
                  title: 'Blacksad',
                  subtitle: 'Quelque part entre les ombres',
                  publisher: 'Dargaud',
                  authors: ['Juan Díaz Canales', 'Juanjo Guarnido'],
                  industryIdentifiers: [
                    { type: 'ISBN_13', identifier: '9782205056334' },
                  ],
                  imageLinks: {
                    thumbnail: 'https://books.google.com/blacksad1.jpg',
                  },
                },
              },
              {
                volumeInfo: {
                  title: 'Blacksad - Tome 2',
                  subtitle: 'Arctic-Nation',
                  publisher: 'Dargaud',
                  authors: ['Juan Díaz Canales', 'Juanjo Guarnido'],
                  industryIdentifiers: [
                    { type: 'ISBN_13', identifier: '9782205051995' },
                  ],
                },
              },
            ],
          }),
        };
      }
      return {
        ok: true,
        status: 200,
        text: async () => '',
        json: async () => ({ docs: [] }),
      };
    });

    const app = buildApp({
      fetchImpl: mockFetch,
      ocrFn: async () =>
        'CANALES • GUARNIDO\nBLACKSAD\nQuelque part entre les ombres\nDARGAUD',
    });

    // Seed a collection and an already-owned book with a different ISBN (other edition)
    const colRes = await app.inject({
      method: 'POST',
      url: '/api/collections',
      payload: { name: 'Salon', location: 'Maison' },
    });
    const col = colRes.json();

    await app.inject({
      method: 'POST',
      url: '/api/books',
      payload: {
        isbn: '9782205049657',
        title: 'Blacksad',
        subtitle: 'Quelque part entre les ombres',
        publisher: 'Dargaud',
        authors: [
          { name: 'Juan Díaz Canales', role: 'writer' },
          { name: 'Juanjo Guarnido', role: 'illustrator' },
        ],
        type: 'bd',
        collectionIds: [col.id],
      },
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/lookup-cover',
      payload: { imageDataUrl: SAMPLE_DATA_URL },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.clues.source).toBe('ocr');
    expect(body.clues.publisher).toBe('Dargaud');
    expect(body.candidates.length).toBeGreaterThanOrEqual(2);

    const best = body.bestMatch;
    expect(best.isbn13).toBe('9782205056334');
    expect(best.title).toBe('Blacksad');
    expect(best.subtitle).toBe('Quelque part entre les ombres');
    expect(best.publisher).toBe('Dargaud');
    expect(best.type).toBe('bd');
    expect(best.authors).toEqual([
      { name: 'Juan Díaz Canales', role: 'writer' },
      { name: 'Juanjo Guarnido', role: 'illustrator' },
    ]);
    // Should detect the other edition already in collection!
    expect(best.duplicates.otherEditions).toHaveLength(1);
    expect(best.duplicates.otherEditions[0].isbn13).toBe('9782205049657');

    await app.close();
  });

  it('uses Vision AI when GEMINI_API_KEY is configured and falls back to OCR on invalid image rejection', async () => {
    process.env.GEMINI_API_KEY = 'test-gemini-key';

    const mockFetch = vi.fn<FetchLike>(async (url) => {
      if (url.includes('generativelanguage.googleapis.com')) {
        return {
          ok: true,
          status: 200,
          text: async () => '',
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify({
                        title: 'Fables',
                        subtitle: 'Tome 8',
                        writer: 'Bill Willingham',
                        illustrator: 'Mark Buckingham',
                        publisher: 'Urban Comics',
                        isbn: null,
                        type: 'comic',
                        searchQuery: 'Fables Tome 8 Bill Willingham',
                      }),
                    },
                  ],
                },
              },
            ],
          }),
        };
      }
      return {
        ok: true,
        status: 200,
        text: async () => '',
        json: async () => ({ items: [], docs: [] }),
      };
    });

    const app = buildApp({ fetchImpl: mockFetch });

    const res = await app.inject({
      method: 'POST',
      url: '/api/lookup-cover',
      payload: { imageDataUrl: SAMPLE_DATA_URL },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.clues.source).toBe('vision');
    expect(body.bestMatch.title).toBe('Fables');
    expect(body.bestMatch.subtitle).toBe('Tome 8');
    expect(body.bestMatch.publisher).toBe('Urban Comics');
    expect(body.bestMatch.type).toBe('comic');
    expect(body.bestMatch.authors).toEqual([
      { name: 'Bill Willingham', role: 'writer' },
      { name: 'Mark Buckingham', role: 'illustrator' },
    ]);

    const badRes = await app.inject({
      method: 'POST',
      url: '/api/lookup-cover',
      payload: { imageDataUrl: 'not-a-data-url' },
    });
    expect(badRes.statusCode).toBe(400);

    await app.close();
  });

  it('persists Vision AI settings via GET/PUT /api/settings in SQLite and uses them during cover lookup', async () => {
    const mockFetch = vi.fn<FetchLike>(async (url) => {
      if (url.includes('generativelanguage.googleapis.com')) {
        return {
          ok: true,
          status: 200,
          text: async () => '',
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify({
                        title: 'The Homeland Directive',
                        subtitle: null,
                        writer: 'Robert Venditti',
                        illustrator: 'Mike Huddleston',
                        publisher: 'Ankama',
                        isbn: '9782365772259',
                        type: 'comic',
                        searchQuery: 'Homeland Directive Venditti',
                      }),
                    },
                  ],
                },
              },
            ],
          }),
        };
      }
      return {
        ok: true,
        status: 200,
        text: async () => '',
        json: async () => ({ items: [], docs: [] }),
      };
    });

    const app = buildApp({ fetchImpl: mockFetch });

    const putRes = await app.inject({
      method: 'PUT',
      url: '/api/settings',
      payload: {
        visionProvider: 'gemini',
        geminiApiKey: 'db-stored-gemini-key',
        geminiModel: 'gemini-2.0-flash',
      },
    });
    expect(putRes.statusCode).toBe(200);
    expect(putRes.json()).toEqual(
      expect.objectContaining({
        visionProvider: 'gemini',
        geminiApiKey: 'db-stored-gemini-key',
      }),
    );

    const getRes = await app.inject({
      method: 'GET',
      url: '/api/settings',
    });
    expect(getRes.statusCode).toBe(200);
    expect(getRes.json().geminiApiKey).toBe('db-stored-gemini-key');

    const lookupRes = await app.inject({
      method: 'POST',
      url: '/api/lookup-cover',
      payload: { imageDataUrl: SAMPLE_DATA_URL },
    });
    expect(lookupRes.statusCode).toBe(200);
    expect(lookupRes.json().clues.source).toBe('vision');
    expect(lookupRes.json().bestMatch.title).toBe('The Homeland Directive');

    await app.close();
  });
});
