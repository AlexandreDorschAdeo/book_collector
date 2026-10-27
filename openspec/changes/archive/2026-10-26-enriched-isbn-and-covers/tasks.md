# Tasks

## 1. Schéma SQLite et persistance (éditeur et couverture)

- [x] 1.1 Ajouter la migration SQLite dans `server/src/db.ts` pour les colonnes `publisher` et `cover_path` sur `book` et mettre à jour l'index `book_fts` et ses triggers ; vérifier avec des tests de migration sur base existante et base vide
- [x] 1.2 Implémenter le stockage local des couvertures dans `<DATA_DIR>/covers` (enregistrement depuis Data URL base64 ou téléchargement depuis une URL distante, suppression de fichier, et route `GET /api/covers/:filename`) ; vérifier par tests d'API
- [x] 1.3 Mettre à jour `POST /api/books`, `PUT /api/books/:id`, `DELETE /api/books/:id` et la recherche FTS5 pour gérer `publisher`, `coverUrl`, `coverDataUrl`, `coverSourceUrl` et `removeCover` ; vérifier par tests dans `server/test/books.test.ts`

## 2. Sources ISBN enrichies et fusion

- [x] 2.1 Enrichir le parseur UNIMARC (`parseBnfUnimarcXml` dans `server/src/metadata.ts`) pour extraire la maison d'édition (`210$c` / `214$c`), la série et le numéro de tome (`461$t` / `461$v`) ainsi que l'identifiant ARK (`003`) pour la couverture BnF ; vérifier par tests unitaires UNIMARC
- [x] 2.2 Ajouter le connecteur SUDOC / ABES (`isbn2ppn` + notice XML UNIMARC) et l'extraction de `publisher` et `coverUrl` sur Open Library (API Books + Search + Covers) et Google Books ; vérifier par tests unitaires avec réponses simulées
- [x] 2.3 Implémenter l'interrogation parallèle et la fusion champ par champ (`title`, `subtitle`, `authors` avec priorité aux rôles scénariste/dessinateur, `publisher`, `coverUrl`) dans `lookupIsbnMetadata` et exposer ces champs sur `GET /api/lookup` ; vérifier par tests de fusion multi-sources dans `server/test/metadata.test.ts` et `server/test/lookup-check.test.ts`

## 3. Interface web : éditeur, capture photo et recadrage de couverture

- [x] 3.1 Construire le composant `CoverPickerModal.tsx` permettant de sélectionner un fichier image (PC/tablette/smartphone) ou de prendre une photo depuis l'appareil photo et de recadrer l'image sur `<canvas>` avant validation ; vérifier par tests de composants
- [x] 3.2 Mettre à jour `ScanScreen.tsx` et `CatalogScreen.tsx` pour afficher et modifier la maison d'édition (`publisher`) et la couverture (aperçu auto issu de l'ISBN, remplacement par fichier ou photo recadrée, suppression, miniatures dans les listes et la fiche détail) ; vérifier par tests dans `web/src/App.test.tsx`

## 4. Intégration et déploiement Docker

- [x] 4.1 Mettre à jour `README.md` (sources ISBN, couvertures dans le volume `/data/covers`, variable optionnelle `GOOGLE_BOOKS_API_KEY`) et vérifier que `npm run build`, `npm test` et `docker compose up -d --build` passent de bout en bout

## Workflow follow-up

- Archiver le changement une fois la revue terminée (`/opsx-archive`).
