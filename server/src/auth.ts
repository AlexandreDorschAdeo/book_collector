import crypto from 'node:crypto';
import Database from 'better-sqlite3';
import { FastifyRequest } from 'fastify';

export interface UserPermissions {
  canAddBooks: boolean;
  canEditBooks: boolean;
  canDeleteBooks: boolean;
  canManageUsers: boolean;
}

export interface UserDto extends UserPermissions {
  id: number;
  username: string;
  createdAt: string;
}

interface RawUserRow {
  id: number;
  username: string;
  password_hash: string;
  can_add_books: number;
  can_edit_books: number;
  can_delete_books: number;
  can_manage_users: number;
  created_at: string;
}

export const SESSION_COOKIE_NAME = 'bc_session';
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

export function hashPassword(
  password: string,
  saltHex = crypto.randomBytes(16).toString('hex'),
): string {
  const derived = crypto.scryptSync(password, saltHex, 64).toString('hex');
  return `scrypt$${saltHex}$${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, saltHex, hashHex] = parts;
  try {
    const expected = Buffer.from(hashHex, 'hex');
    const actual = crypto.scryptSync(password, saltHex, expected.length);
    if (expected.length !== actual.length) return false;
    return crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

function mapUserRow(row: RawUserRow): UserDto {
  return {
    id: row.id,
    username: row.username,
    canAddBooks: Boolean(row.can_add_books),
    canEditBooks: Boolean(row.can_edit_books),
    canDeleteBooks: Boolean(row.can_delete_books),
    canManageUsers: Boolean(row.can_manage_users),
    createdAt: row.created_at,
  };
}

export function seedDefaultAdminUser(db: Database.Database): void {
  const countRow = db
    .prepare('SELECT COUNT(*) AS cnt FROM app_user')
    .get() as { cnt: number };
  if (Number(countRow.cnt) === 0) {
    const passwordHash = hashPassword('1234');
    db.prepare(
      `INSERT INTO app_user (
        username, password_hash, can_add_books, can_edit_books, can_delete_books, can_manage_users
      ) VALUES (?, ?, 1, 1, 1, 1)`,
    ).run('admin', passwordHash);
  }
}

export function authenticateUser(
  db: Database.Database,
  username: string,
  password: string,
): UserDto | null {
  const cleanUsername = (username ?? '').trim();
  if (!cleanUsername || !password) return null;
  const row = db
    .prepare(
      `SELECT id, username, password_hash, can_add_books, can_edit_books, can_delete_books, can_manage_users, created_at
       FROM app_user WHERE username = ? COLLATE NOCASE`,
    )
    .get(cleanUsername) as RawUserRow | undefined;

  if (!row) return null;
  if (!verifyPassword(password, row.password_hash)) return null;
  return mapUserRow(row);
}

export function createSession(db: Database.Database, userId: number): string {
  db.prepare(
    "DELETE FROM user_session WHERE expires_at <= datetime('now')",
  ).run();
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare(
    `INSERT INTO user_session (token, user_id, expires_at)
     VALUES (?, ?, datetime('now', '+30 days'))`,
  ).run(token, userId);
  return token;
}

export function deleteSession(db: Database.Database, token: string): void {
  if (!token) return;
  db.prepare('DELETE FROM user_session WHERE token = ?').run(token);
}

export function getUserBySessionToken(
  db: Database.Database,
  token: string,
): UserDto | null {
  if (!token) return null;
  const row = db
    .prepare(
      `SELECT u.id, u.username, u.password_hash, u.can_add_books, u.can_edit_books, u.can_delete_books, u.can_manage_users, u.created_at
       FROM user_session s
       JOIN app_user u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > datetime('now')`,
    )
    .get(token) as RawUserRow | undefined;
  if (!row) return null;
  return mapUserRow(row);
}

export function extractSessionToken(req: FastifyRequest): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && /^Bearer\s+([A-Za-z0-9._-]+)$/i.test(authHeader.trim())) {
    return authHeader.trim().replace(/^Bearer\s+/i, '').trim();
  }
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const [rawName, ...rest] = part.trim().split('=');
    if (rawName === SESSION_COOKIE_NAME) {
      const value = rest.join('=').trim();
      if (value) return decodeURIComponent(value);
    }
  }
  return null;
}

export function isHttpsRequest(req: FastifyRequest): boolean {
  if (req.protocol === 'https') return true;
  const forwardedProto = String(req.headers['x-forwarded-proto'] ?? '')
    .split(',')[0]
    .trim()
    .toLowerCase();
  return forwardedProto === 'https';
}

export function formatSessionCookie(
  token: string,
  isHttps: boolean,
  maxAgeSeconds = SESSION_MAX_AGE_SECONDS,
): string {
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (isHttps) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

export function listUsers(db: Database.Database): UserDto[] {
  const rows = db
    .prepare(
      `SELECT id, username, password_hash, can_add_books, can_edit_books, can_delete_books, can_manage_users, created_at
       FROM app_user ORDER BY username COLLATE NOCASE ASC`,
    )
    .all() as RawUserRow[];
  return rows.map(mapUserRow);
}

export function getUserById(
  db: Database.Database,
  id: number,
): UserDto | null {
  const row = db
    .prepare(
      `SELECT id, username, password_hash, can_add_books, can_edit_books, can_delete_books, can_manage_users, created_at
       FROM app_user WHERE id = ?`,
    )
    .get(id) as RawUserRow | undefined;
  return row ? mapUserRow(row) : null;
}

export interface CreateUserInput {
  username?: string;
  password?: string;
  canAddBooks?: boolean;
  canEditBooks?: boolean;
  canDeleteBooks?: boolean;
  canManageUsers?: boolean;
}

export function createUser(
  db: Database.Database,
  input: CreateUserInput,
): { ok: true; user: UserDto } | { ok: false; status: number; error: string } {
  const username = (input.username ?? '').trim();
  const password = input.password ?? '';

  if (username.length < 2 || username.length > 50) {
    return {
      ok: false,
      status: 400,
      error: "L'identifiant doit contenir entre 2 et 50 caractères.",
    };
  }
  if (password.length < 4) {
    return {
      ok: false,
      status: 400,
      error: 'Le mot de passe doit contenir au moins 4 caractères.',
    };
  }

  const existing = db
    .prepare('SELECT id FROM app_user WHERE username = ? COLLATE NOCASE')
    .get(username);
  if (existing) {
    return {
      ok: false,
      status: 409,
      error: 'Un utilisateur portant cet identifiant existe déjà.',
    };
  }

  const passwordHash = hashPassword(password);
  const info = db
    .prepare(
      `INSERT INTO app_user (
        username, password_hash, can_add_books, can_edit_books, can_delete_books, can_manage_users
      ) VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      username,
      passwordHash,
      input.canAddBooks ? 1 : 0,
      input.canEditBooks ? 1 : 0,
      input.canDeleteBooks ? 1 : 0,
      input.canManageUsers ? 1 : 0,
    );

  const user = getUserById(db, Number(info.lastInsertRowid))!;
  return { ok: true, user };
}

