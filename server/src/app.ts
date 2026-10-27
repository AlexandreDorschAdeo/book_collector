import Fastify, { FastifyInstance, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { openDatabase } from './db.js';
import {
  authenticateUser,
  changeUserPassword,
  createSession,
  createUser,
  CreateUserInput,
  deleteSession,
  deleteUser,
  extractSessionToken,
  formatSessionCookie,
  getUserById,
  getUserBySessionToken,
  isHttpsRequest,
  listUsers,
  LoginRateLimiter,
  updateUser,
  UpdateUserInput,
  UserDto,
} from './auth.js';
import { normalizeIsbn } from './isbn.js';
import { lookupIsbnMetadata, FetchLike } from './metadata.js';
import { lookupBookFromCoverImage } from './coverLookup.js';
import { AppSettings, getAppSettings, updateAppSettings } from './settings.js';
import {
  deleteCoverFile,
  getCoverContentType,
  saveCoverFromDataUrl,
  saveCoverFromRemoteUrl,
} from './covers.js';
import {
  BookInput,
  checkDuplicates,
  getBookById,
  listCollections,
  normalizeCollectionKey,
  searchAndListBooks,
  validateBookInput,
} from './repository.js';
import { BookAuthor } from './normalize.js';

export interface AppOptions {
  dbPath?: string;
  coversDir?: string;
  staticDir?: string;
  enforceAuth?: boolean;
  fetchImpl?: FetchLike;
  ocrFn?: (imageBuffer: Buffer) => Promise<string>;
  lookupFn?: (isbn13: string) => Promise<{
    title: string;
    subtitle: string | null;
    publisher?: string | null;
    coverUrl?: string | null;
    authors: Array<{ name: string; role: 'author' | 'writer' | 'illustrator' }>;
  } | null>;
}

declare module 'fastify' {
  interface FastifyRequest {
    currentUser?: UserDto;
  }
}

export function buildApp(options: AppOptions = {}): FastifyInstance {
  const app = Fastify({
    logger: false,
    bodyLimit: 10 * 1024 * 1024,
    trustProxy: true,
  });
  const enforceAuth =
    options.enforceAuth ?? process.env.NODE_ENV !== 'test';
  const loginRateLimiter = new LoginRateLimiter(10, 15 * 60 * 1000);
  const dbPath = options.dbPath ?? process.env.DB_PATH ?? ':memory:';
  const coversDir =
    options.coversDir ??
    process.env.COVERS_DIR ??
    (dbPath !== ':memory:'
      ? path.join(path.dirname(dbPath), 'covers')
      : path.join(os.tmpdir(), 'book-collector-covers-test'));
  const db = openDatabase(dbPath);

  app.addHook('onClose', async () => {
    db.close();
  });

  app.register(cors, { origin: true, credentials: true });

  app.addHook('onSend', async (_req, reply) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'SAMEORIGIN');
    reply.header('Referrer-Policy', 'same-origin');
  });

  app.addHook('preHandler', async (req, reply) => {
    const rawUrl = req.url.split('?')[0];
    if (!rawUrl.startsWith('/api/')) {
      return;
    }
    if (rawUrl === '/api/health' || rawUrl === '/api/auth/login') {
      return;
    }

    const token = extractSessionToken(req);
    let user = token ? getUserBySessionToken(db, token) : null;

    const isAuthOrUsersRoute =
      rawUrl.startsWith('/api/auth/') || rawUrl.startsWith('/api/users');

    if (!user && !enforceAuth && !token && !isAuthOrUsersRoute) {
      user = getUserById(db, 1);
    }

    if (!user) {
      return reply.code(401).send({
        error: 'Authentification requise. Veuillez vous connecter.',
      });
    }

    req.currentUser = user;

    const method = req.method.toUpperCase();

    // User & system management routes -> require canManageUsers
    if (rawUrl.startsWith('/api/users') || rawUrl.startsWith('/api/settings')) {
      if (!user.canManageUsers) {
        return reply.code(403).send({
          error:
            "Accès refusé : vous n'avez pas le droit de gérer les utilisateurs ou le paramétrage.",
        });
      }
      return;
    }

    // Adding books / ISBN lookup / cover lookup / creating collection -> require canAddBooks
    if (
      (method === 'POST' && rawUrl === '/api/books') ||
      rawUrl === '/api/lookup' ||
      rawUrl === '/api/lookup-cover' ||
      (method === 'POST' && rawUrl === '/api/collections')
    ) {
      if (!user.canAddBooks) {
        return reply.code(403).send({
          error: "Accès refusé : vous n'avez pas le droit d'ajouter des livres.",
        });
      }
      return;
    }

    // Attaching an existing book to a collection -> canAddBooks or canEditBooks
    if (method === 'POST' && /^\/api\/books\/\d+\/collections$/.test(rawUrl)) {
      if (!user.canAddBooks && !user.canEditBooks) {
        return reply.code(403).send({
          error:
            "Accès refusé : vous n'avez pas le droit d'ajouter ou modifier des livres.",
        });
      }
      return;
    }

    // Editing books / moving between collections / editing collections -> require canEditBooks
    if (
      (method === 'PUT' && /^\/api\/books\/\d+$/.test(rawUrl)) ||
      (method === 'POST' && /^\/api\/books\/\d+\/move$/.test(rawUrl)) ||
      (method === 'POST' && rawUrl === '/api/books/bulk-move') ||
      (method === 'POST' && rawUrl === '/api/books/bulk-update') ||
      (method === 'DELETE' &&
        /^\/api\/books\/\d+\/collections\/\d+$/.test(rawUrl)) ||
      (method === 'PUT' && /^\/api\/collections\/\d+$/.test(rawUrl))
    ) {
      if (!user.canEditBooks) {
        return reply.code(403).send({
          error:
            "Accès refusé : vous n'avez pas le droit de modifier des livres.",
        });
      }
      return;
    }

    // Deleting books or collections -> require canDeleteBooks
    if (
      method === 'DELETE' &&
      (/^\/api\/books\/\d+$/.test(rawUrl) ||
        /^\/api\/collections\/\d+$/.test(rawUrl))
    ) {
      if (!user.canDeleteBooks) {
        return reply.code(403).send({
          error:
            "Accès refusé : vous n'avez pas le droit de supprimer des livres.",
        });
      }
      return;
    }
  });

  app.get('/api/health', async () => {
    return { status: 'ok' };
  });

  // --- Authentication & Current User ---
  app.post<{ Body: { username?: string; password?: string } }>(
    '/api/auth/login',
    async (req, reply) => {
      const clientIp = req.ip || 'unknown';
      if (loginRateLimiter.isRateLimited(clientIp)) {
        return reply.code(429).send({
          error:
            'Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.',
        });
      }

      const username = (req.body?.username ?? '').trim();
      const password = req.body?.password ?? '';
      const user = authenticateUser(db, username, password);
      if (!user) {
        loginRateLimiter.recordFailure(clientIp);
        return reply.code(401).send({
          error: 'Identifiant ou mot de passe incorrect.',
        });
      }

      loginRateLimiter.reset(clientIp);
      const token = createSession(db, user.id);
      reply.header(
        'Set-Cookie',
        formatSessionCookie(token, isHttpsRequest(req)),
      );
      return reply.send({ token, user });
    },
  );

  app.post('/api/auth/logout', async (req, reply) => {
    const token = extractSessionToken(req);
    if (token) {
      deleteSession(db, token);
    }
    reply.header(
      'Set-Cookie',
      formatSessionCookie('', isHttpsRequest(req), 0),
    );
    return reply.code(204).send();
  });

  app.get('/api/auth/me', async (req: FastifyRequest) => {
    return req.currentUser!;
  });

  app.put<{ Body: { currentPassword?: string; newPassword?: string } }>(
    '/api/auth/password',
    async (req, reply) => {
      const res = changeUserPassword(
        db,
        req.currentUser!.id,
        req.body?.currentPassword ?? '',
        req.body?.newPassword ?? '',
      );
      if (!res.ok) {
        return reply.code(res.status).send({ error: res.error });
      }
      return reply.send({ status: 'ok' });
    },
  );

  // --- Users Management (requires canManageUsers) ---
  app.get('/api/users', async () => {
    return listUsers(db);
  });

  app.post<{ Body: CreateUserInput }>('/api/users', async (req, reply) => {
    const res = createUser(db, req.body ?? {});
    if (!res.ok) {
      return reply.code(res.status).send({ error: res.error });
    }
    return reply.code(201).send(res.user);
  });

  app.put<{ Params: { id: string }; Body: UpdateUserInput }>(
    '/api/users/:id',
    async (req, reply) => {
      const res = updateUser(db, Number(req.params.id), req.body ?? {});
      if (!res.ok) {
        return reply.code(res.status).send({ error: res.error });
      }
      return reply.send(res.user);
    },
  );

  app.delete<{ Params: { id: string } }>(
    '/api/users/:id',
    async (req, reply) => {
      const res = deleteUser(db, Number(req.params.id));
      if (!res.ok) {
        return reply.code(res.status).send({ error: res.error });
      }
      return reply.code(204).send();
    },
  );

  // --- Application Settings (Vision AI & API keys) ---
  app.get('/api/settings', async () => {
    return getAppSettings(db);
  });

  app.put<{ Body: Partial<AppSettings> }>('/api/settings', async (req) => {
    return updateAppSettings(db, req.body ?? {});
  });

  // --- Collections CRUD ---
  app.get('/api/collections', async () => {
    return listCollections(db);
  });

  app.post<{ Body: { name?: string; location?: string } }>(
    '/api/collections',
    async (req, reply) => {
      const name = (req.body?.name ?? '').trim();
      const location = (req.body?.location ?? '').trim();

      if (!name) {
        return reply
          .code(400)
          .send({ error: 'Le nom de la collection est obligatoire.' });
      }

      const nameKey = normalizeCollectionKey(name);
      const locationKey = normalizeCollectionKey(location);

      const existing = db
        .prepare(
          'SELECT id FROM collection WHERE name_key = ? AND location_key = ?',
        )
        .get(nameKey, locationKey);

      if (existing) {
        return reply.code(409).send({
          error:
            'Une collection portant ce nom à ce lieu existe déjà.',
        });
      }

      const info = db
        .prepare(
          'INSERT INTO collection (name, location, name_key, location_key) VALUES (?, ?, ?, ?)',
        )
        .run(name, location, nameKey, locationKey);

      const id = Number(info.lastInsertRowid);
      const created = listCollections(db).find((c) => c.id === id)!;
      return reply.code(201).send(created);
    },
  );

  app.put<{
    Params: { id: string };
    Body: { name?: string; location?: string };
  }>('/api/collections/:id', async (req, reply) => {
    const id = Number(req.params.id);
    const current = db
      .prepare('SELECT id FROM collection WHERE id = ?')
      .get(id);
    if (!current) {
      return reply.code(404).send({ error: 'Collection introuvable.' });
    }

    const name = (req.body?.name ?? '').trim();
    const location = (req.body?.location ?? '').trim();
    if (!name) {
      return reply
        .code(400)
        .send({ error: 'Le nom de la collection est obligatoire.' });
    }

    const nameKey = normalizeCollectionKey(name);
    const locationKey = normalizeCollectionKey(location);

    const duplicate = db
      .prepare(
        'SELECT id FROM collection WHERE name_key = ? AND location_key = ? AND id != ?',
      )
      .get(nameKey, locationKey, id);

    if (duplicate) {
      return reply.code(409).send({
        error: 'Une collection portant ce nom à ce lieu existe déjà.',
      });
    }

    db.prepare(
      'UPDATE collection SET name = ?, location = ?, name_key = ?, location_key = ? WHERE id = ?',
    ).run(name, location, nameKey, locationKey, id);

    const updated = listCollections(db).find((c) => c.id === id)!;
    return reply.send(updated);
  });

  app.delete<{ Params: { id: string } }>(
    '/api/collections/:id',
    async (req, reply) => {
      const id = Number(req.params.id);
      const current = db
        .prepare('SELECT id FROM collection WHERE id = ?')
        .get(id);
      if (!current) {
        return reply.code(404).send({ error: 'Collection introuvable.' });
      }

      const tx = db.transaction(() => {
        const orphans = db
          .prepare(
            `SELECT b.id, b.title
             FROM book b
             JOIN book_collection bc ON bc.book_id = b.id
             WHERE bc.collection_id = ?
               AND (SELECT COUNT(*) FROM book_collection bc2 WHERE bc2.book_id = b.id) = 1`,
          )
          .all(id) as Array<{ id: number; title: string }>;

        if (orphans.length > 0) {
          return { blocked: true, orphans };
        }

        db.prepare('DELETE FROM collection WHERE id = ?').run(id);
        return { blocked: false, orphans: [] };
      });

      const outcome = tx();
      if (outcome.blocked) {
        return reply.code(409).send({
          error:
            "Impossible de supprimer cette collection : certains livres n'appartiennent à aucune autre collection. Veuillez d'abord les déplacer vers une autre collection ou les supprimer.",
          orphanBooks: outcome.orphans,
        });
      }

      return reply.code(204).send();
    },
  );

  // --- Books CRUD & Search ---
  app.get<{
    Querystring: {
      collectionId?: string;
      type?: string;
      sort?: string;
      q?: string;
    };
  }>('/api/books', async (req) => {
    const collectionId = req.query.collectionId
      ? Number(req.query.collectionId)
      : undefined;
    return searchAndListBooks(db, {
      collectionId,
      type: req.query.type,
      sort: req.query.sort,
      q: req.query.q,
    });
  });

  app.get<{
    Params: { id: string };
    Querystring: { type?: string; sort?: string; q?: string };
  }>('/api/collections/:id/books', async (req, reply) => {
    const collectionId = Number(req.params.id);
    const exists = db
      .prepare('SELECT id FROM collection WHERE id = ?')
      .get(collectionId);
    if (!exists) {
      return reply.code(404).send({ error: 'Collection introuvable.' });
    }
    return searchAndListBooks(db, {
      collectionId,
      type: req.query.type,
      sort: req.query.sort,
      q: req.query.q,
    });
  });

  app.get<{ Params: { id: string } }>('/api/books/:id', async (req, reply) => {
    const book = getBookById(db, Number(req.params.id));
    if (!book) {
      return reply.code(404).send({ error: 'Livre introuvable.' });
    }
    return book;
  });

  app.post<{ Body: BookInput }>('/api/books', async (req, reply) => {
    const validated = validateBookInput(db, req.body ?? {});
    if (!validated.ok) {
      return reply.code(validated.status).send({ error: validated.error });
    }

    if (
      req.body?.coverDataUrl !== undefined &&
      req.body.coverDataUrl !== null &&
      String(req.body.coverDataUrl).trim() !== ''
    ) {
      const checkMatch =
        /^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=\s]+)$/i.exec(
          String(req.body.coverDataUrl).trim(),
        );
      if (!checkMatch) {
        return reply.code(400).send({
          error:
            'Format de couverture invalide (attendu : JPEG, PNG ou WebP en Data URL).',
        });
      }
    }

    const { data } = validated;
    const tx = db.transaction(() => {
      const info = db
        .prepare(
          `INSERT INTO book (isbn13, title, subtitle, publisher, authors_json, authors_text, type, title_key, author_key)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          data.isbn13,
          data.title,
          data.subtitle,
          data.publisher,
          JSON.stringify(data.authors),
          data.authorsText,
          data.type,
          data.titleKey,
          data.authorKey,
        );
      const bookId = Number(info.lastInsertRowid);
      const insertCol = db.prepare(
        'INSERT INTO book_collection (book_id, collection_id) VALUES (?, ?)',
      );
      for (const cid of data.collectionIds) {
        insertCol.run(bookId, cid);
      }
      return bookId;
    });

    const bookId = tx();

    let coverFilename: string | null = null;
    if (req.body?.coverDataUrl && String(req.body.coverDataUrl).trim() !== '') {
      const saved = saveCoverFromDataUrl(
        coversDir,
        bookId,
        String(req.body.coverDataUrl),
      );
      if (saved.ok) {
        coverFilename = saved.filename;
      }
    } else if (
      req.body?.coverSourceUrl &&
      String(req.body.coverSourceUrl).trim() !== ''
    ) {
      coverFilename = await saveCoverFromRemoteUrl(
        coversDir,
        bookId,
        String(req.body.coverSourceUrl).trim(),
        options.fetchImpl,
      );
    }

    if (coverFilename) {
      db.prepare('UPDATE book SET cover_path = ? WHERE id = ?').run(
        coverFilename,
        bookId,
      );
    }

    return reply.code(201).send(getBookById(db, bookId));
  });

  app.put<{ Params: { id: string }; Body: BookInput }>(
    '/api/books/:id',
    async (req, reply) => {
      const id = Number(req.params.id);
      const existingRow = db
        .prepare('SELECT cover_path FROM book WHERE id = ?')
        .get(id) as { cover_path: string | null } | undefined;
      const existing = getBookById(db, id);
      if (!existing || !existingRow) {
        return reply.code(404).send({ error: 'Livre introuvable.' });
      }

      const mergedInput: BookInput = {
        isbn: req.body?.isbn !== undefined ? req.body.isbn : existing.isbn13,
        title: req.body?.title !== undefined ? req.body.title : existing.title,
        subtitle:
          req.body?.subtitle !== undefined
            ? req.body.subtitle
            : existing.subtitle,
        publisher:
          req.body?.publisher !== undefined
            ? req.body.publisher
            : existing.publisher,
        authors:
          req.body?.authors !== undefined ? req.body.authors : existing.authors,
        type: req.body?.type !== undefined ? req.body.type : existing.type,
        collectionIds:
          req.body?.collectionIds !== undefined
            ? req.body.collectionIds
            : existing.collections.map((c) => c.id),
      };

      const validated = validateBookInput(db, mergedInput);
      if (!validated.ok) {
        return reply.code(validated.status).send({ error: validated.error });
      }

      let nextCoverPath = existingRow.cover_path;
      if (req.body?.removeCover) {
        deleteCoverFile(coversDir, existingRow.cover_path);
        nextCoverPath = null;
      } else if (
        req.body?.coverDataUrl &&
        String(req.body.coverDataUrl).trim() !== ''
      ) {
        const saved = saveCoverFromDataUrl(
          coversDir,
          id,
          String(req.body.coverDataUrl),
        );
        if (!saved.ok) {
          return reply.code(400).send({ error: saved.error });
        }
        deleteCoverFile(coversDir, existingRow.cover_path);
        nextCoverPath = saved.filename;
      } else if (
        req.body?.coverSourceUrl &&
        String(req.body.coverSourceUrl).trim() !== ''
      ) {
        const downloaded = await saveCoverFromRemoteUrl(
          coversDir,
          id,
          String(req.body.coverSourceUrl).trim(),
          options.fetchImpl,
        );
        if (downloaded) {
          deleteCoverFile(coversDir, existingRow.cover_path);
          nextCoverPath = downloaded;
        }
      }

      const { data } = validated;
      const tx = db.transaction(() => {
        db.prepare(
          `UPDATE book
           SET isbn13 = ?, title = ?, subtitle = ?, publisher = ?, cover_path = ?,
               authors_json = ?, authors_text = ?, type = ?, title_key = ?, author_key = ?
           WHERE id = ?`,
        ).run(
          data.isbn13,
          data.title,
          data.subtitle,
          data.publisher,
          nextCoverPath,
          JSON.stringify(data.authors),
          data.authorsText,
          data.type,
          data.titleKey,
          data.authorKey,
          id,
        );

        db.prepare('DELETE FROM book_collection WHERE book_id = ?').run(id);
        const insertCol = db.prepare(
          'INSERT INTO book_collection (book_id, collection_id) VALUES (?, ?)',
        );
        for (const cid of data.collectionIds) {
          insertCol.run(id, cid);
        }
      });

      tx();
      return reply.send(getBookById(db, id));
    },
  );

  // Add an existing book to another collection without duplicating the book
  app.post<{ Params: { id: string }; Body: { collectionId?: number } }>(
    '/api/books/:id/collections',
    async (req, reply) => {
      const bookId = Number(req.params.id);
      const collectionId = Number(req.body?.collectionId);
      const book = getBookById(db, bookId);
      if (!book) {
        return reply.code(404).send({ error: 'Livre introuvable.' });
      }
      const col = db
        .prepare('SELECT id FROM collection WHERE id = ?')
        .get(collectionId);
      if (!col) {
        return reply.code(400).send({ error: 'Collection introuvable.' });
      }

      db.prepare(
        'INSERT OR IGNORE INTO book_collection (book_id, collection_id) VALUES (?, ?)',
      ).run(bookId, collectionId);

      return reply.send(getBookById(db, bookId));
    },
  );

  // Remove a book from a collection (enforcing >= 1 collection)
  app.delete<{ Params: { id: string; collectionId: string } }>(
    '/api/books/:id/collections/:collectionId',
    async (req, reply) => {
      const bookId = Number(req.params.id);
      const collectionId = Number(req.params.collectionId);
      const book = getBookById(db, bookId);
      if (!book) {
        return reply.code(404).send({ error: 'Livre introuvable.' });
      }

      const tx = db.transaction(() => {
        const countRow = db
          .prepare(
            'SELECT COUNT(*) AS cnt FROM book_collection WHERE book_id = ?',
          )
          .get(bookId) as { cnt: number };
        const hasTarget = db
          .prepare(
            'SELECT 1 FROM book_collection WHERE book_id = ? AND collection_id = ?',
          )
          .get(bookId, collectionId);

        if (!hasTarget) {
          return { status: 404, error: "Ce livre n'appartient pas à cette collection." };
        }
        if (Number(countRow.cnt) <= 1) {
          return {
            status: 400,
            error:
              'Un livre doit appartenir à au moins une collection. Déplacez-le vers une autre collection ou supprimez-le.',
          };
        }
        db.prepare(
          'DELETE FROM book_collection WHERE book_id = ? AND collection_id = ?',
        ).run(bookId, collectionId);
        return { status: 200, error: null };
      });

      const res = tx();
      if (res.error) {
        return reply.code(res.status).send({ error: res.error });
      }
      return reply.send(getBookById(db, bookId));
    },
  );

  // Move a book from one collection to another
  app.post<{
    Params: { id: string };
    Body: { fromCollectionId?: number; toCollectionId?: number };
  }>('/api/books/:id/move', async (req, reply) => {
    const bookId = Number(req.params.id);
    const fromCollectionId = Number(req.body?.fromCollectionId);
    const toCollectionId = Number(req.body?.toCollectionId);

    const book = getBookById(db, bookId);
    if (!book) {
      return reply.code(404).send({ error: 'Livre introuvable.' });
    }
    const targetCol = db
      .prepare('SELECT id FROM collection WHERE id = ?')
      .get(toCollectionId);
    if (!targetCol) {
      return reply.code(400).send({ error: 'Collection cible introuvable.' });
    }

    const tx = db.transaction(() => {
      db.prepare(
        'INSERT OR IGNORE INTO book_collection (book_id, collection_id) VALUES (?, ?)',
      ).run(bookId, toCollectionId);
      if (fromCollectionId && fromCollectionId !== toCollectionId) {
        db.prepare(
          'DELETE FROM book_collection WHERE book_id = ? AND collection_id = ?',
        ).run(bookId, fromCollectionId);
      }
    });

    tx();
    return reply.send(getBookById(db, bookId));
  });

  // Bulk move multiple books to a target collection (and optionally remove from a source collection)
  app.post<{
    Body: {
      bookIds?: number[];
      fromCollectionId?: number | null;
      toCollectionId?: number;
    };
  }>('/api/books/bulk-move', async (req, reply) => {
    const rawIds = Array.isArray(req.body?.bookIds) ? req.body.bookIds : [];
    const bookIds = Array.from(
      new Set(
        rawIds
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0),
      ),
    );
    if (bookIds.length === 0) {
      return reply
        .code(400)
        .send({ error: 'Veuillez sélectionner au moins un livre.' });
    }

    const toCollectionId = Number(req.body?.toCollectionId);
    const targetCol = db
      .prepare('SELECT id FROM collection WHERE id = ?')
      .get(toCollectionId);
    if (!targetCol) {
      return reply.code(400).send({ error: 'Collection cible introuvable.' });
    }

    const fromCollectionId = req.body?.fromCollectionId
      ? Number(req.body.fromCollectionId)
      : 0;

    const placeholders = bookIds.map(() => '?').join(',');
    const existingRows = db
      .prepare(`SELECT id FROM book WHERE id IN (${placeholders})`)
      .all(...bookIds) as Array<{ id: number }>;
    if (existingRows.length !== bookIds.length) {
      return reply.code(404).send({
        error: 'Un ou plusieurs livres sélectionnés sont introuvables.',
      });
    }

    const tx = db.transaction(() => {
      const insertStmt = db.prepare(
        'INSERT OR IGNORE INTO book_collection (book_id, collection_id) VALUES (?, ?)',
      );
      const deleteStmt = db.prepare(
        'DELETE FROM book_collection WHERE book_id = ? AND collection_id = ?',
      );
      for (const bookId of bookIds) {
        insertStmt.run(bookId, toCollectionId);
        if (fromCollectionId && fromCollectionId !== toCollectionId) {
          deleteStmt.run(bookId, fromCollectionId);
        }
      }
    });

    tx();
    const updatedBooks = bookIds
      .map((id) => getBookById(db, id))
      .filter((b): b is NonNullable<typeof b> => b !== null);
    return reply.send({
      updatedCount: updatedBooks.length,
      books: updatedBooks,
    });
  });

  // Bulk update selected fields on multiple books in a single transaction
  app.post<{
    Body: {
      bookIds?: number[];
      fields?: {
        type?: string;
        publisher?: string | null;
        subtitle?: string | null;
        authors?: Array<{ name?: string; role?: string } | string>;
        collectionIds?: number[];
      };
    };
  }>('/api/books/bulk-update', async (req, reply) => {
    const rawIds = Array.isArray(req.body?.bookIds) ? req.body.bookIds : [];
    const bookIds = Array.from(
      new Set(
        rawIds
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0),
      ),
    );
    if (bookIds.length === 0) {
      return reply
        .code(400)
        .send({ error: 'Veuillez sélectionner au moins un livre.' });
    }

    const fields = req.body?.fields;
    if (
      !fields ||
      typeof fields !== 'object' ||
      (fields.type === undefined &&
        fields.publisher === undefined &&
        fields.subtitle === undefined &&
        fields.authors === undefined &&
        fields.collectionIds === undefined)
    ) {
      return reply.code(400).send({
        error: 'Veuillez sélectionner au moins un champ à modifier.',
      });
    }

    const preparedUpdates: Array<{
      id: number;
      data: Extract<ReturnType<typeof validateBookInput>, { ok: true }>['data'];
      updateCollections: boolean;
    }> = [];

    for (const bookId of bookIds) {
      const existing = getBookById(db, bookId);
      if (!existing) {
        return reply.code(404).send({
          error: 'Un ou plusieurs livres sélectionnés sont introuvables.',
        });
      }

      const mergedInput: BookInput = {
        isbn: existing.isbn13,
        title: existing.title,
        subtitle:
          fields.subtitle !== undefined ? fields.subtitle : existing.subtitle,
        publisher:
          fields.publisher !== undefined
            ? fields.publisher
            : existing.publisher,
        authors:
          fields.authors !== undefined ? fields.authors : existing.authors,
        type: fields.type !== undefined ? fields.type : existing.type,
        collectionIds:
          fields.collectionIds !== undefined
            ? fields.collectionIds
            : existing.collections.map((c) => c.id),
      };

      const validated = validateBookInput(db, mergedInput);
      if (!validated.ok) {
        return reply.code(validated.status).send({ error: validated.error });
      }

      preparedUpdates.push({
        id: bookId,
        data: validated.data,
        updateCollections: fields.collectionIds !== undefined,
      });
    }

    const tx = db.transaction(() => {
      const updateBookStmt = db.prepare(
        `UPDATE book
         SET subtitle = ?, publisher = ?, authors_json = ?, authors_text = ?,
             type = ?, title_key = ?, author_key = ?
         WHERE id = ?`,
      );
      const deleteColsStmt = db.prepare(
        'DELETE FROM book_collection WHERE book_id = ?',
      );
      const insertColStmt = db.prepare(
        'INSERT INTO book_collection (book_id, collection_id) VALUES (?, ?)',
      );

      for (const item of preparedUpdates) {
        updateBookStmt.run(
          item.data.subtitle,
          item.data.publisher,
          JSON.stringify(item.data.authors),
          item.data.authorsText,
          item.data.type,
          item.data.titleKey,
          item.data.authorKey,
          item.id,
        );
        if (item.updateCollections) {
          deleteColsStmt.run(item.id);
          for (const cid of item.data.collectionIds) {
            insertColStmt.run(item.id, cid);
          }
        }
      }
    });

    tx();
    const updatedBooks = bookIds
      .map((id) => getBookById(db, id))
      .filter((b): b is NonNullable<typeof b> => b !== null);
    return reply.send({
      updatedCount: updatedBooks.length,
      books: updatedBooks,
    });
  });

  app.delete<{ Params: { id: string } }>(
    '/api/books/:id',
    async (req, reply) => {
      const id = Number(req.params.id);
      const existing = db
        .prepare('SELECT id, cover_path FROM book WHERE id = ?')
        .get(id) as { id: number; cover_path: string | null } | undefined;
      if (!existing) {
        return reply.code(404).send({ error: 'Livre introuvable.' });
      }
      db.prepare('DELETE FROM book WHERE id = ?').run(id);
      deleteCoverFile(coversDir, existing.cover_path);
      return reply.code(204).send();
    },
  );

  // --- Cover Image Serving ---
  app.get<{ Params: { filename: string } }>(
    '/api/covers/:filename',
    async (req, reply) => {
      const rawName = req.params.filename ?? '';
      const safeName = path.basename(rawName);
      if (!safeName || !/^[a-zA-Z0-9._-]+$/.test(safeName)) {
        return reply.code(400).send({ error: 'Nom de fichier invalide.' });
      }
      const fullPath = path.join(coversDir, safeName);
      if (!fs.existsSync(fullPath)) {
        return reply.code(404).send({ error: 'Couverture introuvable.' });
      }
      const buf = fs.readFileSync(fullPath);
      return reply
        .header('Content-Type', getCoverContentType(safeName))
        .header('Cache-Control', 'public, max-age=31536000, immutable')
        .send(buf);
    },
  );

  // --- ISBN Metadata Lookup ---
  app.get<{ Querystring: { isbn?: string } }>(
    '/api/lookup',
    async (req, reply) => {
      const rawIsbn = (req.query.isbn ?? '').trim();
      const isbn13 = normalizeIsbn(rawIsbn);
      if (!isbn13) {
        return reply.code(400).send({
          error:
            'ISBN invalide. Vérifiez les chiffres ou la clé de contrôle.',
        });
      }

      const meta = options.lookupFn
        ? await options.lookupFn(isbn13)
        : await lookupIsbnMetadata(isbn13, db, options.fetchImpl);

      const duplicates = checkDuplicates(db, {
        isbn13,
        title: meta?.title ?? null,
        subtitle: meta?.subtitle ?? null,
        authors: meta?.authors ?? [],
      });

      return reply.send({
        isbn13,
        found: Boolean(meta),
        metadata: meta
          ? {
              title: meta.title,
              subtitle: meta.subtitle,
              publisher: meta.publisher ?? null,
              coverUrl: meta.coverUrl ?? null,
              authors: meta.authors,
            }
          : null,
        duplicates,
      });
    },
  );

  // --- Cover Photo Analysis & Lookup ---
  app.post<{ Body: { imageDataUrl?: string } }>(
    '/api/lookup-cover',
    async (req, reply) => {
      const imageDataUrl = (req.body?.imageDataUrl ?? '').trim();
      if (!imageDataUrl) {
        return reply.code(400).send({
          error: 'Image de couverture manquante.',
        });
      }

      try {
        const result = await lookupBookFromCoverImage(imageDataUrl, db, {
          fetchImpl: options.fetchImpl,
          ocrFn: options.ocrFn,
        });
        return reply.send(result);
      } catch (err) {
        return reply.code(400).send({
          error:
            err instanceof Error
              ? err.message
              : "Impossible d'analyser cette image de couverture.",
        });
      }
    },
  );

  // --- Duplicate Check ---
  app.get<{
    Querystring: {
      isbn?: string;
      title?: string;
      subtitle?: string;
      author?: string | string[];
      authors?: string;
    };
  }>('/api/check', async (req, reply) => {
    let isbn13: string | null = null;
    if (req.query.isbn && req.query.isbn.trim() !== '') {
      isbn13 = normalizeIsbn(req.query.isbn);
      if (!isbn13) {
        return reply.code(400).send({
          error: 'ISBN invalide. Vérifiez la clé de contrôle.',
        });
      }
    }

    const authorsList: Array<BookAuthor | string> = [];
    if (req.query.authors) {
      try {
        const parsed = JSON.parse(req.query.authors);
        if (Array.isArray(parsed)) {
          authorsList.push(...parsed);
        }
      } catch {
        authorsList.push(
          ...req.query.authors
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        );
      }
    }
    if (req.query.author) {
      const raw = Array.isArray(req.query.author)
        ? req.query.author
        : [req.query.author];
      for (const item of raw) {
        for (const part of item.split(';')) {
          if (part.trim()) authorsList.push(part.trim());
        }
      }
    }

    const result = checkDuplicates(db, {
      isbn13,
      title: req.query.title ?? null,
      subtitle: req.query.subtitle ?? null,
      authors: authorsList,
    });

    return reply.send(result);
  });

  const staticDir = options.staticDir ?? process.env.STATIC_DIR;
  if (staticDir && fs.existsSync(staticDir)) {
    app.register(fastifyStatic, {
      root: path.resolve(staticDir),
      prefix: '/',
      wildcard: false,
    });
    app.setNotFoundHandler((req, reply) => {
      if (req.url.startsWith('/api/')) {
        reply.code(404).send({ error: 'Ressource introuvable' });
        return;
      }
      reply.sendFile('index.html');
    });
  }

  return app;
}
