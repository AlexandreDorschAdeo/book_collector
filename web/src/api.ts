export type BookType = 'book' | 'bd' | 'manga' | 'comic';
export type AuthorRole = 'author' | 'writer' | 'illustrator';

export interface BookAuthor {
  name: string;
  role: AuthorRole;
}

export interface CollectionDto {
  id: number;
  name: string;
  location: string;
  bookCount: number;
  createdAt: string;
}

export interface BookCollectionRef {
  id: number;
  name: string;
  location: string;
}

export interface BookDto {
  id: number;
  isbn13: string | null;
  title: string;
  subtitle: string | null;
  publisher: string | null;
  coverUrl: string | null;
  authors: BookAuthor[];
  type: BookType;
  collections: BookCollectionRef[];
  createdAt: string;
}

export interface DuplicateCheckResult {
  sameIsbn: BookDto[];
  otherEditions: BookDto[];
}

export interface LookupResponse {
  isbn13: string;
  found: boolean;
  metadata: {
    title: string;
    subtitle: string | null;
    publisher?: string | null;
    coverUrl?: string | null;
    authors: BookAuthor[];
  } | null;
  duplicates: DuplicateCheckResult;
}

export interface CoverCandidate {
  isbn13: string | null;
  title: string;
  subtitle: string | null;
  publisher: string | null;
  coverUrl: string | null;
  authors: BookAuthor[];
  type: BookType;
  duplicates: DuplicateCheckResult;
}

export interface CoverLookupResponse {
  clues: {
    source: 'vision' | 'ocr';
    rawText: string;
    searchQuery: string;
    title: string | null;
    subtitle: string | null;
    publisher: string | null;
    isbn13: string | null;
    authors: BookAuthor[];
    inferredType: BookType;
  };
  candidates: CoverCandidate[];
  bestMatch: CoverCandidate | null;
}

export type VisionProviderMode =
  | 'auto'
  | 'ocr'
  | 'gemini'
  | 'openai'
  | 'ollama';

export interface AppSettings {
  visionProvider: VisionProviderMode;
  geminiApiKey: string;
  geminiModel: string;
  openaiApiKey: string;
  openaiModel: string;
  ollamaUrl: string;
  ollamaModel: string;
  googleBooksApiKey: string;
}

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

export interface CreateUserPayload {
  username: string;
  password: string;
  canAddBooks: boolean;
  canEditBooks: boolean;
  canDeleteBooks: boolean;
  canManageUsers: boolean;
}

export interface UpdateUserPayload {
  username?: string;
  password?: string;
  canAddBooks?: boolean;
  canEditBooks?: boolean;
  canDeleteBooks?: boolean;
  canManageUsers?: boolean;
}

export const BOOK_TYPE_LABELS: Record<BookType, string> = {
  book: 'Livre',
  bd: 'BD',
  manga: 'Manga',
  comic: 'Comic book',
};

