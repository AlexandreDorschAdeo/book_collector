# Tasks

## 1. Schéma SQLite, extraction Série/Tome et logique métier (`server/`)

- [x] 1.1 Mettre à jour `server/src/db.ts` pour ajouter les colonnes `series`, `series_key` et `volume_number` sur `book`, créer la table `series_config` (`series_key`, `series_name`, `target_volume_count`, `updated_at`), inclure `series` dans l'index plein texte `book_fts` et ses triggers, et vérifier les migrations via `npm --prefix server test`.
- [x] 1.2 Ajouter la fonction d'extraction automatique `inferSeriesAndVolume` dans `server/src/normalize.ts` et enrichir `server/src/metadata.ts` ainsi que `server/src/coverLookup.ts` pour retourner `series` et `volumeNumber` lors des recherches ISBN et analyses de couverture, puis ajouter les tests unitaires associés dans `server/test/normalize.test.ts` et `server/test/metadata.test.ts`.
- [x] 1.3 Mettre à jour `server/src/repository.ts` et `server/src/backup.ts` pour gérer `series` et `volumeNumber` dans `BookDto`, `createBook`, `updateBook`, `bulkUpdateBooks` (incluant `autoExtractVolume`), le calcul des séries et tomes manquants (`listSeriesSummaries`, `setSeriesTargetVolumeCount`) ainsi que la sauvegarde/restauration de `series_config`, et vérifier via `npm --prefix server run build`.

## 2. Routes API des séries et tests serveur (`server/src/app.ts`)

- [x] 2.1 Exposer dans `server/src/app.ts` les routes `GET /api/series` et `PUT /api/series/target` (protégée par `canEditBooks` + déclenchement de la sauvegarde quotidienne), et ajouter les tests d'intégration dans `server/test/books.test.ts` et `server/test/backup.test.ts` couvrant l'enregistrement avec série/tome, l'affectation en lot avec détection automatique du tome, le calcul des tomes manquants (trous + dernier tome paru) et la sauvegarde/restauration, puis vérifier via `npm --prefix server test`.

## 3. Interface web : formulaires, Actions groupées et onglet « 📚 Séries » (`web/`)

- [x] 3.1 Mettre à jour `web/src/api.ts`, `web/src/components/ScanScreen.tsx`, `web/src/components/CatalogScreen.tsx` et `web/src/components/BulkActionsScreen.tsx` pour afficher le badge `📚 Série — Tome X`, pré-remplir et éditer `Série` (avec autocomplétion) et `N° de tome`, et permettre d'affecter une série en lot avec détection automatique du numéro de tome, puis vérifier la compilation via `npm --prefix web run build`.
- [x] 3.2 Créer `web/src/components/SeriesScreen.tsx`, l'intégrer dans la barre de navigation de `web/src/App.tsx` (`📚 Séries`) avec filtre « Séries avec tomes manquants », configuration du « Dernier tome paru » et bouton de copie de la liste des tomes manquants, ajouter les tests correspondants dans `web/src/App.test.tsx`, et vérifier que `npm --prefix web test` et `npm --prefix web run build` passent.

## Workflow follow-up

- Archiver le changement avec `/opsx-archive` une fois l'implémentation vérifiée.
