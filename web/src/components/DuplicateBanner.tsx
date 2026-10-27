import React from 'react';
import { BookDto, DuplicateCheckResult } from '../api';

export interface DuplicateBannerProps {
  duplicates: DuplicateCheckResult | null;
  selectedCollectionId: number | null;
  onAttachExistingBook?: (bookId: number) => void;
}

function formatCollections(book: BookDto): string {
  return book.collections
    .map((c) => (c.location ? `${c.name} (${c.location})` : c.name))
    .join(', ');
}

export function DuplicateBanner({
  duplicates,
  selectedCollectionId,
  onAttachExistingBook,
}: DuplicateBannerProps) {
  if (!duplicates) return null;

  const { sameIsbn, otherEditions } = duplicates;

  if (sameIsbn.length > 0) {
    const primaryBook = sameIsbn[0];
    const alreadyInSelected =
      selectedCollectionId !== null &&
      primaryBook.collections.some((c) => c.id === selectedCollectionId);

    return (
      <div role="status" className="duplicate-banner banner-owned">
        <strong>Vous possédez déjà ce livre</strong>
        <ul className="duplicate-list">
          {sameIsbn.map((b) => (
            <li key={b.id}>
              <span className="dup-title">
                {b.title}
                {b.subtitle ? ` — ${b.subtitle}` : ''}
              </span>{' '}
              — Collection(s) : <strong>{formatCollections(b)}</strong>
            </li>
          ))}
        </ul>
        {!alreadyInSelected &&
          selectedCollectionId !== null &&
          onAttachExistingBook && (
            <div className="duplicate-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onAttachExistingBook(primaryBook.id)}
              >
                Ajouter ce livre existant à la collection sélectionnée
              </button>
            </div>
          )}
      </div>
    );
  }

  if (otherEditions.length > 0) {
    return (
      <div role="status" className="duplicate-banner banner-edition">
        <strong>Vous possédez ce titre dans une autre édition</strong>
        <ul className="duplicate-list">
          {otherEditions.map((b) => (
            <li key={b.id}>
              <span className="dup-title">
                {b.title}
                {b.subtitle ? ` — ${b.subtitle}` : ''}
              </span>{' '}
              {b.isbn13 ? `(ISBN : ${b.isbn13}) ` : ''}— Collection(s) :{' '}
              <strong>{formatCollections(b)}</strong>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div role="status" className="duplicate-banner banner-clear">
      <strong>Vous ne possédez pas encore ce livre</strong> — prêt à être ajouté.
    </div>
  );
}
