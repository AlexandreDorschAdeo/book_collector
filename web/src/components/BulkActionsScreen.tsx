import React, { useEffect, useRef, useState } from 'react';
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

export interface BulkActionsScreenProps {
  collections: CollectionDto[];
  onCollectionsChanged: () => Promise<void>;
}

export function BulkActionsScreen({
  collections,
  onCollectionsChanged,
}: BulkActionsScreenProps) {
  const [books, setBooks] = useState<BookDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [collectionFilter, setCollectionFilter] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Bulk Move modal state
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveFromId, setMoveFromId] = useState<number | null>(null);
  const [moveToId, setMoveToId] = useState<number>(0);

  // Bulk Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [applyType, setApplyType] = useState(false);
  const [bulkType, setBulkType] = useState<BookType>('book');
  const [applyPublisher, setApplyPublisher] = useState(false);
  const [bulkPublisher, setBulkPublisher] = useState('');
  const [applySubtitle, setApplySubtitle] = useState(false);
  const [bulkSubtitle, setBulkSubtitle] = useState('');
  const [applySeries, setApplySeries] = useState(false);
  const [bulkSeries, setBulkSeries] = useState('');
  const [bulkAutoExtractVolume, setBulkAutoExtractVolume] = useState(true);
  const [knownSeriesNames, setKnownSeriesNames] = useState<string[]>([]);
  const [applyAuthors, setApplyAuthors] = useState(false);
  const [bulkAuthors, setBulkAuthors] = useState<BookAuthor[]>([
    { name: '', role: 'author' },
  ]);
  const [applyCollections, setApplyCollections] = useState(false);
  const [bulkCollectionIds, setBulkCollectionIds] = useState<number[]>([]);

  const moveToSelectRef = useRef<HTMLSelectElement | null>(null);
  const editFirstCheckRef = useRef<HTMLInputElement | null>(null);

  const loadBooks = async () => {
    try {
      const list = await api.getBooks({
        collectionId:
          searchQuery.trim() !== ''
            ? undefined
            : (collectionFilter ?? undefined),
        type: typeFilter || undefined,
        sort: 'title',
        q: searchQuery.trim() || undefined,
      });
      setBooks(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    }
  };

  useEffect(() => {
    loadBooks();
  }, [collectionFilter, typeFilter, searchQuery]);

  useEffect(() => {
    api
      .getSeries()
      .then((list) => setKnownSeriesNames(list.map((s) => s.name)))
      .catch(() => {});
  }, [books]);

  useEffect(() => {
    if (showMoveModal) {
      moveToSelectRef.current?.focus();
    }
  }, [showMoveModal]);

  useEffect(() => {
    if (showEditModal) {
      editFirstCheckRef.current?.focus();
    }
  }, [showEditModal]);

  useEffect(() => {
    if (!showMoveModal && !showEditModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMoveModal(false);
        setShowEditModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showMoveModal, showEditModal]);

  const toggleBookSelection = (bookId: number) => {
    setSelectedBookIds((prev) =>
      prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId],
    );
  };

  const allVisibleSelected =
    books.length > 0 && books.every((b) => selectedBookIds.includes(b.id));

  const handleToggleSelectAll = () => {
    if (allVisibleSelected) {
      const visibleSet = new Set(books.map((b) => b.id));
      setSelectedBookIds((prev) => prev.filter((id) => !visibleSet.has(id)));
    } else {
      const merged = new Set([
        ...selectedBookIds,
        ...books.map((b) => b.id),
      ]);
      setSelectedBookIds(Array.from(merged));
    }
  };

  const openBulkMoveModal = () => {
    setError(null);
    setSuccessMessage(null);
    const defaultFrom = collectionFilter ?? collections[0]?.id ?? null;
    const defaultTo =
      collections.find((c) => c.id !== defaultFrom)?.id ??
      collections[0]?.id ??
      0;
    setMoveFromId(defaultFrom);
    setMoveToId(defaultTo);
    setShowMoveModal(true);
  };

  const handleBulkMoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await api.bulkMoveBooks({
        bookIds: selectedBookIds,
        fromCollectionId: moveFromId,
        toCollectionId: moveToId,
      });
      setShowMoveModal(false);
      setSelectedBookIds([]);
      setSuccessMessage(`${res.updatedCount} livre(s) déplacé(s) avec succès.`);
      await loadBooks();
      await onCollectionsChanged();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur lors du déplacement en lot',
      );
    }
  };

  const openBulkEditModal = () => {
    setError(null);
    setSuccessMessage(null);
    setApplyType(false);
    setBulkType('book');
    setApplyPublisher(false);
    setBulkPublisher('');
    setApplySubtitle(false);
    setBulkSubtitle('');
    setApplySeries(false);
    setBulkSeries('');
    setBulkAutoExtractVolume(true);
    setApplyAuthors(false);
    setBulkAuthors([{ name: '', role: 'author' }]);
    setApplyCollections(false);
    setBulkCollectionIds(collections[0] ? [collections[0].id] : []);
    setShowEditModal(true);
  };

  const toggleBulkCollection = (cid: number) => {
    setBulkCollectionIds((prev) =>
      prev.includes(cid) ? prev.filter((id) => id !== cid) : [...prev, cid],
    );
  };

  const handleBulkEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (
      !applyType &&
      !applyPublisher &&
      !applySubtitle &&
      !applySeries &&
      !applyAuthors &&
      !applyCollections
    ) {
      setError('Veuillez cocher au moins un champ à appliquer.');
      return;
    }

    const fields: Parameters<typeof api.bulkUpdateBooks>[0]['fields'] = {};
    if (applyType) {
      fields.type = bulkType;
    }
    if (applyPublisher) {
      fields.publisher = bulkPublisher.trim() || null;
    }
    if (applySubtitle) {
      fields.subtitle = bulkSubtitle.trim() || null;
    }
    if (applySeries) {
      fields.series = bulkSeries.trim() || null;
      fields.autoExtractVolume = bulkAutoExtractVolume;
    }
    if (applyAuthors) {
      const validAuthors = bulkAuthors
        .map((a) => ({ name: a.name.trim(), role: a.role }))
        .filter((a) => a.name !== '');
      if (validAuthors.length === 0) {
        setError('Au moins un auteur valide est requis.');
        return;
      }
      fields.authors = validAuthors;
    }
    if (applyCollections) {
      if (bulkCollectionIds.length === 0) {
        setError('Veuillez sélectionner au moins une collection.');
        return;
      }
      fields.collectionIds = bulkCollectionIds;
    }

    try {
      const res = await api.bulkUpdateBooks({
        bookIds: selectedBookIds,
        fields,
      });
      setShowEditModal(false);
      setSelectedBookIds([]);
      setSuccessMessage(`${res.updatedCount} livre(s) modifié(s) avec succès.`);
      await loadBooks();
      await onCollectionsChanged();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la modification en lot',
      );
    }
  };

  return (
    <section className="screen-section">
      <div className="catalog-header">
        <h2>Actions groupées</h2>
      </div>

      {error && !showMoveModal && !showEditModal && (
        <div role="alert" className="alert alert-error">
          {error}
        </div>
      )}

      {successMessage && (
        <div role="status" className="alert alert-success">
          {successMessage}
        </div>
      )}

      <div className="card filters-bar">
        <div className="field search-field">
          <label htmlFor="bulk-search">Rechercher des livres</label>
          <input
            id="bulk-search"
            type="search"
            placeholder="Titre, auteur, éditeur, ISBN…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="bulk-filter-collection">Collection</label>
          <select
            id="bulk-filter-collection"
            value={collectionFilter ?? ''}
            onChange={(e) =>
              setCollectionFilter(
                e.target.value ? Number(e.target.value) : null,
              )
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
          <label htmlFor="bulk-filter-type">Type</label>
          <select
            id="bulk-filter-type"
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
      </div>

      <div className="card bulk-toolbar">
        <div className="bulk-selection-info">
          <span className="badge badge-type">
            {selectedBookIds.length} livre(s) sélectionné(s)
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleToggleSelectAll}
            disabled={books.length === 0}
          >
            {allVisibleSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
          </button>
          {selectedBookIds.length > 0 && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedBookIds([])}
            >
              Effacer la sélection
            </button>
          )}
        </div>

        <div className="card-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={selectedBookIds.length === 0 || collections.length === 0}
            onClick={openBulkMoveModal}
          >
            Déplacer la sélection
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={selectedBookIds.length === 0}
            onClick={openBulkEditModal}
          >
            Modifier la sélection
          </button>
        </div>
      </div>

      {showMoveModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowMoveModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Déplacer la sélection en lot"
            className="card modal-dialog modal-dialog-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Déplacer {selectedBookIds.length} livre(s)</h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm modal-close-btn"
                aria-label="Fermer la fenêtre"
                onClick={() => setShowMoveModal(false)}
              >
                ✕
              </button>
            </div>
            {error && (
              <div role="alert" className="alert alert-error">
                {error}
              </div>
            )}
            <form onSubmit={handleBulkMoveSubmit} className="move-form">
              <div className="field">
                <label htmlFor="bulk-move-from">Depuis la collection</label>
                <select
                  id="bulk-move-from"
                  value={moveFromId ?? ''}
                  onChange={(e) =>
                    setMoveFromId(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                >
                  <option value="">
                    Ne retirer d&apos;aucune collection (ajouter uniquement)
                  </option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.location ? `(${c.location})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="bulk-move-to">Vers la collection</label>
                <select
                  id="bulk-move-to"
                  ref={moveToSelectRef}
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
                  Valider le déplacement en lot
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowMoveModal(false)}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowEditModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Modifier la sélection en lot"
            className="card modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Modifier {selectedBookIds.length} livre(s) en lot</h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm modal-close-btn"
                aria-label="Fermer la fenêtre"
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>
            {error && (
              <div role="alert" className="alert alert-error">
                {error}
              </div>
            )}
            <p className="book-meta-line">
              Cochez uniquement les champs que vous souhaitez appliquer à tous
              les livres sélectionnés. Les autres données de chaque livre seront
              conservées.
            </p>
            <form onSubmit={handleBulkEditSubmit} className="book-form">
              <div className="bulk-field-group">
                <label className="checkbox-label">
                  <input
                    ref={editFirstCheckRef}
                    type="checkbox"
                    checked={applyType}
                    onChange={(e) => setApplyType(e.target.checked)}
                  />
                  <strong>Appliquer le type</strong>
                </label>
                {applyType && (
                  <div className="field">
                    <label htmlFor="bulk-edit-type">Type à appliquer</label>
                    <select
                      id="bulk-edit-type"
                      value={bulkType}
                      onChange={(e) => setBulkType(e.target.value as BookType)}
                    >
                      <option value="book">Livre</option>
                      <option value="bd">BD</option>
                      <option value="manga">Manga</option>
                      <option value="comic">Comic book</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="bulk-field-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={applyPublisher}
                    onChange={(e) => setApplyPublisher(e.target.checked)}
                  />
                  <strong>Appliquer la maison d&apos;édition</strong>
                </label>
                {applyPublisher && (
                  <div className="field">
                    <label htmlFor="bulk-edit-publisher">
                      Maison d&apos;édition à appliquer
                    </label>
                    <input
                      id="bulk-edit-publisher"
                      value={bulkPublisher}
                      onChange={(e) => setBulkPublisher(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="bulk-field-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={applySeries}
                    onChange={(e) => setApplySeries(e.target.checked)}
                  />
                  <strong>Appliquer la série</strong>
                </label>
                {applySeries && (
                  <>
                    <div className="field">
                      <label htmlFor="bulk-edit-series">
                        Série à appliquer (laisser vide pour dissocier de la série)
                      </label>
                      <input
                        id="bulk-edit-series"
                        list="bulk-series-datalist"
                        value={bulkSeries}
                        onChange={(e) => setBulkSeries(e.target.value)}
                        placeholder="Ex : One Piece, Astérix…"
                      />
                      <datalist id="bulk-series-datalist">
                        {knownSeriesNames.map((name) => (
                          <option key={name} value={name} />
                        ))}
                      </datalist>
                    </div>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={bulkAutoExtractVolume}
                        onChange={(e) =>
                          setBulkAutoExtractVolume(e.target.checked)
                        }
                      />
                      Extraire automatiquement le N° de tome depuis le titre ou
                      le sous-titre (ex : « Tome 12 », « T. 3 »)
                    </label>
                  </>
                )}
              </div>

              <div className="bulk-field-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={applySubtitle}
                    onChange={(e) => setApplySubtitle(e.target.checked)}
                  />
                  <strong>Appliquer le sous-titre</strong>
                </label>
                {applySubtitle && (
                  <div className="field">
                    <label htmlFor="bulk-edit-subtitle">
                      Sous-titre à appliquer
                    </label>
                    <input
                      id="bulk-edit-subtitle"
                      value={bulkSubtitle}
                      onChange={(e) => setBulkSubtitle(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="bulk-field-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={applyAuthors}
                    onChange={(e) => setApplyAuthors(e.target.checked)}
                  />
                  <strong>Appliquer les auteurs</strong>
                </label>
                {applyAuthors && (
                  <fieldset className="authors-fieldset">
                    <legend>Auteurs à appliquer</legend>
                    {bulkAuthors.map((author, idx) => (
                      <div key={idx} className="author-row">
                        <input
                          aria-label={`Nom de l'auteur en lot ${idx + 1}`}
                          placeholder="Nom de l'auteur"
                          value={author.name}
                          onChange={(e) => {
                            const copy = [...bulkAuthors];
                            copy[idx] = {
                              ...copy[idx],
                              name: e.target.value,
                            };
                            setBulkAuthors(copy);
                          }}
                        />
                        <select
                          aria-label={`Rôle de l'auteur en lot ${idx + 1}`}
                          value={author.role}
                          onChange={(e) => {
                            const copy = [...bulkAuthors];
                            copy[idx] = {
                              ...copy[idx],
                              role: e.target.value as AuthorRole,
                            };
                            setBulkAuthors(copy);
                          }}
                        >
                          <option value="author">Auteur</option>
                          <option value="writer">Scénariste</option>
                          <option value="illustrator">Dessinateur</option>
                        </select>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() =>
                        setBulkAuthors([
                          ...bulkAuthors,
                          { name: '', role: 'author' },
                        ])
                      }
                    >
                      + Ajouter un auteur
                    </button>
                  </fieldset>
                )}
              </div>

              <div className="bulk-field-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={applyCollections}
                    onChange={(e) => setApplyCollections(e.target.checked)}
                  />
                  <strong>Appliquer les collections</strong>
                </label>
                {applyCollections && (
                  <fieldset className="collections-fieldset">
                    <legend>Collections à appliquer</legend>
                    <div className="collections-checks">
                      {collections.map((c) => (
                        <label key={c.id} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={bulkCollectionIds.includes(c.id)}
                            onChange={() => toggleBulkCollection(c.id)}
                          />
                          {c.name} {c.location ? `(${c.location})` : ''}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}
              </div>

              <div className="card-actions">
                <button type="submit" className="btn btn-primary">
                  Appliquer les modifications
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="books-list">
        {books.length === 0 ? (
          <p className="empty-state">Aucun livre n&apos;a été trouvé.</p>
        ) : (
          books.map((book) => {
            const isSelected = selectedBookIds.includes(book.id);
            return (
              <article
                key={book.id}
                className={`card book-card bulk-book-card ${isSelected ? 'selected' : ''}`}
              >
                <div className="book-card-layout">
                  <label className="bulk-check-wrap">
                    <input
                      type="checkbox"
                      aria-label={`Sélectionner ${book.title}`}
                      checked={isSelected}
                      onChange={() => toggleBookSelection(book.id)}
                    />
                  </label>
                  <div className="book-main">
                    <div className="book-title-row">
                      <h3>{book.title}</h3>
                      <div className="book-badges-inline">
                        {book.series && (
                          <span className="badge badge-series">
                            📚 {book.series}
                            {book.volumeNumber != null
                              ? ` — Tome ${book.volumeNumber}`
                              : ''}
                          </span>
                        )}
                        <span className="badge badge-type">
                          {BOOK_TYPE_LABELS[book.type]}
                        </span>
                      </div>
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
                    {book.publisher && (
                      <p className="book-meta-line">
                        <span className="book-publisher">
                          Éditeur : {book.publisher}
                        </span>
                      </p>
                    )}
                    <div className="book-collections">
                      {book.collections.map((c) => (
                        <span key={c.id} className="badge badge-collection">
                          {c.name}
                          {c.location ? ` — ${c.location}` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