export const AUTHOR_ROLE_LABELS: Record<AuthorRole, string> = {
  author: 'Auteur',
  writer: 'Scénariste',
  illustrator: 'Dessinateur',
};

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers ?? {});
  if (authToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }
  return fetch(url, {
    ...init,
    headers,
    credentials: 'same-origin',
  });
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Erreur HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore json parse failure
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  login(
    username: string,
    password: string,
  ): Promise<{ token: string; user: UserDto }> {
    return apiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }).then(async (r) => {
      const res = await handleResponse<{ token: string; user: UserDto }>(r);
      authToken = res.token;
      return res;
    });
  },

  logout(): Promise<void> {
    return apiFetch('/api/auth/logout', {
      method: 'POST',
    }).then(async (r) => {
      authToken = null;
      return handleResponse<void>(r);
    });
  },

  getMe(): Promise<UserDto> {
    return apiFetch('/api/auth/me').then((r) => handleResponse<UserDto>(r));
  },

  changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<{ status: string }> {
    return apiFetch('/api/auth/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    }).then((r) => handleResponse<{ status: string }>(r));
  },

  getUsers(): Promise<UserDto[]> {
    return apiFetch('/api/users').then((r) => handleResponse<UserDto[]>(r));
  },

  createUser(data: CreateUserPayload): Promise<UserDto> {
    return apiFetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<UserDto>(r));
  },

  updateUser(id: number, data: UpdateUserPayload): Promise<UserDto> {
    return apiFetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<UserDto>(r));
  },

  deleteUser(id: number): Promise<void> {
    return apiFetch(`/api/users/${id}`, {
      method: 'DELETE',
    }).then((r) => handleResponse<void>(r));
  },

  getCollections(): Promise<CollectionDto[]> {
    return apiFetch('/api/collections').then((r) =>
      handleResponse<CollectionDto[]>(r),
    );
  },

  createCollection(data: { name: string; location: string }): Promise<CollectionDto> {
    return apiFetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<CollectionDto>(r));
  },

  updateCollection(
    id: number,
    data: { name: string; location: string },
  ): Promise<CollectionDto> {
    return apiFetch(`/api/collections/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<CollectionDto>(r));
  },

  deleteCollection(id: number): Promise<void> {
    return apiFetch(`/api/collections/${id}`, {
      method: 'DELETE',
    }).then((r) => handleResponse<void>(r));
  },

  getBooks(params?: {
    collectionId?: number;
    type?: string;
    sort?: string;
    q?: string;
  }): Promise<BookDto[]> {
    const search = new URLSearchParams();
    if (params?.collectionId) search.set('collectionId', String(params.collectionId));
    if (params?.type) search.set('type', params.type);
    if (params?.sort) search.set('sort', params.sort);
    if (params?.q) search.set('q', params.q);
    const qs = search.toString();
    return apiFetch(`/api/books${qs ? `?${qs}` : ''}`).then((r) =>
      handleResponse<BookDto[]>(r),
    );
  },

  createBook(data: {
    isbn?: string | null;
    title: string;
    subtitle?: string | null;
    publisher?: string | null;
    coverDataUrl?: string | null;
    coverSourceUrl?: string | null;
    authors: BookAuthor[];
    type: BookType;
    collectionIds: number[];
  }): Promise<BookDto> {
    return apiFetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<BookDto>(r));
  },

  updateBook(
    id: number,
    data: {
      isbn?: string | null;
      title: string;
      subtitle?: string | null;
      publisher?: string | null;
      coverDataUrl?: string | null;
      coverSourceUrl?: string | null;
      removeCover?: boolean;
      authors: BookAuthor[];
      type: BookType;
      collectionIds: number[];
    },
  ): Promise<BookDto> {
    return apiFetch(`/api/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<BookDto>(r));
  },

  attachBookToCollection(bookId: number, collectionId: number): Promise<BookDto> {
    return apiFetch(`/api/books/${bookId}/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collectionId }),
    }).then((r) => handleResponse<BookDto>(r));
  },

  moveBook(
    bookId: number,
    fromCollectionId: number,
    toCollectionId: number,
  ): Promise<BookDto> {
    return apiFetch(`/api/books/${bookId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromCollectionId, toCollectionId }),
    }).then((r) => handleResponse<BookDto>(r));
  },

  deleteBook(bookId: number): Promise<void> {
    return apiFetch(`/api/books/${bookId}`, {
      method: 'DELETE',
    }).then((r) => handleResponse<void>(r));
  },

  lookupIsbn(isbn: string): Promise<LookupResponse> {
    return apiFetch(`/api/lookup?isbn=${encodeURIComponent(isbn)}`).then((r) =>
      handleResponse<LookupResponse>(r),
    );
  },

  lookupCover(imageDataUrl: string): Promise<CoverLookupResponse> {
    return apiFetch('/api/lookup-cover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageDataUrl }),
    }).then((r) => handleResponse<CoverLookupResponse>(r));
  },

  getSettings(): Promise<AppSettings> {
    return apiFetch('/api/settings').then((r) => handleResponse<AppSettings>(r));
  },

  updateSettings(data: Partial<AppSettings>): Promise<AppSettings> {
    return apiFetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<AppSettings>(r));
  },

  checkDuplicates(params: {
    isbn?: string;
    title?: string;
    subtitle?: string;
    authors?: BookAuthor[];
  }): Promise<DuplicateCheckResult> {
    const search = new URLSearchParams();
    if (params.isbn) search.set('isbn', params.isbn);
    if (params.title) search.set('title', params.title);
    if (params.subtitle) search.set('subtitle', params.subtitle);
    if (params.authors && params.authors.length > 0) {
      search.set('authors', JSON.stringify(params.authors));
    }
    return apiFetch(`/api/check?${search.toString()}`).then((r) =>
      handleResponse<DuplicateCheckResult>(r),
    );
  },
};
