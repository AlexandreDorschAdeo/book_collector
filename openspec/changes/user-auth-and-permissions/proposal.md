## Why

Exposer l'application directement sur Internet sans VPN nécessite d'authentifier chaque visiteur avant tout accès aux données et de contrôler finement les actions autorisées par utilisateur (consultation seule, ajout de livres, modification, suppression, gestion des utilisateurs). Il faut également initialiser un compte administrateur par défaut (`admin` / `1234`) pour permettre la première connexion immédiate.

## What Changes

- **Authentification obligatoire et protection Internet derrière Nginx (Proxmox LXC / Docker)** :
  - Écran de connexion (`Identifiant` + `Mot de passe`) affiché tant que l'utilisateur n'est pas authentifié.
  - Hachage sécurisé des mots de passe (`scrypt` + sel aléatoire) dans SQLite, sessions signées/persistantes (`HttpOnly`, `SameSite=Lax`, `Secure` via détection `X-Forwarded-Proto: https` envoyé par Nginx), et limitation des tentatives de connexion basée sur la véritable IP cliente (`trustProxy: true` avec `X-Forwarded-For`).
  - Exposition directe du port HTTP du conteneur `app` (`${APP_PORT:-3000}:3000`) dans `docker-compose.yml` pour permettre à un reverse proxy Nginx amont (terminaison HTTPS) de relayer le trafic vers le conteneur Docker dans le LXC Proxmox.
  - Toutes les routes `/api/*` (hors `/api/health`, `/api/auth/login` et `/api/auth/me`) exigent une session valide (`401 Unauthorized`).
- **Compte initial `admin`** :
  - À l'initialisation de la base SQLite, si aucun utilisateur n'existe, création automatique de l'utilisateur `admin` avec le mot de passe `1234` et l'ensemble des droits activés.
- **Gestion granulaire des autorisations (RBAC)** :
  - `canAddBooks` : autorise l'ajout de livres (`POST /api/books`, `/api/lookup`, `/api/lookup-cover`) et la création de collections.
  - `canEditBooks` : autorise la modification de livres (`PUT /api/books/:id`, rattachement/déplacement entre collections) et l'édition de collections.
  - `canDeleteBooks` : autorise la suppression de livres (`DELETE /api/books/:id`) et de collections.
  - `canManageUsers` : autorise la création, la modification des droits/mots de passe et la suppression d'utilisateurs (`/api/users`), ainsi que l'accès au paramétrage système (`/api/settings`).
- **Interface adaptée aux droits et gestion des utilisateurs** :
  - Masquage automatique dans l'IHM des onglets et boutons pour lesquels l'utilisateur connecté n'a pas la permission (`Ajouter un livre`, `Modifier`, `Supprimer`, `⚙️ Paramétrage`).
  - Section **« Utilisateurs & Droits »** (accessible aux utilisateurs ayant `canManageUsers`) pour créer des utilisateurs, cocher/décocher leurs 4 permissions, réinitialiser un mot de passe ou supprimer un compte (avec protection empêchant de supprimer le dernier administrateur).
  - Possibilité pour tout utilisateur connecté de modifier son propre mot de passe et de se déconnecter.

## Capabilities

### New Capabilities
- `user-auth`: Authentification par session, compte `admin` initial (`1234`), protection des routes API pour exposition Internet sans VPN, et contrôle d'accès granulaire (`canAddBooks`, `canEditBooks`, `canDeleteBooks`, `canManageUsers`).

### Modified Capabilities
- `web-deployment`: Prise en charge du déploiement en conteneur Docker dans un LXC Proxmox derrière un reverse proxy Nginx assurant la terminaison HTTPS (`trustProxy`, `X-Forwarded-For`, `X-Forwarded-Proto`, port HTTP `3000` exposé pour Nginx).

## Impact

- **Backend (`server/`)** :
  - Tables SQLite `app_user` et `user_session` dans `server/src/db.ts` + seed automatique de `admin` (`1234`) avec tous les droits.
  - Nouveau module `server/src/auth.ts` (hachage `crypto.scryptSync`, gestion des sessions, middleware d'authentification et de vérification de permission, protection anti-bruteforce).
  - Routes `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/password` et CRUD `/api/users` dans `server/src/app.ts`.
- **Frontend (`web/`)** :
  - Nouveau composant `LoginScreen.tsx` et bandeau utilisateur (nom + bouton « Déconnexion ») dans `App.tsx`.
  - Adaptation de `App.tsx`, `CatalogScreen.tsx`, `CollectionsScreen.tsx` et `SettingsScreen.tsx` selon les permissions de l'utilisateur connecté.
  - Interface complète de gestion des utilisateurs et de leurs 4 autorisations dans `SettingsScreen.tsx`.
