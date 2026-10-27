# Proposal

## Why

Pour les mangas, bandes dessinées, comics et romans à suite (ex. *One Piece*, *Astérix*, *Blacksad*), les collections actuelles représentent déjà l'emplacement physique ou le rayonnage (ex. *Mangas - Salon*, *Chambre*). Utiliser les collections pour chaque série multiplierait les collections et ne permettrait pas de connaître le numéro de chaque tome ni d'identifier automatiquement les numéros manquants. Introduire une notion dédiée **« Série » + « N° de tome »** permet de regrouper tous les volumes d'une même histoire et d'afficher instantanément la liste des **tomes manquants** sur smartphone en bouquinerie, sur les sites d'occasion ou pour préparer une liste de cadeaux.

## What Changes

- **Champs « Série » et « N° de tome » sur les livres** :
  - Ajout des champs optionnels `series` (texte, ex. `One Piece`) et `volumeNumber` (entier positif, ex. `12`) sur chaque livre (`book` SQLite + index de recherche plein texte FTS5).
  - Affichage d'un badge de série et de tome (ex. `📚 One Piece — Tome 12`) sur les cartes de livres dans la bibliothèque et propositions d'autocomplétion des séries existantes dans les formulaires d'ajout et de modification.
- **Auto-détection de la série et du tome au scan / recherche** :
  - Extraction automatique de `series` et `volumeNumber` depuis les champs UNIMARC BnF (`461` / `225`) ainsi que par analyse des motifs courants dans le titre ou le sous-titre (`Tome 12`, `T. 12`, `T12`, `Vol. 12`, `#12`) lors du scan ISBN ou de l'analyse de photo de couverture.
- **Affectation de série en lot dans « Actions groupées »** :
  - Possibilité d'appliquer un nom de série à toute une sélection de livres dans l'onglet « Actions groupées », avec une option permettant d'extraire automatiquement le numéro de tome de chaque livre sélectionné à partir de son titre ou sous-titre existant.
- **Nouvel onglet « 📚 Séries & Manquants »** :
  - Vue dédiée listant toutes les séries de la bibliothèque avec :
    - Le nombre de tomes possédés et la liste visuelle des numéros possédés.
    - Le calcul automatique des **tomes manquants** : à la fois les trous dans la numérotation entre le tome 1 et le plus grand tome possédé (ex. tomes 1, 2, 4 possédés → **Tome 3 manquant**) et, lorsqu'un **« Dernier tome paru »** (`targetVolumeCount`) est renseigné pour la série, tous les tomes manquants jusqu'à ce dernier tome paru.
    - Un filtre rapide « Uniquement les séries incomplètes » et un mode compact/copiable pratique en bouquinerie ou pour partager une liste d'idées cadeaux.

## Capabilities

### New Capabilities
- `series-management`: Regroupement des livres par série et numéro de tome, configuration optionnelle du nombre total de tomes parus par série, calcul automatique des tomes manquants (trous et tomes parus non possédés) et écran dédié « Séries & Manquants ».

### Modified Capabilities
- `book-catalog`: Enregistrement, affichage, recherche plein texte et modification unitaire ou en lot (avec extraction automatique optionnelle du numéro de tome) des champs `series` et `volumeNumber` sur les livres.
- `isbn-scan-lookup`: Pré-remplissage automatique des champs `series` et `volumeNumber` dans le formulaire de scan à partir des métadonnées bibliographiques (BnF UNIMARC et motifs de tome dans les titres/sous-titres).
- `backup-and-restore`: Sauvegarde et restauration des champs de série des livres et des paramètres de séries (`series_config`).

## Impact

- **Base de données (`server/src/db.ts`)** : Migration ajoutant `series`, `series_key` et `volume_number` sur `book`, table `series_config` (`series_key PRIMARY KEY`, `series_name`, `target_volume_count`, `updated_at`), et mise à jour de la table virtuelle `book_fts` pour indexer `series`.
- **Backend (`server/src/repository.ts`, `server/src/metadata.ts`, `server/src/app.ts`, `server/src/backup.ts`)** :
  - Validation et persistance de `series` et `volumeNumber` dans `POST /api/books`, `PUT /api/books/:id` et `POST /api/books/bulk-update` (avec support de `autoExtractVolume: true`).
  - Nouveaux endpoints `GET /api/series` (synthèse des séries avec tomes possédés et tomes manquants) et `PUT /api/series/target` (définition du dernier tome paru d'une série).
  - Extraction automatique de `series` et `volumeNumber` dans `metadata.ts`.
  - Inclusion de `series`, `volumeNumber` et `series_config` dans `backup.ts`.
- **Frontend (`web/src/api.ts`, `web/src/App.tsx`, `web/src/components/SeriesScreen.tsx`, `CatalogScreen.tsx`, `ScanScreen.tsx`, `BulkActionsScreen.tsx`)** :
  - Champs Série (avec `<datalist>` des séries existantes) et N° de tome dans l'ajout, l'édition et les actions groupées.
  - Nouvel écran `SeriesScreen.tsx` accessible depuis la barre de navigation principale (`📚 Séries`).
