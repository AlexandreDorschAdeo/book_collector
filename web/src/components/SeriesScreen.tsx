import React, { useEffect, useState } from 'react';
import { api, SeriesSummaryDto } from '../api';

export interface SeriesScreenProps {
  canEditBooks?: boolean;
}

export function formatMissingVolumesSummary(series: SeriesSummaryDto): string {
  if (series.missingVolumes.length === 0) {
    return `${series.name} : complète`;
  }
  const label = series.missingVolumes.length === 1 ? 'Tome' : 'Tomes';
  return `${series.name} : ${label} ${series.missingVolumes.join(', ')}`;
}

export function SeriesScreen({ canEditBooks = true }: SeriesScreenProps) {
  const [seriesList, setSeriesList] = useState<SeriesSummaryDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [targetInputs, setTargetInputs] = useState<Record<string, string>>({});
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSeries = async () => {
    try {
      const list = await api.getSeries();
      setSeriesList(list);
      const initialTargets: Record<string, string> = {};
      for (const s of list) {
        initialTargets[s.seriesKey] =
          s.targetVolumeCount != null ? String(s.targetVolumeCount) : '';
      }
      setTargetInputs(initialTargets);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de charger les séries.',
      );
    }
  };

  useEffect(() => {
    loadSeries();
  }, []);

  const filteredSeries = seriesList.filter((s) => {
    if (onlyMissing && s.missingVolumes.length === 0) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.trim().toLowerCase();
      return s.name.toLowerCase().includes(q);
    }
    return true;
  });

  const incompleteSeries = filteredSeries.filter(
    (s) => s.missingVolumes.length > 0,
  );

  const handleCopyText = async (text: string, label: string) => {
    setError(null);
    setCopiedText(text);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      // Fallback: copiedText box is displayed so the user can still read/copy
    }
    setStatusMessage(`Liste des tomes manquants copiée (${label}) !`);
  };

  const handleCopySingleSeries = (s: SeriesSummaryDto) => {
    const text = formatMissingVolumesSummary(s);
    void handleCopyText(text, s.name);
  };

  const handleCopyAllMissing = () => {
    const lines = incompleteSeries.map((s) => `- ${formatMissingVolumesSummary(s)}`);
    const text = `Tomes manquants à rechercher :\n${lines.join('\n')}`;
    void handleCopyText(text, `${incompleteSeries.length} série(s)`);
  };

  const handleSaveTarget = async (s: SeriesSummaryDto, overrideNull = false) => {
    setError(null);
    setStatusMessage(null);
    const rawVal = overrideNull ? '' : (targetInputs[s.seriesKey] ?? '').trim();
    let targetVolumeCount: number | null = null;
    if (rawVal !== '') {
      const parsed = Number(rawVal);
      if (!Number.isInteger(parsed) || parsed < 1) {
        setError('Le dernier tome paru doit être un entier positif (≥ 1).');
        return;
      }
      targetVolumeCount = parsed;
    }

    try {
      await api.setSeriesTargetVolumeCount({
        series: s.name,
        seriesKey: s.seriesKey,
        targetVolumeCount,
      });
      await loadSeries();
      setStatusMessage(
        targetVolumeCount != null
          ? `Dernier tome paru défini à ${targetVolumeCount} pour « ${s.name} ».`
          : `Dernier tome paru effacé pour « ${s.name} ».`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la mise à jour de la série.',
      );
    }
  };

  return (
    <section className="screen-section">
      <div className="catalog-header">
        <h2>Séries &amp; Tomes manquants</h2>
        {incompleteSeries.length > 0 && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleCopyAllMissing}
          >
            📋 Copier tous les tomes manquants ({incompleteSeries.length})
          </button>
        )}
      </div>

      {error && (
        <div role="alert" className="alert alert-error">
          {error}
        </div>
      )}

      {statusMessage && (
        <div role="status" className="alert alert-success">
          {statusMessage}
        </div>
      )}

      {copiedText && (
        <div className="card copied-summary-card">
          <div className="user-item-header">
            <strong>Récapitulatif prêt à partager / copier :</strong>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setCopiedText(null)}
            >
              Fermer
            </button>
          </div>
          <pre className="copied-summary-pre">{copiedText}</pre>
        </div>
      )}

      <div className="card filters-bar">
        <div className="field search-field">
          <label htmlFor="series-search">Rechercher une série</label>
          <input
            id="series-search"
            type="search"
            placeholder="Ex : One Piece, Astérix, Blacksad…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="field series-filter-check">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={onlyMissing}
              onChange={(e) => setOnlyMissing(e.target.checked)}
            />
            Séries avec tomes manquants uniquement
          </label>
        </div>
      </div>

      {filteredSeries.length === 0 ? (
        <p className="empty-state">
          {seriesList.length === 0
            ? 'Aucune série enregistrée pour le moment. Renseignez le champ « Série » sur vos livres ou via « Actions groupées ».'
            : 'Aucune série ne correspond à vos filtres.'}
        </p>
      ) : (
        <div className="books-list">
          {filteredSeries.map((s) => {
            const ownedSet = new Set(s.ownedVolumes);
            const allNumbers = Array.from(
              { length: s.effectiveMaxVolume },
              (_, idx) => idx + 1,
            );

            return (
              <article key={s.seriesKey} className="card series-card">
                <div className="series-card-header">
                  <div>
                    <h3>{s.name}</h3>
                    <p className="book-meta-line">
                      {s.books.length} livre(s) possédé(s)
                      {s.maxOwnedVolume != null
                        ? ` · Tome max possédé : ${s.maxOwnedVolume}`
                        : ''}
                      {s.targetVolumeCount != null
                        ? ` · Dernier tome paru : ${s.targetVolumeCount}`
                        : ''}
                    </p>
                  </div>
                  <div className="series-header-badges">
                    {s.missingVolumes.length > 0 ? (
                      <span className="badge badge-missing">
                        ⚠️ {s.missingVolumes.length} tome(s) manquant(s)
                      </span>
                    ) : (
                      <span className="badge badge-complete">
                        ✅ Aucun tome manquant connu
                      </span>
                    )}
                    {s.missingVolumes.length > 0 && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleCopySingleSeries(s)}
                      >
                        📋 Copier les manquants
                      </button>
                    )}
                  </div>
                </div>

                {s.missingVolumes.length > 0 && (
                  <div className="series-missing-banner">
                    <strong>Tomes manquants :</strong>{' '}
                    {s.missingVolumes.map((v) => `Tome ${v}`).join(', ')}
                  </div>
                )}

                {allNumbers.length > 0 && (
                  <div
                    className="series-volumes-grid"
                    aria-label={`Grille des tomes de ${s.name}`}
                  >
                    {allNumbers.map((v) => {
                      const isOwned = ownedSet.has(v);
                      return (
                        <span
                          key={v}
                          className={
                            isOwned
                              ? 'volume-chip volume-chip-owned'
                              : 'volume-chip volume-chip-missing'
                          }
                          title={
                            isOwned
                              ? `Tome ${v} possédé`
                              : `Tome ${v} manquant`
                          }
                        >
                          T.{v} {isOwned ? '✓' : '✗'}
                        </span>
                      );
                    })}
                  </div>
                )}

                {canEditBooks && (
                  <div className="series-target-bar">
                    <label htmlFor={`target-vol-${s.seriesKey}`}>
                      Dernier tome paru :
                    </label>
                    <input
                      id={`target-vol-${s.seriesKey}`}
                      type="number"
                      min={1}
                      step={1}
                      placeholder={
                        s.maxOwnedVolume != null
                          ? `Auto (${s.maxOwnedVolume})`
                          : 'Ex : 108'
                      }
                      value={targetInputs[s.seriesKey] ?? ''}
                      onChange={(e) =>
                        setTargetInputs((prev) => ({
                          ...prev,
                          [s.seriesKey]: e.target.value,
                        }))
                      }
                      className="series-target-input"
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleSaveTarget(s, false)}
                    >
                      Enregistrer
                    </button>
                    {s.targetVolumeCount != null && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleSaveTarget(s, true)}
                      >
                        Effacer
                      </button>
                    )}
                  </div>
                )}

                <div className="series-books-summary">
                  <strong>Tomes dans votre bibliothèque :</strong>
                  <ul className="series-owned-list">
                    {s.books.map((b) => (
                      <li key={b.id}>
                        {b.volumeNumber != null ? (
                          <strong>Tome {b.volumeNumber}</strong>
                        ) : (
                          <em>Hors-série / Sans numéro</em>
                        )}{' '}
                        — {b.title}
                        {b.subtitle ? ` (${b.subtitle})` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
