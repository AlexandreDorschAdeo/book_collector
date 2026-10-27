import { describe, it, expect } from 'vitest';
import {
  normalizeTitleKey,
  normalizeSingleAuthor,
  hasCommonAuthor,
  serializeAuthorKey,
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
});
