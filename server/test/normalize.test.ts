import { describe, it, expect } from 'vitest';
import {
  normalizeTitleKey,
  normalizeSingleAuthor,
  hasCommonAuthor,
  serializeAuthorKey,
  normalizeSeriesKey,
  parsePositiveVolumeNumber,
  inferSeriesAndVolume,
} from '../src/normalize.js';

describe('Title and author key normalization (5.1)', () => {
  it('ignores case, accents, punctuation, and leading articles', () => {
    expect(normalizeTitleKey('Astérix le Gaulois')).toBe(
      normalizeTitleKey('ASTERIX LE GAULOIS'),
    );
    expect(normalizeTitleKey("L'Étranger")).toBe(normalizeTitleKey('Étranger'));
    expect(normalizeTitleKey('Le Petit Prince !')).toBe(
      normalizeTitleKey('petit prince'),
    );
  });

  it('preserves volume/tome numbers and subtitles as distinct titles', () => {
    expect(normalizeTitleKey('One Piece, tome 1')).not.toBe(
      normalizeTitleKey('One Piece, tome 2'),
    );
    expect(normalizeTitleKey('One Piece', 'Tome 1')).toBe(
      normalizeTitleKey('One Piece, tome 01'),
    );
    expect(normalizeTitleKey('Batman', 'Cour des Hiboux')).not.toBe(
      normalizeTitleKey('Batman', 'La Nuit des Hiboux'),
    );
  });

  it('normalizes author names across orderings and roles', () => {
    expect(normalizeSingleAuthor('Albert Uderzo')).toBe(
      normalizeSingleAuthor('Uderzo, Albert'),
    );
    const key = serializeAuthorKey([
      { name: 'René Goscinny', role: 'writer' },
      { name: 'Albert Uderzo', role: 'illustrator' },
    ]);
    expect(
      hasCommonAuthor([{ name: 'Uderzo, Albert', role: 'author' }], key),
    ).toBe(true);
    expect(
      hasCommonAuthor([{ name: 'Eiichiro Oda', role: 'author' }], key),
    ).toBe(false);
  });

  it('normalizes series keys and infers series + volume number from titles and subtitles', () => {
    expect(normalizeSeriesKey('One Piece')).toBe('one piece');
    expect(normalizeSeriesKey('  ONE   PIECE ! ')).toBe('one piece');
    expect(normalizeSeriesKey('Astérix')).toBe('asterix');

    expect(parsePositiveVolumeNumber('012')).toBe(12);
    expect(parsePositiveVolumeNumber('Tome 3')).toBe(3);
    expect(parsePositiveVolumeNumber(0)).toBeNull();

    expect(inferSeriesAndVolume('One Piece - Tome 12', null)).toEqual({
      series: 'One Piece',
      volumeNumber: 12,
    });
    expect(inferSeriesAndVolume('One Piece', 'Tome 05 - Pour qui sonne le glas')).toEqual({
      series: 'One Piece',
      volumeNumber: 5,
    });
    expect(
      inferSeriesAndVolume("La serpe d'or", "Une aventure d'Astérix - Tome 2"),
    ).toEqual({
      series: "Une aventure d'Astérix",
      volumeNumber: 2,
    });
    expect(inferSeriesAndVolume('Naruto Vol. 42', null)).toEqual({
      series: 'Naruto',
      volumeNumber: 42,
    });
    expect(inferSeriesAndVolume('Blacksad #3', null)).toEqual({
      series: 'Blacksad',
      volumeNumber: 3,
    });
    expect(inferSeriesAndVolume("L'Étranger", null)).toEqual({
      series: null,
      volumeNumber: null,
    });
  });
});

