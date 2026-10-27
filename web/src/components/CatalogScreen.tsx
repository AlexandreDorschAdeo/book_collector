import React, { useEffect, useState } from 'react';
import {
  api,
  AUTHOR_ROLE_LABELS,
  AuthorRole,
  BOOK_TYPE_LABELS,
  BookAuthor,
  BookDto,
  BookType,
  CollectionDto,
} from '../api';
import { CoverPicker } from './CoverPickerModal';

export interface CatalogScreenProps {
  collections: CollectionDto[];
  selectedCollectionId: number | null;
  onSelectCollection: (id: number | null) => void;
  onCollectionsChanged: () => Promise<void>;
  canEditBooks?: boolean;
  canDeleteBooks?: boolean;
}

export function CatalogScreen({
  collections,
  selectedCollectionId,
  onSelectCollection,
  onCollectionsChanged,
  canEditBooks = true,
  canDeleteBooks = true,
}: CatalogScreenProps) {
  const [books, setBooks] = useState<BookDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('title');
  const [error, setError] = useState<string | null>(null);

  // Add / Edit modal state
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<BookDto | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formPublisher, setFormPublisher] = useState('');
  const [formIsbn, setFormIsbn] = useState('');
  const [formType, setFormType] = useState<BookType>('book');
  const [formAuthors, setFormAuthors] = useState<BookAuthor[]>([
    { name: '', role: 'author' },
  ]);
  const [formCollectionIds, setFormCollectionIds] = useState<number[]>([]);
  const [formCoverDataUrl, setFormCoverDataUrl] = useState<string | null>(null);
  const [formCoverSourceUrl, setFormCoverSourceUrl] = useState<string | null>(
    null,
  );
  const [formRemoveCover, setFormRemoveCover] = useState<boolean>(false);

  // Move dialog state
  const [movingBook, setMovingBook] = useState<BookDto | null>(null);
  const [moveFromId, setMoveFromId] = useState<number>(0);
  const [moveToId, setMoveToId] = useState<number>(0);

  // Delete confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const loadBooks = async () => {
    try {
      const list = await api.getBooks({
        collectionId:
          searchQuery.trim() !== ''
            ? undefined
            : (selectedCollectionId ?? undefined),
        type: typeFilter || undefined,
        sort: sortBy,
        q: searchQuery.trim() || undefined,
      });
      setBooks(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    }
  };

  useEffect(() => {
    loadBooks();
  }, [selectedCollectionId, typeFilter, sortBy, searchQuery]);

  const openEditForm = (book: BookDto) => {
    setEditingBook(book);
    setFormTitle(book.title);
    setFormSubtitle(book.subtitle ?? '');
    setFormPublisher(book.publisher ?? '');
    setFormIsbn(book.isbn13 ?? '');
    setFormType(book.type);
    setFormAuthors(
      book.authors.length > 0
        ? book.authors.map((a) => ({ ...a }))
        : [{ name: '', role: 'author' }],
    );
    setFormCoverDataUrl(null);
    setFormCoverSourceUrl(book.coverUrl ?? null);
    setFormRemoveCover(false);
    setFormCollectionIds(book.collections.map((c) => c.id));
    setError(null);
    setShowForm(true);
  };

  const toggleCollectionInForm = (cid: number) => {
    setFormCollectionIds((prev) =>
      prev.includes(cid) ? prev.filter((id) => id !== cid) : [...prev, cid],
    );
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    setError(null);
    const validAuthors = formAuthors
      .map((a) => ({ name: a.name.trim(), role: a.role }))
      .filter((a) => a.name !== '');

    if (!formTitle.trim()) {
      setError('Le titre est obligatoire.');
      return;
    }
    if (validAuthors.length === 0) {
      setError('Au moins un auteur est obligatoire.');
      return;
    }
    if (formCollectionIds.length === 0) {
      setError('Un livre doit appartenir à au moins une collection.');
      return;
    }

    try {
      const payload = {
        isbn: formIsbn.trim() || null,
        title: formTitle.trim(),
        subtitle: formSubtitle.trim() || null,
        publisher: formPublisher.trim() || null,
        coverDataUrl: formCoverDataUrl || undefined,
        removeCover: formRemoveCover || undefined,
        authors: validAuthors,
        type: formType,
        collectionIds: formCollectionIds,
      };
      await api.updateBook(editingBook.id, payload);
      setShowForm(false);
      setEditingBook(null);
      await loadBooks();
      await onCollectionsChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'enregistrement");
    }
  };

  const startMove = (book: BookDto) => {
    const firstCol = book.collections[0]?.id ?? 0;
    const otherCol =
      collections.find((c) => c.id !== firstCol)?.id ?? firstCol;
    setMovingBook(book);
    setMoveFromId(firstCol);
    setMoveToId(otherCol);
  };

  const handleMoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movingBook) return;
    setError(null);
    try {
      await api.moveBook(movingBook.id, moveFromId, moveToId);
      setMovingBook(null);
      await loadBooks();
      await onCollectionsChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de déplacement');
    }
  };

  const handleConfirmDelete = async (bookId: number) => {
    setError(null);
    try {
      await api.deleteBook(bookId);
      setConfirmDeleteId(null);
      await loadBooks();
      await onCollectionsChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de suppression');
    }
  };

  return (
    <section className="screen-section">
      <div className="catalog-header">
        <h2>Bibliothèque</h2>
      </div>

      {error && (
        <div role="alert" className="alert alert-error">
          {error}
        </div>
      )}

      <div className="card filters-bar">
        <div className="field search-field">
          <label htmlFor="global-search">
            Rechercher dans toutes les collections
          </label>
          <input
            id="global-search"
            type="search"
            placeholder="Titre, sous-titre, auteur, éditeur, ISBN…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="filter-collection">Collection</label>
          <select
            id="filter-collection"
            value={selectedCollectionId ?? ''}
            onChange={(e) =>
              onSelectCollection(e.target.value ? Number(e.target.value) : null)
            }
            disabled={searchQuery.trim() !== ''}
          >
            <option value="">Toutes les collections</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.location ? `(${c.location})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="filter-type">Type</label>
          <select
            id="filter-type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Tous les types</option>
            <option value="book">Livre</option>
            <option value="bd">BD</option>
            <option value="manga">Manga</option>
            <option value="comic">Comic book</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="sort-by">Trier par</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="title">Titre</option>
            <option value="author">Auteur</option>
            <option value="date">Date d&apos;ajout</option>
          </select>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSaveBook} className="card book-form">
          <h3>{editingBook ? 'Modifier le livre' : 'Nouveau livre'}</h3>
          <div className="form-top-layout">
            <div className="form-cover-col">
              <CoverPicker
                currentCoverUrl={
                  formRemoveCover
                    ? null
                    : (formCoverDataUrl ?? formCoverSourceUrl)
                }
                onCoverChange={(sel) => {
                  if (sel.removeCover) {
                    setFormCoverDataUrl(null);
                    setFormCoverSourceUrl(null);
                    setFormRemoveCover(true);
                  } else if (sel.coverDataUrl) {
                    setFormCoverDataUrl(sel.coverDataUrl);
                    setFormCoverSourceUrl(null);
                    setFormRemoveCover(false);
                  }
                }}
              />
            </div>

            <div className="form-fields-col">
              <div className="field">
                <label htmlFor="book-title">Titre *</label>
                <input
                  id="book-title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="book-subtitle">Sous-titre / Série &amp; Tome</label>
                <input
                  id="book-subtitle"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                />
              </div>
              <div className="field-row-2">
                <div className="field">
                  <label htmlFor="book-publisher">Maison d&apos;édition</label>
                  <input
                    id="book-publisher"
                    value={formPublisher}
                    onChange={(e) => setFormPublisher(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="book-type">Type *</label>
                  <select
                    id="book-type"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as BookType)}
                  >
                    <option value="book">Livre</option>
                    <option value="bd">BD</option>
                    <option value="manga">Manga</option>
                    <option value="comic">Comic book</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="book-isbn">ISBN</label>
                <input
                  id="book-isbn"
                  value={formIsbn}
                  onChange={(e) => setFormIsbn(e.target.value)}
                />
              </div>
            </div>
          </div>

          <fieldset className="authors-fieldset">
            <legend>Auteurs *</legend>
            {formAuthors.map((author, idx) => (
              <div key={idx} className="author-row">
                <input
                  aria-label={`Nom de l'auteur ${idx + 1}`}
                  placeholder="Nom de l'auteur"
                  value={author.name}
                  onChange={(e) => {
                    const copy = [...formAuthors];
                    copy[idx] = { ...copy[idx], name: e.target.value };
                    setFormAuthors(copy);
                  }}
                />
                <select
                  aria-label={`Rôle de l'auteur ${idx + 1}`}
                  value={author.role}
                  onChange={(e) => {
                    const copy = [...formAuthors];
                    copy[idx] = {
                      ...copy[idx],
                      role: e.target.value as AuthorRole,
                    };
                    setFormAuthors(copy);
                  }}
                >
                  <option value="author">Auteur</option>
                  <option value="writer">Scénariste</option>
                  <option value="illustrator">Dessinateur</option>
                </select>
                {formAuthors.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() =>
                      setFormAuthors(formAuthors.filter((_, i) => i !== idx))
                    }
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() =>
                setFormAuthors([...formAuthors, { name: '', role: 'author' }])
              }
            >
              + Ajouter un auteur
            </button>
          </fieldset>

          <fieldset className="collections-fieldset">
            <legend>Collections *</legend>
            <div className="collections-checks">
              {collections.map((c) => (
                <label key={c.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formCollectionIds.includes(c.id)}
                    onChange={() => toggleCollectionInForm(c.id)}
                  />
                  {c.name} {c.location ? `(${c.location})` : ''}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="card-actions">
            <button type="submit" className="btn btn-primary">
              Enregistrer le livre
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowForm(false)}
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {movingBook && (
        <form onSubmit={handleMoveSubmit} className="card move-form">
          <h3>Déplacer « {movingBook.title} »</h3>
          <div className="field">
            <label htmlFor="move-from">Depuis la collection</label>
            <select
              id="move-from"
              value={moveFromId}
              onChange={(e) => setMoveFromId(Number(e.target.value))}
            >
              {movingBook.collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.location ? `(${c.location})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="move-to">Vers la collection</label>
            <select
              id="move-to"
              value={moveToId}
              onChange={(e) => setMoveToId(Number(e.target.value))}
            >
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.location ? `(${c.location})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="card-actions">
            <button type="submit" className="btn btn-primary">
              Valider le déplacement
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setMovingBook(null)}
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="books-list">
        {books.length === 0 ? (
          <p className="empty-state">Aucun livre n&apos;a été trouvé.</p>
        ) : (
          books.map((book) => (
            <article key={book.id} className="card book-card">
              <div className="book-card-layout">
                <div className="book-cover-thumb-wrap">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={`Couverture de ${book.title}`}
                      className="book-cover-thumb"
                    />
                  ) : (
                    <div
                      className="book-cover-placeholder"
                      aria-label="Pas de couverture"
                    >
                      📚
                    </div>
                  )}
                </div>
                <div className="book-main">
                  <div className="book-title-row">
                    <h3>{book.title}</h3>
                    <span className="badge badge-type">
                      {BOOK_TYPE_LABELS[book.type]}
                    </span>
                  </div>
                  {book.subtitle && (
                    <p className="book-subtitle">{book.subtitle}</p>
                  )}
                  <p className="book-authors">
                    {book.authors.map((a, i) => (
                      <span key={i} className="author-chip">
                        {a.name} <em>({AUTHOR_ROLE_LABELS[a.role]})</em>
                        {i < book.authors.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </p>
                  {(book.publisher || book.isbn13) && (
                    <p className="book-meta-line">
                      {book.publisher && (
                        <span className="book-publisher">
                          Éditeur : {book.publisher}
                        </span>
                      )}
                      {book.publisher && book.isbn13 && ' · '}
                      {book.isbn13 && (
                        <span className="book-isbn">ISBN : {book.isbn13}</span>
                      )}
                    </p>
                  )}
                  <div className="book-footer-row">
                    <div className="book-collections">
                      {book.collections.map((c) => (
                        <span key={c.id} className="badge badge-collection">
                          {c.name}
                          {c.location ? ` — ${c.location}` : ''}
                        </span>
                      ))}
                    </div>
                    {(canEditBooks || canDeleteBooks) && (
                      <div className="card-actions book-item-actions">
                        {canEditBooks && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEditForm(book)}
                          >
                            Modifier
                          </button>
                        )}
                        {canEditBooks && collections.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => startMove(book)}
                          >
                            Déplacer
                          </button>
                        )}
                        {canDeleteBooks &&
                          (confirmDeleteId === book.id ? (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleConfirmDelete(book.id)}
                            >
                              Confirmer la suppression
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-ghost-danger btn-sm"
                              onClick={() => setConfirmDeleteId(book.id)}
                            >
                              Supprimer
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
