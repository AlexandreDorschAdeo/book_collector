import { describe, it, expect } from 'vitest';
import { normalizeIsbn } from '../src/isbn.js';

describe('ISBN validation and normalization (4.1)', () => {
  it('accepts valid ISBN-13 with or without hyphens', () => {
    expect(normalizeIsbn('978-2-01-210133-3')).toBe('9782012101333');
    expect(normalizeIsbn('9782012101333')).toBe('9782012101333');
    expect(normalizeIsbn('979 10 327 0000 6')).toBe('9791032700006');
  });

  it('converts valid ISBN-10 (including X check digit) to ISBN-13', () => {
    expect(normalizeIsbn('2-01-210133-X')).toBe('9782012101333');
    expect(normalizeIsbn('201210133x')).toBe('9782012101333');
    expect(normalizeIsbn('0-306-40615-2')).toBe('9780306406157');
  });

  it('rejects invalid check digits or malformed ISBNs', () => {
    expect(normalizeIsbn('9782012101334')).toBeNull();
    expect(normalizeIsbn('2012101335')).toBeNull();
    expect(normalizeIsbn('12345')).toBeNull();
    expect(normalizeIsbn('')).toBeNull();
    expect(normalizeIsbn('9771234567890')).toBeNull();
  });
});