export interface UpdateUserInput {
  username?: string;
  password?: string;
  canAddBooks?: boolean;
  canEditBooks?: boolean;
  canDeleteBooks?: boolean;
  canManageUsers?: boolean;
}

export function updateUser(
  db: Database.Database,
  id: number,
  input: UpdateUserInput,
): { ok: true; user: UserDto } | { ok: false; status: number; error: string } {
  const current = db
    .prepare(
      `SELECT id, username, password_hash, can_add_books, can_edit_books, can_delete_books, can_manage_users, created_at
       FROM app_user WHERE id = ?`,
    )
    .get(id) as RawUserRow | undefined;

  if (!current) {
    return { ok: false, status: 404, error: 'Utilisateur introuvable.' };
  }

  const nextUsername =
    input.username !== undefined ? input.username.trim() : current.username;
  if (nextUsername.length < 2 || nextUsername.length > 50) {
    return {
      ok: false,
      status: 400,
      error: "L'identifiant doit contenir entre 2 et 50 caractères.",
    };
  }

  const duplicate = db
    .prepare(
      'SELECT id FROM app_user WHERE username = ? COLLATE NOCASE AND id != ?',
    )
    .get(nextUsername, id);
  if (duplicate) {
    return {
      ok: false,
      status: 409,
      error: 'Un utilisateur portant cet identifiant existe déjà.',
    };
  }

  const nextCanAdd =
    input.canAddBooks !== undefined
      ? input.canAddBooks
        ? 1
        : 0
      : current.can_add_books;
  const nextCanEdit =
    input.canEditBooks !== undefined
      ? input.canEditBooks
        ? 1
        : 0
      : current.can_edit_books;
  const nextCanDelete =
    input.canDeleteBooks !== undefined
      ? input.canDeleteBooks
        ? 1
        : 0
      : current.can_delete_books;
  const nextCanManage =
    input.canManageUsers !== undefined
      ? input.canManageUsers
        ? 1
        : 0
      : current.can_manage_users;

  if (current.can_manage_users === 1 && nextCanManage === 0) {
    const otherAdmins = db
      .prepare(
        'SELECT COUNT(*) AS cnt FROM app_user WHERE can_manage_users = 1 AND id != ?',
      )
      .get(id) as { cnt: number };
    if (Number(otherAdmins.cnt) === 0) {
      return {
        ok: false,
        status: 400,
        error:
          "Impossible de retirer le droit de gestion des utilisateurs au dernier administrateur.",
      };
    }
  }

  let nextPasswordHash = current.password_hash;
  if (input.password !== undefined && input.password !== '') {
    if (input.password.length < 4) {
      return {
        ok: false,
        status: 400,
        error: 'Le mot de passe doit contenir au moins 4 caractères.',
      };
    }
    nextPasswordHash = hashPassword(input.password);
  }

  db.prepare(
    `UPDATE app_user
     SET username = ?, password_hash = ?, can_add_books = ?, can_edit_books = ?, can_delete_books = ?, can_manage_users = ?
     WHERE id = ?`,
  ).run(
    nextUsername,
    nextPasswordHash,
    nextCanAdd,
    nextCanEdit,
    nextCanDelete,
    nextCanManage,
    id,
  );

  return { ok: true, user: getUserById(db, id)! };
}

