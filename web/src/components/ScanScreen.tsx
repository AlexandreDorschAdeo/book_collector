import React, { useEffect, useState } from 'react';
import {
  api,
  AuthorRole,
  BookAuthor,
  BookType,
  CollectionDto,
  CoverCandidate,
  DuplicateCheckResult,
} from '../api';
import { BarcodeScanner } from './BarcodeScanner';
import { CoverPicker } from './CoverPickerModal';
import { DuplicateBanner } from './DuplicateBanner';

export interface ScanScreenProps {
  collections: CollectionDto[];
  onBookAdded: () => Promise<void>;
}

export function ScanScreen({ collections, onBookAdded }: ScanScreenProps) {
  const [targetCollectionId, setTargetCollectionId] = useState<number | null>(
    collections[0]?.id ?? null,
  );
  const [isbn, setIsbn] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [publisher, setPublisher] = useState('');
  const [coverDataUrl, setCoverDataUrl] = useState<string | null>(null);
  const [coverSourceUrl, setCoverSourceUrl] = useState<string | null>(null);
  const [type, setType] = useState<BookType>('book');
  const [authors, setAuthors] = useState<BookAuthor[]>([
    { name: '', role: 'author' },
  ]);
  const [duplicates, setDuplicates] = useState<DuplicateCheckResult | null>(
    null,
  );
  const [lookupStatus, setLookupStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmDuplicateCopy, setConfirmDuplicateCopy] = useState(false);
  const [analyzingCover, setAnalyzingCover] = useState(false);
  const [coverCandidates, setCoverCandidates] = useState<CoverCandidate[]>([]);
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState<number>(0);

  useEffect(() => {
    if (targetCollectionId === null && collections.length > 0) {
      setTargetCollectionId(collections[0].id);
    }
  }, [collections, targetCollectionId]);

  const resetBookFieldsKeepCollection = () => {
    setIsbn('');
    setTitle('');
    setSubtitle('');
    setPublisher('');
    setCoverDataUrl(null);
    setCoverSourceUrl(null);
    setAuthors([{ name: '', role: 'author' }]);
    setDuplicates(null);
    setLookupStatus(null);
    setConfirmDuplicateCopy(false);
    setCoverCandidates([]);
    setSelectedCandidateIndex(0);
  };

  const applyCoverCandidate = (cand: CoverCandidate, index: number) => {
    setSelectedCandidateIndex(index);
    setConfirmDuplicateCopy(false);
    setTitle(cand.title);
    setSubtitle(cand.subtitle ?? '');
    setPublisher(cand.publisher ?? '');
    if (cand.isbn13) {
      setIsbn(cand.isbn13);
    }
    setType(cand.type);
    setAuthors(
      cand.authors.length > 0 ? cand.authors : [{ name: '', role: 'author' }],
    );
    setDuplicates(cand.duplicates);
  };

  const handleAnalyzeCover = async (dataUrl: string) => {
    setError(null);
    setSuccessMessage(null);
    setConfirmDuplicateCopy(false);
    setAnalyzingCover(true);
    setLookupStatus('Analyse de la couverture et recherche bibliographique…');

    try {
      const res = await api.lookupCover(dataUrl);
      setCoverCandidates(res.candidates);
      if (res.bestMatch) {
        applyCoverCandidate(res.bestMatch, 0);
        setLookupStatus(
          res.candidates.length > 1
            ? `Livre identifié depuis la couverture (${res.candidates.length} propositions disponibles).`
            : 'Livre identifié depuis la couverture. Vérifiez et validez.',
        );
      } else {
        setLookupStatus(
          'Aucune correspondance trouvée à partir de cette couverture. Complétez les champs manuellement.',
        );
      }
    } catch (err) {
      setLookupStatus(null);
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'analyser cette couverture.",
      );
    } finally {
      setAnalyzingCover(false);
    }
  };

  const handleIsbnDetected = async (detectedIsbn: string) => {
    setError(null);
    setSuccessMessage(null);
    setConfirmDuplicateCopy(false);
    setLookupStatus('Recherche des métadonnées…');

    try {
      const res = await api.lookupIsbn(detectedIsbn);
      setIsbn(res.isbn13);
      setDuplicates(res.duplicates);
      if (res.found && res.metadata) {
        setTitle(res.metadata.title);
        setSubtitle(res.metadata.subtitle ?? '');
        setPublisher(res.metadata.publisher ?? '');
        setCoverDataUrl(null);
        setCoverSourceUrl(res.metadata.coverUrl ?? null);
        setAuthors(
          res.metadata.authors.length > 0
            ? res.metadata.authors
            : [{ name: '', role: 'author' }],
        );
        setLookupStatus('Métadonnées récupérées. Vérifiez et validez.');
      } else {
        setTitle('');
        setSubtitle('');
        setPublisher('');
        setCoverDataUrl(null);
        setCoverSourceUrl(null);
        setAuthors([{ name: '', role: 'author' }]);
        setLookupStatus(
          'Livre introuvable dans les bases publiques. Complétez les champs manuellement.',
        );
      }
    } catch (err) {
      setLookupStatus(null);
      setError(err instanceof Error ? err.message : 'ISBN invalide');
    }
  };

  const handleManualDuplicateCheck = async () => {
    const validAuthors = authors
      .map((a) => ({ name: a.name.trim(), role: a.role }))
      .filter((a) => a.name !== '');
    if (!title.trim() && !isbn.trim()) return;
    try {
      const res = await api.checkDuplicates({
        isbn: isbn.trim() || undefined,
        title: title.trim() || undefined,
        subtitle: subtitle.trim() || undefined,
        authors: validAuthors,
      });
      setDuplicates(res);
    } catch {
      // ignore manual check error
    }
  };

  const handleAttachExisting = async (bookId: number) => {
    if (!targetCollectionId) return;
    setError(null);
    try {
      await api.attachBookToCollection(bookId, targetCollectionId);
      await onBookAdded();
      resetBookFieldsKeepCollection();
      setSuccessMessage(
        'Livre rattaché à la collection sélectionnée ! Prêt pour le scan suivant.',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de rattachement');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!targetCollectionId) {
      setError("Veuillez d'abord créer ou sélectionner une collection.");
      return;
    }

    const validAuthors = authors
      .map((a) => ({ name: a.name.trim(), role: a.role }))
      .filter((a) => a.name !== '');

    if (!title.trim()) {
      setError('Le titre est obligatoire.');
      return;
    }
    if (validAuthors.length === 0) {
      setError('Au moins un auteur est obligatoire.');
      return;
    }

    if (
      duplicates &&
      duplicates.sameIsbn.length > 0 &&
      !confirmDuplicateCopy
    ) {
      setConfirmDuplicateCopy(true);
      return;
    }

    try {
      await api.createBook({
        isbn: isbn.trim() || null,
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        publisher: publisher.trim() || null,
        coverDataUrl: coverDataUrl || null,
        coverSourceUrl: coverDataUrl ? null : (coverSourceUrl || null),
        authors: validAuthors,
        type,
        collectionIds: [targetCollectionId],
      });
      await onBookAdded();
      resetBookFieldsKeepCollection();
      setSuccessMessage(
        'Livre ajouté à la collection ! Prêt pour le scan suivant.',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'ajout");
    }
  };

  return (
    <section className="screen-section">
      <h2>Ajouter un livre</h2>

      <div className="card">
        <div className="field">
          <label htmlFor="scan-target-collection">
            Collection de destination *
          </label>
          <select
            id="scan-target-collection"
            value={targetCollectionId ?? ''}
            onChange={(e) =>
              setTargetCollectionId(
                e.target.value ? Number(e.target.value) : null,
              )
            }
          >
            {collections.length === 0 ? (
              <option value="">Aucune collection disponible</option>
            ) : (
              collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.location ? `(${c.location})` : ''}
                </option>
              ))
            )}
          </select>
        </div>

        <BarcodeScanner onDetected={handleIsbnDetected} />
      </div>

      {error && (
        <div role="alert" className="alert alert-error">
          {error}
        </div>
      )}

      {successMessage && (
        <div role="status" className="alert alert-success">
          {successMessage}
        </div>
      )}

      {lookupStatus && <p className="lookup-status">{lookupStatus}</p>}

      {coverCandidates.length > 1 && (
        <div
          className="card cover-candidates"
          aria-label="Propositions issues de la couverture"
        >
          <p className="cover-candidates-title">
            Propositions trouvées à partir de la couverture :
          </p>
          <div className="cover-candidates-list">
            {coverCandidates.map((cand, idx) => (
              <button
                key={`${cand.isbn13 ?? cand.title}-${idx}`}
                type="button"
                className={
                  idx === selectedCandidateIndex
                    ? 'btn btn-primary btn-sm'
                    : 'btn btn-secondary btn-sm'
                }
                onClick={() => applyCoverCandidate(cand, idx)}
              >
                {cand.title}
                {cand.subtitle ? ` — ${cand.subtitle}` : ''}
                {cand.publisher ? ` (${cand.publisher})` : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      <DuplicateBanner
        duplicates={duplicates}
        selectedCollectionId={targetCollectionId}
        onAttachExistingBook={handleAttachExisting}
      />

      <form onSubmit={handleSubmit} className="card book-form">
        <div className="form-top-layout">
          <div className="form-cover-col">
            <CoverPicker
              currentCoverUrl={coverDataUrl ?? coverSourceUrl}
              analyzingCover={analyzingCover}
              onAnalyzeCover={handleAnalyzeCover}
              onCoverChange={(sel) => {
                if (sel.removeCover) {
                  setCoverDataUrl(null);
                  setCoverSourceUrl(null);
                  setCoverCandidates([]);
                } else if (sel.coverDataUrl) {
                  setCoverDataUrl(sel.coverDataUrl);
                  setCoverSourceUrl(null);
                  if (!title.trim()) {
                    void handleAnalyzeCover(sel.coverDataUrl);
                  }
                }
              }}
            />
          </div>

          <div className="form-fields-col">
            <div className="field">
              <label htmlFor="scan-title">Titre *</label>
              <input
                id="scan-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleManualDuplicateCheck}
              />
            </div>

            <div className="field">
              <label htmlFor="scan-subtitle">Sous-titre / Série &amp; Tome</label>
              <input
                id="scan-subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                onBlur={handleManualDuplicateCheck}
              />
            </div>

            <div className="field-row-2">
              <div className="field">
                <label htmlFor="scan-publisher">Maison d&apos;édition</label>
                <input
                  id="scan-publisher"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  placeholder="Optionnel"
                />
              </div>

              <div className="field">
                <label htmlFor="scan-type">Type *</label>
                <select
                  id="scan-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as BookType)}
                >
                  <option value="book">Livre</option>
                  <option value="bd">BD</option>
                  <option value="manga">Manga</option>
                  <option value="comic">Comic book</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="scan-isbn">ISBN-13</label>
              <input
                id="scan-isbn"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="Optionnel"
              />
            </div>
          </div>
        </div>

        <fieldset className="authors-fieldset">
          <legend>Auteurs *</legend>
          {authors.map((author, idx) => (
            <div key={idx} className="author-row">
              <input
                aria-label={`Auteur ${idx + 1}`}
                placeholder="Nom de l'auteur"
                value={author.name}
                onChange={(e) => {
                  const copy = [...authors];
                  copy[idx] = { ...copy[idx], name: e.target.value };
                  setAuthors(copy);
                }}
                onBlur={handleManualDuplicateCheck}
              />
              <select
                aria-label={`Rôle ${idx + 1}`}
                value={author.role}
                onChange={(e) => {
                  const copy = [...authors];
                  copy[idx] = {
                    ...copy[idx],
                    role: e.target.value as AuthorRole,
                  };
                  setAuthors(copy);
                }}
              >
                <option value="author">Auteur</option>
                <option value="writer">Scénariste</option>
                <option value="illustrator">Dessinateur</option>
              </select>
              {authors.length > 1 && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    setAuthors(authors.filter((_, i) => i !== idx))
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
              setAuthors([...authors, { name: '', role: 'author' }])
            }
          >
            + Ajouter un auteur
          </button>
        </fieldset>

        <div className="card-actions form-submit-bar">
          {confirmDuplicateCopy ? (
            <button type="submit" className="btn btn-warning">
              Confirmer l&apos;ajout d&apos;un exemplaire supplémentaire
            </button>
          ) : (
            <button type="submit" className="btn btn-primary">
              Ajouter à la collection
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
