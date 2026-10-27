# Proposal

## Why

Bien que les données de la bibliothèque soient stockées sur un volume Docker persistant (`/data`), aucune sauvegarde historique n'est générée automatiquement et l'utilisateur ne dispose d'aucun moyen intégré pour télécharger une copie de sécurité ou revenir à un état antérieur en cas d'erreur de manipulation (suppression ou modification en lot accidentelle) ou de migration de machine. Mettre en place une sauvegarde quotidienne automatique les jours où des livres sont ajoutés ou modifiés, assortie d'une interface de téléchargement, d'import et de restauration complète, garantit la sécurité et la portabilité de toute la bibliothèque.

## What Changes

- **Sauvegarde quotidienne automatique sur activité** : création et mise à jour automatiques d'une sauvegarde journalière (`backup-YYYY-MM-DD.json`) dans le répertoire `/data/backups` chaque jour où au moins un livre est ajouté ou modifié (création, modification unitaire ou en lot, déplacement unitaire ou en lot, modification/suppression de couverture).
- **Politique de rétention sur 7 jours** : conservation automatique des **7 derniers jours** de sauvegarde quotidienne sur le serveur et purge automatique des sauvegardes automatiques plus anciennes.
- **Périmètre intégral de la sauvegarde** : chaque fichier de sauvegarde embarque de manière autonome l'intégralité des données de l'application :
  - les collections (`collection`),
  - les livres et leurs associations (`book`, `book_collection`, reconstruction de l'index `book_fts`, `metadata_cache`),
  - les fichiers d'images de couvertures encodés en base64 (`covers/`),
  - les comptes utilisateurs et leurs droits (`app_user`),
  - les paramètres de l'application (`app_setting`).
- **API de gestion des sauvegardes** (réservée aux utilisateurs disposant de la permission d'administration `canManageUsers`) :
  - `GET /api/backups` : lister les sauvegardes disponibles sur le serveur (nom, date, taille, compteurs de livres/collections/utilisateurs),
  - `POST /api/backups` : déclencher immédiatement une sauvegarde manuelle ou mettre à jour la sauvegarde du jour,
  - `GET /api/backups/:filename/download` : télécharger le fichier de sauvegarde complet sur son appareil,
  - `POST /api/backups/:filename/restore` : restaurer l'intégralité des données à partir d'une sauvegarde présente sur le serveur,
  - `POST /api/backups/restore-upload` : importer et restaurer directement un fichier de sauvegarde externe depuis son appareil.
- **Interface de gestion dans l'onglet « Paramétrage »** : ajout d'une section **« 💾 Sauvegardes et restauration »** permettant de créer une sauvegarde immédiate, télécharger n'importe quelle sauvegarde, restaurer une sauvegarde du serveur (avec confirmation) ou importer un fichier de backup externe.

## Capabilities

### New Capabilities
- `backup-and-restore`: Sauvegarde quotidienne automatique conditionnelle (lors d'ajouts ou modifications de livres), rétention glissante des 7 derniers jours, création manuelle, téléchargement du fichier de sauvegarde et restauration intégrale (depuis le serveur ou par import de fichier) couvrant livres, collections, images de couvertures, utilisateurs et paramètres.

### Modified Capabilities
*(Aucune)*

## Impact

- **Backend (`server/`)** :
  - Nouveau module `server/src/backup.ts` gérant la sérialisation/désérialisation du bundle de sauvegarde complet (tables SQLite + fichiers de couvertures), la sauvegarde quotidienne déclenchée lors des opérations d'ajout/modification de livres, la purge au-delà de 7 sauvegardes quotidiennes et la restauration transactionnelle Atomique (base SQLite + répertoire `covers/` + index FTS5).
  - Nouvelles routes dans `server/src/app.ts` (`/api/backups`, `/api/backups/:filename/download`, `/api/backups/:filename/restore`, `/api/backups/restore-upload`) et déclenchement automatique après ajout/modification de livres.
  - Nouveaux tests d'intégration dans `server/test/backup.test.ts`.
- **Frontend (`web/`)** :
  - Nouvelles méthodes clientes dans `web/src/api.ts` (`listBackups`, `createBackup`, `downloadBackup`, `restoreBackup`, `restoreUploadedBackup`).
  - Nouvelle section **« 💾 Sauvegardes et restauration »** dans `web/src/components/SettingsScreen.tsx` et tests associés dans `web/src/App.test.tsx`.