export function deleteUser(
  db: Database.Database,
  id: number,
): { ok: true } | { ok: false; status: number; error: string } {
  const current = db
    .prepare('SELECT id, can_manage_users FROM app_user WHERE id = ?')
    .get(id) as { id: number; can_manage_users: number } | undefined;

  if (!current) {
    return { ok: false, status: 404, error: 'Utilisateur introuvable.' };
  }

  if (current.can_manage_users === 1) {
    const otherAdmins = db
      .prepare(
        'SELECT COUNT(*) AS cnt FROM app_user WHERE can_manage_users = 1 AND id != ?',
      )
      .get(id) as { cnt: number };
    if (Number(otherAdmins.cnt) === 0) {
      return {
        ok: false,
        status: 400,
        error: 'Impossible de supprimer le dernier administrateur.',
      };
    }
  }

  db.prepare('DELETE FROM app_user WHERE id = ?').run(id);
  return { ok: true };
}

export function changeUserPassword(
  db: Database.Database,
  userId: number,
  currentPassword: string,
  newPassword: string,
): { ok: true } | { ok: false; status: number; error: string } {
  if (!newPassword || newPassword.length < 4) {
    return {
      ok: false,
      status: 400,
      error: 'Le nouveau mot de passe doit contenir au moins 4 caractères.',
    };
  }
  const row = db
    .prepare('SELECT password_hash FROM app_user WHERE id = ?')
    .get(userId) as { password_hash: string } | undefined;
  if (!row) {
    return { ok: false, status: 404, error: 'Utilisateur introuvable.' };
  }
  if (!verifyPassword(currentPassword ?? '', row.password_hash)) {
    return {
      ok: false,
      status: 401,
      error: 'Mot de passe actuel incorrect.',
    };
  }
  const nextHash = hashPassword(newPassword);
  db.prepare('UPDATE app_user SET password_hash = ? WHERE id = ?').run(
    nextHash,
    userId,
  );
  return { ok: true };
}

export class LoginRateLimiter {
  private attempts = new Map<string, { count: number; firstAttemptMs: number }>();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts = 10, windowMs = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = this.attempts.get(ip);
    if (!entry) return false;
    if (now - entry.firstAttemptMs > this.windowMs) {
      this.attempts.delete(ip);
      return false;
    }
    return entry.count >= this.maxAttempts;
  }

  recordFailure(ip: string): void {
    const now = Date.now();
    const entry = this.attempts.get(ip);
    if (!entry || now - entry.firstAttemptMs > this.windowMs) {
      this.attempts.set(ip, { count: 1, firstAttemptMs: now });
    } else {
      entry.count += 1;
    }
  }

  reset(ip: string): void {
    this.attempts.delete(ip);
  }
}
