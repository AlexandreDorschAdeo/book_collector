import fs from 'node:fs';
import path from 'node:path';
import { FetchLike } from './metadata.js';

const MAX_COVER_BYTES = 5 * 1024 * 1024; // 5 MB
const MIN_REMOTE_COVER_BYTES = 200; // Filter out 1x1 pixel placeholder images

export function ensureCoversDir(coversDir: string): void {
  if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
  }
}

export function saveCoverFromDataUrl(
  coversDir: string,
  bookId: number,
  dataUrl: string,
): { ok: true; filename: string } | { ok: false; error: string } {
  const match = /^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=\s]+)$/i.exec(
    dataUrl.trim(),
  );
  if (!match) {
    return {
      ok: false,
      error: 'Format de couverture invalide (attendu : JPEG, PNG ou WebP en Data URL).',
    };
  }

  const rawMime = match[1].toLowerCase();
  const ext = rawMime === 'jpeg' || rawMime === 'jpg' ? 'jpg' : rawMime;
  const buffer = Buffer.from(match[2].replace(/\s+/g, ''), 'base64');

  if (buffer.length === 0) {
    return { ok: false, error: 'Image de couverture vide.' };
  }
  if (buffer.length > MAX_COVER_BYTES) {
    return {
      ok: false,
      error: 'Image de couverture trop volumineuse (maximum 5 Mo).',
    };
  }

  ensureCoversDir(coversDir);
  const filename = `book-${bookId}-${Date.now()}.${ext}`;
  fs.writeFileSync(path.join(coversDir, filename), buffer);
  return { ok: true, filename };
}

export async function saveCoverFromRemoteUrl(
  coversDir: string,
  bookId: number,
  remoteUrl: string,
  fetchImpl: FetchLike = fetch as unknown as FetchLike,
): Promise<string | null> {
  try {
    if (!/^https?:\/\//i.test(remoteUrl)) return null;
    const res = await fetchImpl(remoteUrl, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;

    let buffer: Buffer;
    if (typeof res.arrayBuffer === 'function') {
      const ab = await res.arrayBuffer();
      buffer = Buffer.from(ab);
    } else {
      const txt = await res.text();
      buffer = Buffer.from(txt, 'binary');
    }

    if (buffer.length < MIN_REMOTE_COVER_BYTES || buffer.length > MAX_COVER_BYTES) {
      return null;
    }

    const contentType = res.headers?.get?.('content-type')?.toLowerCase() ?? '';
    let ext = 'jpg';
    if (contentType.includes('png') || remoteUrl.toLowerCase().endsWith('.png')) {
      ext = 'png';
    } else if (
      contentType.includes('webp') ||
      remoteUrl.toLowerCase().endsWith('.webp')
    ) {
      ext = 'webp';
    }

    ensureCoversDir(coversDir);
    const filename = `book-${bookId}-${Date.now()}.${ext}`;
    fs.writeFileSync(path.join(coversDir, filename), buffer);
    return filename;
  } catch {
    return null;
  }
}

export function deleteCoverFile(
  coversDir: string,
  coverPath: string | null | undefined,
): void {
  if (!coverPath) return;
  const safeName = path.basename(coverPath);
  const fullPath = path.join(coversDir, safeName);
  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch {
    // Ignore file deletion errors
  }
}

export function getCoverContentType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}
