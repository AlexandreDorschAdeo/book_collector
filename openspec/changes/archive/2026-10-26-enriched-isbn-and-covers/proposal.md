# Proposal

## Why

La récupération actuelle des métadonnées par ISBN passe à côté de certains ouvrages francophones (BD, mangas, comics), ne remonte pas toujours la série/le numéro de tome ni la maison d'édition, et le MVP initial excluait les images de couverture. Enrichir les sources bibliographiques et permettre d'associer une couverture (automatiquement via l'ISBN, par fichier ou par photo recadrée) rend l'identification visuelle et le catalogage complets sur mobile, tablette et PC.

## What Changes

- **Sources ISBN enrichies et fusionnées** :
  - Extraction UNIMARC approfondie sur la BnF (zones `200`, `210`/`214` pour l'éditeur, `461` pour le titre de série et numéro de tome quand le titre principal est celui de l'album, `003` ARK pour la couverture BnF, recherche ISBN-13 et ISBN-10).
  - Ajout du catalogue **SUDOC (ABES)** en source UNIMARC francophone complémentaire (rôles scénariste/dessinateur/auteur et maison d'édition).
  - Utilisation conjointe d'**Open Library** (API Books + Search + Covers) et **Google Books** (avec support optionnel de clé API `GOOGLE_BOOKS_API_KEY`) interrogés en parallèle avec fusion intelligente champ par champ.
- **Maison d'édition (`publisher`)** :
  - Récupération automatique de la maison d'édition lors du scan/lookup ISBN.
  - Saisie/modification dans le formulaire de livre, affichage sur la fiche et dans la liste, et indexation dans la recherche globale plein texte (FTS5).
- **Images de couverture (`book-covers`)** :
  - Récupération automatique d'une couverture à partir de l'ISBN (Open Library Covers, Google Books `imageLinks`, BnF couverture ARK) téléchargée et mise en cache localement.
  - Ajout ou remplacement manuel d'une couverture par sélection de fichier image depuis PC, tablette ou smartphone.
  - Prise de photo directe depuis l'appareil photo avec outil de recadrage interactif (format couverture de livre) avant enregistrement.
  - Stockage persistant des couvertures dans le volume Docker (`/data/covers`) et affichage dans les listes, résultats de recherche et fiches livres.

## Capabilities

### New Capabilities
- `book-covers`: Récupération automatique de la couverture par ISBN, import par fichier, prise de photo avec recadrage interactif, stockage local persistant et affichage dans le catalogue.

### Modified Capabilities
- `isbn-scan-lookup`: Enrichissement multi-sources (BnF UNIMARC série/tome/éditeur, SUDOC UNIMARC, Open Library, Google Books) et pré-remplissage de la maison d'édition et de la couverture.
- `book-catalog`: Enregistrement, modification, affichage et recherche de la maison d'édition (`publisher`) et association d'une couverture à chaque livre.

## Impact

- **Base de données (`server/src/db.ts`, `server/src/repository.ts`)** : ajout des colonnes `publisher` et `cover_path` sur la table `book`, mise à jour de l'index `book_fts` pour inclure `publisher`.
- **Service de métadonnées (`server/src/metadata.ts`)** : requêtes parallèles BnF + SUDOC + Open Library + Google Books, extraction UNIMARC `210`/`214` (`$c`) et `461` (`$t`/`$v`), sélection de la meilleure URL de couverture.
- **API & Stockage (`server/src/app.ts`)** : stockage des images de couverture sous `/data/covers/`, exposition via `/api/covers/:filename` et téléchargement/enregistrement de couverture (URL distante ou image recadrée envoyée en base64/multipart).
- **Frontend (`web/src/`)** : composant de capture photo + recadrage sur `<canvas>` (sans dépendance lourde), sélecteur de fichier, aperçu de couverture dans `ScanScreen` et `CatalogScreen`, champ « Maison d'édition ».
