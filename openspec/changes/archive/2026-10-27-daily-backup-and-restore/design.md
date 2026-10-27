# Design

## Context

L'application `Ma Bibliothèque` stocke ses données dans deux emplacements complémentaires au sein du volume Docker `/data` :
1. La base SQLite (`/data/library.db`, ou `:memory:` dans les tests) qui contient les tables `collection`, `book`, `book_collection`, `book_fts` (index plein texte FTS5), `metadata_cache`, `app_setting`, `app_user` et `user_session`.
2. Le dossier des images de couvertures (`/data/covers`) qui stocke les fichiers JPEG/PNG/WebP référencés par `book.cover_path`.

Voir `proposal.md` pour la motivation et `specs/backup-and-restore/spec.md` pour les exigences fonctionnelles.

## Goals / Non-Goals

**Goals:**
- Produire un fichier de sauvegarde unique, portable et auto-suffisant (`backup-YYYY-MM-DD.json`) contenant à la fois toutes les tables métiers/utilisateurs/paramètres et les fichiers d'images de couvertures.
- Garantir qu'une sauvegarde quotidienne est créée et tenue à jour chaque jour où au moins un livre est ajouté ou modifié, sans générer de fichier les jours d'inactivité.
- Appliquer automatiquement une rétention glissante conservant les **7 derniers jours** de sauvegarde sur le serveur.
- Permettre la restauration atomique à chaud (sans redémarrer le conteneur ni fermer l'instance `better-sqlite3` partagée par Fastify), que ce soit depuis une sauvegarde présente sur le serveur ou via l'import d'un fichier de sauvegarde téléchargé.

**Non-Goals:**
- Réplication automatique vers un stockage cloud tiers (S3, Google Drive, etc.) : l'utilisateur télécharge et conserve ses fichiers de sauvegarde depuis l'interface web.
- Sauvegarde des jetons de session éphémères (`user_session`), afin de ne pas réactiver d'anciennes sessions expirées ou révoquées lors d'une restauration.

## Decisions

### 1. Format de fichier de sauvegarde unique (Bundle JSON structuré)
- **Choix** : Chaque sauvegarde est sérialisée sous forme d'un document JSON versionné (`format: "book-collector-backup"`, `version: 1`, `createdAt`, `date: "YYYY-MM-DD"`) contenant :
  - `stats` : `{ booksCount, collectionsCount, coversCount, usersCount }`,
  - `data` :
    - `collections` : lignes complètes de `collection`,
    - `books` : lignes complètes de `book`,
    - `bookCollections` : lignes de `book_collection`,
    - `metadataCache` : lignes de `metadata_cache`,
    - `appSettings` : lignes de `app_setting`,
    - `appUsers` : lignes de `app_user` (incluant `password_hash` et les drapeaux de permissions),
    - `covers` : tableau `{ filename: string; contentBase64: string }` pour chaque fichier présent dans `coversDir` et/ou référencé par un livre.
- **Justification** :
  - Un fichier unique est immédiatement téléchargeable et réimportable depuis un navigateur mobile, tablette ou PC sans dépendance native d'archivage (`tar`/`zip`).
  - Fonctionne de manière identique que la base SQLite soit sur disque (`/data/library.db`) ou en mémoire (`:memory:` dans la suite de tests).
  - Permet de restaurer les données au sein d'une transaction SQLite sur la connexion `db` existante sans conflit de verrou de fichier Windows/Linux.
- **Alternatives écartées** :
  - *Copie binaire brute de `library.db`* : n'inclut pas les images de couvertures situées dans `/data/covers` et impose de fermer/rouvrir la connexion SQLite active de Fastify lors d'une restauration.

### 2. Déclenchement quotidien sur activité et rétention de 7 jours
- **Choix** :
  - Le répertoire des sauvegardes est configuré via `options.backupsDir ?? process.env.BACKUPS_DIR ?? path.join(path.dirname(dbPath), 'backups')` (ou un dossier temporaire isolé lorsque `dbPath === ':memory:'`).
  - Une fonction `recordBookActivityBackup(db, coversDir, backupsDir, now?)` est invoquée après toute opération d'ajout ou de modification de livre réussie :
    - `POST /api/books` (ajout d'un livre),
    - `PUT /api/books/:id` (modification d'un livre),
    - `POST /api/books/:id/move` (déplacement unitaire),
    - `POST /api/books/bulk-move` (déplacement en lot),
    - `POST /api/books/bulk-update` (modification en lot),
    - `POST /api/books/:id/cover` et `DELETE /api/books/:id/cover` (mise à jour ou suppression de couverture).
  - Elle écrit de manière atomique (écriture dans `backup-YYYY-MM-DD.json.tmp` puis renommage vers `backup-YYYY-MM-DD.json`) l'état courant de la journée `YYYY-MM-DD`.
  - Ainsi, s'il y a un ou plusieurs ajouts/modifications au cours d'une journée, `backup-YYYY-MM-DD.json` existe et contient toujours le dernier état du jour ; s'il n'y a aucune modification un jour donné, aucun fichier n'est créé pour ce jour.
  - Après chaque écriture quotidienne, `pruneOldBackups(backupsDir, 7)` liste les fichiers `backup-YYYY-MM-DD.json`, les trie par date décroissante et supprime ceux au-delà des 7 plus récents.
- **Alternatives écartées** :
  - *Cron uniquement à minuit* : si le conteneur ou le PC hôte est éteint avant minuit après une séance de scan, la sauvegarde du jour ne serait jamais créée. Écrire/actualiser `backup-YYYY-MM-DD.json` lors des modifications de livres garantit qu'aucune journée active n'est perdue.

### 3. Restauration transactionnelle et continuité de session
- **Choix** :
  - Avant toute modification, le payload de sauvegarde est intégralement validé (`validateBackupBundle`). Si la structure est invalide, une erreur `400 Bad Request` est retournée sans toucher aux données.
  - La restauration base de données s'exécute dans une transaction SQLite (`db.transaction(...)`) :
    1. Sauvegarde temporaire de la session courante de l'administrateur (`user_session`) si son compte figure toujours parmi les `appUsers` restaurés.
    2. Suppression des lignes existantes de `book_collection`, `book`, `collection`, `metadata_cache`, `app_setting` et `app_user`.
    3. Réinsertion fidèle des enregistrements avec leurs identifiants d'origine (`id`).
    4. Reconstruction de l'index plein texte FTS5 (`INSERT INTO book_fts(book_fts) VALUES('rebuild')`).
    5. Si aucun utilisateur n'était présent dans l'archive (cas dégradé), appel à `seedDefaultAdminUser(db)`. Restauration de la session courante si l'identifiant utilisateur existe toujours.
  - Les fichiers du dossier `coversDir` sont ensuite synchronisés avec `bundle.data.covers` (suppression des anciens fichiers de couverture et écriture des fichiers restaurés en nettoyant tout chemin par `path.basename`).

### 4. Sécurité, permissions et limites de taille HTTP
- **Choix** :
  - Toutes les routes `/api/backups*` vérifient `req.currentUser?.canManageUsers` (retourne `403` sinon).
  - Le paramètre `:filename` est validé par une expression régulière stricte (`/^backup-\d{4}-\d{2}-\d{2}\.json$/`) et `path.basename` pour interdire toute traversée de répertoire (`../`).
  - La limite de corps Fastify (`bodyLimit`) sur la route d'import `POST /api/backups/restore-upload` est portée à `50 * 1024 * 1024` (50 Mo) afin d'accepter des sauvegardes contenant de nombreuses couvertures en base64.

## Risks / Trade-offs

- **[Risk] Taille du fichier JSON avec de nombreuses couvertures** → **Mitigation** : les couvertures sont déjà limitées à 5 Mo maximum (et généralement quelques dizaines de Ko pour les vignettes Open Library / Google Books). Le `bodyLimit` de la route d'import est fixé à 50 Mo et le téléchargement utilise les flux standards HTTP avec `Content-Disposition: attachment`.
- **[Risk] Écrasement accidentel des données lors d'une restauration** → **Mitigation** : l'interface utilisateur demande une confirmation explicite avant toute restauration (depuis la liste ou par import de fichier).

## Migration Plan

Aucune migration de schéma SQLite destructive n'est requise : le dossier `/data/backups` est créé automatiquement à la volée dans le volume Docker `/data` déjà monté par `docker-compose.yml`.
