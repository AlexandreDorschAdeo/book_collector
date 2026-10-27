import React, { useState } from 'react';
import { api, CollectionDto } from '../api';

export interface CollectionsScreenProps {
  collections: CollectionDto[];
  onRefresh: () => Promise<void>;
  onSelectCollection: (collectionId: number) => void;
  canAddBooks?: boolean;
  canEditBooks?: boolean;
  canDeleteBooks?: boolean;
}

export function CollectionsScreen({
  collections,
  onRefresh,
  onSelectCollection,
  canAddBooks = true,
  canEditBooks = true,
  canDeleteBooks = true,
}: CollectionsScreenProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Le nom de la collection est obligatoire.');
      return;
    }
    try {
      await api.createCollection({
        name: name.trim(),
        location: location.trim(),
      });
      setName('');
      setLocation('');
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    }
  };

  const startEdit = (col: CollectionDto) => {
    setEditingId(col.id);
    setEditName(col.name);
    setEditLocation(col.location);
    setError(null);
  };

  const handleUpdate = async (e: React.FormEvent, id: number) => {
    e.preventDefault();
    setError(null);
    if (!editName.trim()) {
      setError('Le nom de la collection est obligatoire.');
      return;
    }
    try {
      await api.updateCollection(id, {
        name: editName.trim(),
        location: editLocation.trim(),
      });
      setEditingId(null);
      await onRefresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur lors de la modification',
      );
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      await api.deleteCollection(id);
      await onRefresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur lors de la suppression',
      );
    }
  };

  return (
    <section className="screen-section">
      <h2>Mes Collections</h2>

      {error && (
        <div role="alert" className="alert alert-error">
          {error}
        </div>
      )}

      {(canAddBooks || canEditBooks) && (
        <form onSubmit={handleCreate} className="card form-grid">
          <h3>Nouvelle collection</h3>
          <div className="field">
            <label htmlFor="col-name">Nom de la collection *</label>
            <input
              id="col-name"
              type="text"
              placeholder="Ex. BD, Mangas, Romans"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="col-location">Lieu</label>
            <input
              id="col-location"
              type="text"
              placeholder="Ex. Salon, Maison de campagne"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Créer la collection
          </button>
        </form>
      )}

      <div className="collections-grid">
        {collections.length === 0 ? (
          <p className="empty-state">Aucune collection enregistrée.</p>
        ) : (
          collections.map((col) => (
            <div key={col.id} className="card collection-card">
              {editingId === col.id ? (
                <form
                  onSubmit={(e) => handleUpdate(e, col.id)}
                  className="edit-collection-form"
                >
                  <input
                    aria-label="Modifier le nom"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <input
                    aria-label="Modifier le lieu"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                  />
                  <div className="card-actions">
                    <button type="submit" className="btn btn-primary">
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setEditingId(null)}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="collection-info">
                    <h3>{col.name}</h3>
                    <p className="collection-location">
                      Lieu : <strong>{col.location || 'Non spécifié'}</strong>
                    </p>
                    <p className="collection-count">
                      <span className="badge">{col.bookCount} livre(s)</span>
                    </p>
                  </div>
                  <div className="card-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => onSelectCollection(col.id)}
                    >
                      Voir les livres
                    </button>
                    {canEditBooks && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => startEdit(col)}
                      >
                        Modifier
                      </button>
                    )}
                    {canDeleteBooks && (
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleDelete(col.id)}
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
