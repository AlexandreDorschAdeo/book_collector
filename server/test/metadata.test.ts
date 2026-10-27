import { describe, it, expect, vi } from 'vitest';
import { openDatabase } from '../src/db.js';
import { lookupIsbnMetadata, parseBnfUnimarcXml, FetchLike } from '../src/metadata.js';

describe('Metadata service (4.2 & enriched-isbn-and-covers 2.1, 2.2, 2.3)', () => {
  it('extracts title, subtitle, series/tome (461), publisher (210/214), ARK cover (003) and writer/illustrator roles from BnF SRU and caches in DB', async () => {
    const db = openDatabase(':memory:');
    const sampleXml = `
      <srw:searchRetrieveResponse xmlns:mxc="info:lc/xmlns/marcxchange-v2">
        <mxc:record>
          <mxc:controlfield tag="003">http://catalogue.bnf.fr/ark:/12148/cb34374123m</mxc:controlfield>
          <mxc:datafield tag="200" ind1="1" ind2=" ">
            <mxc:subfield code="a">La serpe d'or</mxc:subfield>
          </mxc:datafield>
          <mxc:datafield tag="214" ind1=" " ind2="0">
            <mxc:subfield code="c">[Dargaud]</mxc:subfield>
          </mxc:datafield>
          <mxc:datafield tag="461" ind1=" " ind2=" ">
            <mxc:subfield code="t">Une aventure d'Astérix</mxc:subfield>
            <mxc:subfield code="v">2</mxc:subfield>
          </mxc:datafield>
          <mxc:datafield tag="700" ind1=" " ind2="1">
            <mxc:subfield code="a">Goscinny</mxc:subfield>
            <mxc:subfield code="b">René</mxc:subfield>
            <mxc:subfield code="4">690</mxc:subfield>
          </mxc:datafield>
          <mxc:datafield tag="701" ind1=" " ind2="1">
            <mxc:subfield code="a">Uderzo</mxc:subfield>
            <mxc:subfield code="b">Albert</mxc:subfield>
            <mxc:subfield code="4">440</mxc:subfield>
          </mxc:datafield>
        </mxc:record>
      </srw:searchRetrieveResponse>
    `;

    const parsed = parseBnfUnimarcXml(sampleXml);
    expect(parsed).toEqual({
      title: "La serpe d'or",
      subtitle: "Une aventure d'Astérix - Tome 2",
      series: "Une aventure d'Astérix",
      volumeNumber: 2,
      publisher: 'Dargaud',
      coverUrl:
        'https://catalogue.bnf.fr/couverture?appName=NE&idArk=ark%3A%2F12148%2Fcb34374123m&couverture=1',
      authors: [
        { name: 'René Goscinny', role: 'writer' },
        { name: 'Albert Uderzo', role: 'illustrator' },
      ],
    });

    const mockFetch = vi.fn<FetchLike>(async (url) => {
      if (url.includes('catalogue.bnf.fr')) {
        return {
          ok: true,
          status: 200,
          text: async () => sampleXml,
          json: async () => ({}),
        };
      }
      return { ok: false, status: 404, text: async () => '', json: async () => ({}) };
    });

    const res = await lookupIsbnMetadata('9782012101333', db, mockFetch);
    expect(res).toEqual({
      isbn13: '9782012101333',
      title: "La serpe d'or",
      subtitle: "Une aventure d'Astérix - Tome 2",
      series: "Une aventure d'Astérix",
      volumeNumber: 2,
      publisher: 'Dargaud',
      coverUrl:
        'https://catalogue.bnf.fr/couverture?appName=NE&idArk=ark%3A%2F12148%2Fcb34374123m&couverture=1',
      authors: [
        { name: 'René Goscinny', role: 'writer' },
        { name: 'Albert Uderzo', role: 'illustrator' },
      ],
    });

    // Second call uses SQLite cache without network call
    mockFetch.mockClear();
    const cached = await lookupIsbnMetadata('9782012101333', db, mockFetch);
    expect(cached).toEqual(res);
    expect(mockFetch).not.toHaveBeenCalled();
    db.close();
  });

  it('merges complementary fields across SUDOC, Open Library and Google Books in parallel', async () => {
    const db = openDatabase(':memory:');
    const sudocXml = `
      <record>
        <datafield tag="200" ind1="1" ind2=" ">
          <subfield code="a">Blacksad</subfield>
          <subfield code="e">Quelque part entre les ombres</subfield>
        </datafield>
        <datafield tag="210" ind1=" " ind2=" ">
          <subfield code="c">Dargaud</subfield>
        </datafield>
        <datafield tag="700" ind1=" " ind2="1">
          <subfield code="a">Canales</subfield>
          <subfield code="b">Juan Díaz</subfield>
          <subfield code="4">690</subfield>
        </datafield>
        <datafield tag="701" ind1=" " ind2="1">
          <subfield code="a">Guarnido</subfield>
          <subfield code="b">Juanjo</subfield>
          <subfield code="4">440</subfield>
        </datafield>
      </record>
    `;

    const mockFetch = vi.fn<FetchLike>(async (url) => {
      if (url.includes('catalogue.bnf.fr')) {
        throw new Error('Network error');
      }
      if (url.includes('sudoc.fr/services/isbn2ppn')) {
        return {
          ok: true,
          status: 200,
          text: async () => '<sudoc><query><result><ppn>053456789</ppn></result></query></sudoc>',
          json: async () => ({}),
        };
      }
      if (url.includes('sudoc.fr/053456789.xml')) {
        return {
          ok: true,
          status: 200,
          text: async () => sudocXml,
          json: async () => ({}),
        };
      }
      if (url.includes('openlibrary.org/api/books')) {
        return {
          ok: true,
          status: 200,
          text: async () => '',
          json: async () => ({
            'ISBN:9780306406157': {
              title: 'Blacksad',
              authors: [{ name: 'Juan Diaz Canales' }],
              cover: { large: 'https://covers.openlibrary.org/b/id/999-L.jpg' },
            },
          }),
        };
      }
      if (url.includes('googleapis.com')) {
        return {
          ok: true,
          status: 200,
          text: async () => '',
          json: async () => ({
            items: [
              {
                volumeInfo: {
                  title: 'Blacksad',
                  publisher: 'Dargaud International',
                  authors: ['Juan Diaz Canales'],
                  imageLinks: {
                    thumbnail: 'http://books.google.com/books/content?id=123',
                  },
                },
              },
            ],
          }),
        };
      }
      return { ok: false, status: 404, text: async () => '', json: async () => ({}) };
    });

    const res = await lookupIsbnMetadata('9780306406157', db, mockFetch);
    expect(res).toEqual({
      isbn13: '9780306406157',
      title: 'Blacksad',
      subtitle: 'Quelque part entre les ombres',
      series: null,
      volumeNumber: null,
      publisher: 'Dargaud',
      coverUrl: 'https://covers.openlibrary.org/b/id/999-L.jpg',
      authors: [
        { name: 'Juan Díaz Canales', role: 'writer' },
        { name: 'Juanjo Guarnido', role: 'illustrator' },
      ],
    });
    db.close();
  });

  it('returns null when book is not found or all sources are down', async () => {
    const mockFetch: FetchLike = async () => ({
      ok: false,
      status: 503,
      text: async () => '',
      json: async () => ({}),
    });
    const res = await lookupIsbnMetadata('9782012101333', undefined, mockFetch);
    expect(res).toBeNull();
  });
});
