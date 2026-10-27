import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';

describe('User Authentication, Permissions & Nginx Proxy Support (user-auth 1.1, 1.2, 1.3)', () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = buildApp({ dbPath: ':memory:', enforceAuth: true });
  });

  afterEach(async () => {
    await app.close();
  });

  it('rejects unauthenticated access with 401 and logs in with seeded admin / 1234 behind Nginx HTTPS headers', async () => {
    // Unauthenticated call -> 401
    const unauthRes = await app.inject({
      method: 'GET',
      url: '/api/books',
    });
    expect(unauthRes.statusCode).toBe(401);

    // Health endpoint remains public for Docker/Nginx probes
    const healthRes = await app.inject({
      method: 'GET',
      url: '/api/health',
    });
    expect(healthRes.statusCode).toBe(200);

    // Login with wrong password -> 401
    const badLogin = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'admin', password: 'wrong' },
    });
    expect(badLogin.statusCode).toBe(401);

    // Login with default admin / 1234 behind Nginx X-Forwarded-Proto: https
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      headers: {
        'x-forwarded-proto': 'https',
        'x-forwarded-for': '203.0.113.10',
      },
      payload: { username: 'admin', password: '1234' },
    });
    expect(loginRes.statusCode).toBe(200);
    const setCookie = String(loginRes.headers['set-cookie'] ?? '');
    expect(setCookie).toContain('bc_session=');
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('Secure');

    const { token, user } = loginRes.json();
    expect(user).toMatchObject({
      username: 'admin',
      canAddBooks: true,
      canEditBooks: true,
      canDeleteBooks: true,
      canManageUsers: true,
    });

    // Authenticated GET /api/auth/me works
    const meRes = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { authorization: `Bearer ${token}` },
    });
    expect(meRes.statusCode).toBe(200);
    expect(meRes.json().username).toBe('admin');
  });

  it('enforces granular permissions (canAddBooks, canEditBooks, canDeleteBooks, canManageUsers) and protects the last admin', async () => {
    const adminLogin = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'admin', password: '1234' },
    });
    const adminToken = adminLogin.json().token as string;
    const adminUser = adminLogin.json().user as { id: number };
    const adminHeaders = { authorization: `Bearer ${adminToken}` };

    // Admin cannot delete or demote themselves when they are the only admin
    const selfDelete = await app.inject({
      method: 'DELETE',
      url: `/api/users/${adminUser.id}`,
      headers: adminHeaders,
    });
    expect(selfDelete.statusCode).toBe(400);

    const selfDemote = await app.inject({
      method: 'PUT',
      url: `/api/users/${adminUser.id}`,
      headers: adminHeaders,
      payload: { canManageUsers: false },
    });
    expect(selfDemote.statusCode).toBe(400);

    // Create a collection as admin
    const colRes = await app.inject({
      method: 'POST',
      url: '/api/collections',
      headers: adminHeaders,
      payload: { name: 'Salon', location: 'Maison' },
    });
    expect(colRes.statusCode).toBe(201);
    const colId = colRes.json().id;

    // Create user "lecteur_ajout" who can ONLY add books (no edit, no delete, no user management)
    const createAdderRes = await app.inject({
      method: 'POST',
      url: '/api/users',
      headers: adminHeaders,
      payload: {
        username: 'alice',
        password: 'password123',
        canAddBooks: true,
        canEditBooks: false,
        canDeleteBooks: false,
        canManageUsers: false,
      },
    });
    expect(createAdderRes.statusCode).toBe(201);
    const alice = createAdderRes.json();
    expect(alice).toMatchObject({
      username: 'alice',
      canAddBooks: true,
      canEditBooks: false,
      canDeleteBooks: false,
      canManageUsers: false,
    });

    const aliceLogin = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'alice', password: 'password123' },
    });
    const aliceHeaders = {
      authorization: `Bearer ${aliceLogin.json().token}`,
    };

    // Alice can add a book
    const addBookRes = await app.inject({
      method: 'POST',
      url: '/api/books',
      headers: aliceHeaders,
      payload: {
        title: 'Le Petit Prince',
        authors: [{ name: 'Antoine de Saint-Exupéry', role: 'author' }],
        type: 'book',
        collectionIds: [colId],
      },
    });
    expect(addBookRes.statusCode).toBe(201);
    const bookId = addBookRes.json().id;

    // Alice CANNOT edit the book (403)
    const editBookRes = await app.inject({
      method: 'PUT',
      url: `/api/books/${bookId}`,
      headers: aliceHeaders,
      payload: { title: 'Titre modifié' },
    });
    expect(editBookRes.statusCode).toBe(403);

    // Alice CANNOT delete the book (403)
    const delBookRes = await app.inject({
      method: 'DELETE',
      url: `/api/books/${bookId}`,
      headers: aliceHeaders,
    });
    expect(delBookRes.statusCode).toBe(403);

    // Alice CANNOT manage users or settings (403)
    const listUsersRes = await app.inject({
      method: 'GET',
      url: '/api/users',
      headers: aliceHeaders,
    });
    expect(listUsersRes.statusCode).toBe(403);

    // Admin grants canEditBooks to Alice
    const grantEditRes = await app.inject({
      method: 'PUT',
      url: `/api/users/${alice.id}`,
      headers: adminHeaders,
      payload: { canEditBooks: true },
    });
    expect(grantEditRes.statusCode).toBe(200);
    expect(grantEditRes.json().canEditBooks).toBe(true);

    // Now Alice CAN edit the book, but still CANNOT delete it
    const editBookRes2 = await app.inject({
      method: 'PUT',
      url: `/api/books/${bookId}`,
      headers: aliceHeaders,
      payload: { title: 'Le Petit Prince (Édition Collector)' },
    });
    expect(editBookRes2.statusCode).toBe(200);

    const delBookRes2 = await app.inject({
      method: 'DELETE',
      url: `/api/books/${bookId}`,
      headers: aliceHeaders,
    });
    expect(delBookRes2.statusCode).toBe(403);
  });

  it('rate-limits repeated failed login attempts per client IP from X-Forwarded-For', async () => {
    for (let i = 0; i < 10; i++) {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        headers: { 'x-forwarded-for': '198.51.100.77' },
        payload: { username: 'admin', password: 'bad' },
      });
      expect(res.statusCode).toBe(401);
    }

    // 11th attempt from same IP -> 429 Too Many Requests
    const blockedRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      headers: { 'x-forwarded-for': '198.51.100.77' },
      payload: { username: 'admin', password: '1234' },
    });
    expect(blockedRes.statusCode).toBe(429);

    // Another client IP behind Nginx is unaffected
    const otherIpRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      headers: { 'x-forwarded-for': '198.51.100.88' },
      payload: { username: 'admin', password: '1234' },
    });
    expect(otherIpRes.statusCode).toBe(200);
  });
});
