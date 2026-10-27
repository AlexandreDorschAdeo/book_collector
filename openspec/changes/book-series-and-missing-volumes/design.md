# Design

## Context

Voir `proposal.md - Why`. Actuellement, la table `book` stocke `title`, `subtitle`, `publisher`, `cover_path`, `authors_json`, `type`, `title_key` et `author_key`. Lors d'un scan BnF (`metadata.ts`), les zones UNIMARC `461` (série d'ensemble) et `225` (collection éditoriale) sont déjà lues mais concaténées dans `subtitle`. Pour permettre le regroupement fiable par série et le calcul des tomes manquants sans alourdir la saisie quotidienne, il faut structurer `series` et `volume_number` directement sur les livres et offrir une table légère `series_config` pour stocker optionnellement le nombre total de tomes parus d'une série.

## Goals / Non-Goals

**Goals:**
- Stocker `series` (`TEXT`), `series_key` (`TEXT`, clé normalisée sans casse ni accents) et `volume_number` (`INTEGER`, entier positif `>= 1`) sur la table `book`, et indexer `series` dans `book_fts`.
- Fournir une fonction d'extraction automatique `extractSeriesAndVolume(title, subtitle, explicitSeries?, explicitVolume?)` capable d'identifier la série et le numéro de tome aussi bien depuis les zones UNIMARC `461`/`225` que depuis des motifs textuels (`One Piece - Tome 12`, `T. 12`, `T12`, `Vol. 12`, `#12`).
- Permettre de définir ou d'effacer un `targetVolumeCount` (« Dernier tome paru ») par série dans une table `series_config`.
- Calculer pour chaque série (`GET /api/series`) :
  - `ownedVolumes`: liste triée et dédoublonnée des numéros de tomes possédés (`[1, 2, 5]`),
  - `unnumberedBooksCount`: nombre de livres rattachés à la série sans numéro de tome,
  - `maxOwnedVolume`: plus grand numéro de tome possédé (`5`),
  - `targetVolumeCount`: nombre total de tomes parus configuré (`null` ou entier `>= 1`),
  - `effectiveMaxVolume`: `Math.max(maxOwnedVolume ?? 0, targetVolumeCount ?? 0)`,
  - `missingVolumes`: tous les entiers de `1` à `effectiveMaxVolume` qui ne figurent pas dans `ownedVolumes`.
- Proposer un onglet dédié **« 📚 Séries »** dans l'interface web/mobile avec filtre « Séries avec tomes manquants », édition rapide du « Dernier tome paru » et bouton de copie de la liste des manquants (idéal en bouquinerie ou pour idées cadeaux).

**Non-Goals:**
- Interrogation automatique temps réel d'un catalogue externe pour deviner le nombre total de tomes parus d'une série en cours au Japon ou en France (la saisie rapide de « Dernier tome paru » par l'utilisateur est instantanée, hors-ligne et sans faux positifs).
- Gestion des demi-tomes ou hors-séries non numériques dans le calcul arithmétique des trous (les hors-séries restent rattachés à la série sans numéro de tome et sont comptabilisés dans la série).

## Decisions

### 1. Modèle de données hybride : colonnes sur `book` + table `series_config`
- **Choix** :
  - Sur `book` : ajout par migration idempotente (`ALTER TABLE book ADD COLUMN ...`) de :
    - `series TEXT` (nom d'affichage de la série, ex. `"One Piece"`),
    - `series_key TEXT` (clé normalisée via `normalizeTitleKey(series)` pour regrouper `"one piece"` et `"One Piece"` sans doublon),
    - `volume_number INTEGER` (entier `>= 1` ou `NULL`).
  - Table `series_config` :
    ```sql
    CREATE TABLE IF NOT EXISTS series_config (
      series_key TEXT PRIMARY KEY,
      series_name TEXT NOT NULL,
      target_volume_count INTEGER,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    ```
- **Pourquoi** : Aucune création préalable de fiche série n'est requise avant d'ajouter un livre ; dès qu'un livre a un champ `series` renseigné, la série existe automatiquement. Si l'utilisateur souhaite préciser que la série compte 108 tomes parus, `PUT /api/series/target` enregistre `target_volume_count` dans `series_config`.
- **Alternatives écartées** :
  - *Utiliser les Collections* : mélangerait les lieux physiques (`Salon`, `Chambre`) avec des dizaines de séries et ne porterait pas le numéro de tome par livre.
  - *Table `series` obligatoire avec clé étrangère stricte* : forcerait à créer une série avant de scanner un livre ou complexifierait la saisie libre.

### 2. Algorithme d'auto-détection Série & Tome (`extractSeriesAndVolume`)
- **Choix** :
  - Dans `parseBnfUnimarcXml` (`server/src/metadata.ts`), conserver et exposer `series` et `volumeNumber` extraits de la zone `461` (ou `225` à défaut).
  - Ajouter un extracteur heuristique `inferSeriesAndVolume(title, subtitle)` utilisé en complément (pour Google Books, Open Library, OCR couverture et l'action groupée) :
    - Reconnaît les motifs `^(?<series>.+?)\s*(?:[-–—:,]|\s+)\s*(?:tome|t\.|vol(?:ume)?\.?|n°|#)\s*0*(?<vol>\d+)\b` dans le titre ou le sous-titre.
    - Reconnaît dans le sous-titre un motif court `^(?:tome|t\.?|vol(?:ume)?\.?|n°|#)\s*0*(?<vol>\d+)\b` et utilise alors `title` comme nom de série si `series` n'est pas déjà défini.
- **Pourquoi** : Permet à la fois de pré-remplir automatiquement `Série` + `N° de tome` lors d'un scan ISBN/couverture et de convertir en 1 clic des livres déjà enregistrés via l'action groupée « Affecter une série + extraire automatiquement le N° de tome ».

### 3. Indexation plein texte FTS5 incluant `series`
- **Choix** : Mettre à jour la migration de `book_fts` dans `server/src/db.ts` pour inclure la colonne `series` (`title, subtitle, series, authors_text, publisher, isbn13`) et reconstruire l'index (`INSERT INTO book_fts(book_fts) VALUES('rebuild')`).
- **Pourquoi** : Permet de retrouver tous les tomes d'une série depuis la barre de recherche principale même si le titre individuel d'un album de BD est le titre de l'épisode (ex. titre `"Astérix le Gaulois"` ou `"Quelque part entre les ombres"` avec série `"Blacksad"`).

## Risks / Trade-offs

- **[Risk] Variantes de casse ou d'accents lors de la saisie manuelle d'une série** → **Mitigation** : Regroupement systématique sur `series_key` (`normalizeTitleKey`) côté serveur et proposition d'une `<datalist>` d'autocomplétion des séries existantes dans tous les formulaires.
- **[Risk] Rétrocompatibilité des sauvegardes existantes (`backup-YYYY-MM-DD.json`)** → **Mitigation** : Lors de la restauration (`restoreBackupBundle`), `series`, `series_key` et `volume_number` sur `book` ainsi que `seriesConfigs` dans `data` sont optionnels (valeurs par défaut `null` / `[]` si l'archive provient d'une version antérieure).

## Migration Plan

1. Au démarrage, `runMigrations(db)` ajoute les colonnes `series`, `series_key` et `volume_number` à `book` si absentes, crée `idx_book_series_key` et la table `series_config`, puis met à jour `book_fts` et ses triggers pour inclure `series`.
2. Les livres existants conservent `series = NULL` et `volume_number = NULL` et peuvent être rattachés à une série individuellement ou par lot depuis « Actions groupées ».
