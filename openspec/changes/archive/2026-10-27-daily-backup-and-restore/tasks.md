# Tasks

## 1. Moteur de sauvegarde, rétention sur 7 jours et restauration (`server/src/backup.ts`)

- [x] 1.1 Créer `server/src/backup.ts` avec les fonctions de sérialisation complète (`createBackupBundle`, `writeDailyBackup`), la politique de rétention automatique des 7 derniers jours (`pruneOldBackups`), le listage (`listBackups`), la validation (`validateBackupBundle`) et la restauration transactionnelle complète incluant livres, collections, images de couvertures, utilisateurs, paramètres et reconstruction FTS5 (`restoreBackupBundle`), et vérifier la compilation TypeScript via `npm --prefix server run build`.
- [x] 1.2 Ajouter les tests unitaires et d'intégration dans `server/test/backup.test.ts` couvrant la génération du bundle complet (avec couvertures base64), la mise à jour quotidienne unique par date (`backup-YYYY-MM-DD.json`), la purge automatique au-delà de 7 jours et la restauration complète, puis vérifier qu'ils passent via `npm --prefix server test`.

## 2. Routes API et déclenchement automatique sur activité de livres (`server/src/app.ts`)

- [x] 2.1 Brancher le déclenchement automatique de la sauvegarde quotidienne dans `server/src/app.ts` lors des opérations d'ajout et de modification de livres (`POST /api/books`, `PUT /api/books/:id`, `POST /api/books/:id/move`, `POST /api/books/bulk-move`, `POST /api/books/bulk-update`, `POST /api/books/:id/cover`, `DELETE /api/books/:id/cover`) et exposer les routes protégées par `canManageUsers` (`GET /api/backups`, `POST /api/backups`, `GET /api/backups/:filename/download`, `POST /api/backups/:filename/restore`, `POST /api/backups/restore-upload`), puis vérifier les tests API dans `server/test/backup.test.ts` via `npm --prefix server test`.

## 3. Client API et interface de gestion dans « Paramétrage » (`web/`)

- [x] 3.1 Ajouter dans `web/src/api.ts` les types (`BackupMetadata`, `BackupBundle`) et les méthodes clientes (`getBackups`, `createBackup`, `downloadBackup`, `restoreBackup`, `restoreUploadedBackup`) et vérifier le typage avec `npm --prefix web run build`.
- [x] 3.2 Ajouter la carte « 💾 Sauvegardes et restauration » dans `web/src/components/SettingsScreen.tsx` (et les styles associés dans `web/src/styles.css`) permettant de lister les sauvegardes du serveur, créer une sauvegarde immédiate, télécharger un fichier de sauvegarde, restaurer une sauvegarde du serveur avec confirmation, et importer/restaurer un fichier de sauvegarde externe, puis vérifier le rendu et les tests dans `web/src/App.test.tsx` via `npm --prefix web test`.

## Workflow follow-up

- Archiver le changement avec `/opsx-archive` une fois l'implémentation vérifiée.
