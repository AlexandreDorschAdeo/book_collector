export function normalizeIsbn(raw: string): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const cleaned = raw.replace(/[\s-]/g, '').toUpperCase();

  if (/^\d{9}[\dX]$/.test(cleaned)) {
    if (!isValidIsbn10(cleaned)) return null;
    const core = '978' + cleaned.slice(0, 9);
    const check = computeIsbn13CheckDigit(core);
    return core + check;
  }

  if (/^\d{13}$/.test(cleaned)) {
    if (!cleaned.startsWith('978') && !cleaned.startsWith('979')) {
      return null;
    }
    if (!isValidIsbn13(cleaned)) return null;
    return cleaned;
  }

  return null;
}

function isValidIsbn10(isbn10: string): boolean {
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const ch = isbn10[i];
    const val = i === 9 && ch === 'X' ? 10 : Number(ch);
    if (Number.isNaN(val)) return false;
    sum += (10 - i) * val;
  }
  return sum % 11 === 0;
}

function computeIsbn13CheckDigit(first12: string): string {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = Number(first12[i]);
    sum += digit * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return String(check);
}

function isValidIsbn13(isbn13: string): boolean {
  const expected = computeIsbn13CheckDigit(isbn13.slice(0, 12));
  return isbn13[12] === expected;
}

export function isbn13ToIsbn10(isbn13: string): string | null {
  if (!/^978\d{10}$/.test(isbn13)) return null;
  const core9 = isbn13.slice(3, 12);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += (10 - i) * Number(core9[i]);
  }
  const rem = (11 - (sum % 11)) % 11;
  const check = rem === 10 ? 'X' : String(rem);
  return core9 + check;
}

