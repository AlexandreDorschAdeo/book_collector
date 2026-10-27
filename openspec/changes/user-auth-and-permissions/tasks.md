## 1. Backend : Base utilisateurs, hachage, sessions et compte `admin` initial

- [x] 1.1 Mettre à jour `server/src/db.ts` et créer `server/src/auth.ts` pour ajouter les tables `app_user` et `user_session`, le hachage `scrypt` des mots de passe, la gestion des sessions/cookies, la protection anti-force brute sur la connexion et la création automatique de l'utilisateur `admin` (mot de passe `1234`, tous les droits) au démarrage.
- [x] 1.2 Exposer dans `server/src/app.ts` les routes d'authentification (`POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `PUT /api/auth/password`) et de gestion des utilisateurs (`GET /api/users`, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id`) avec protection empêchant de supprimer ou rétrograder le dernier administrateur.
- [x] 1.3 Protéger les routes `/api/*` dans `server/src/app.ts` en vérifiant l'authentification (`401`) et les permissions granulaires (`canAddBooks`, `canEditBooks`, `canDeleteBooks`, `canManageUsers` -> `403`), et ajouter les tests unitaires et d'intégration (`server/test/auth-users.test.ts`).

## 2. Frontend : Écran de connexion, adaptation de l'IHM aux droits et gestion des utilisateurs

- [x] 2.1 Ajouter les appels d'authentification et de gestion des utilisateurs dans `web/src/api.ts` et créer `web/src/components/LoginScreen.tsx` pour demander les identifiants avant d'accéder à l'application.
- [x] 2.2 Mettre à jour `web/src/App.tsx`, `web/src/components/CatalogScreen.tsx`, `web/src/components/CollectionsScreen.tsx` et `web/src/components/SettingsScreen.tsx` pour afficher l'utilisateur connecté, le bouton de déconnexion, le changement de mot de passe, la gestion complète des utilisateurs/droits et masquer les boutons non autorisés (`Ajouter un livre`, `Modifier`, `Supprimer`, `⚙️ Paramétrage`).
- [x] 2.3 Ajouter les tests composants dans `web/src/App.test.tsx` pour vérifier la connexion, l'affichage conditionnel selon les permissions et l'ajout/modification d'un utilisateur.

## 3. Documentation et déploiement Docker (Proxmox LXC + Nginx HTTPS)

- [x] 3.1 Adapter `docker-compose.yml` (exposition directe `${APP_PORT:-3000}:3000` compatible LXC Proxmox derrière Nginx, Caddy mis en profil optionnel `local-https`) et documenter dans `README.md` la configuration Nginx HTTPS (`proxy_pass`, `X-Forwarded-For`, `X-Forwarded-Proto`, `client_max_body_size 15M`) ainsi que le compte initial `admin` / `1234`, puis valider avec `npm run build`, `npm test` et `docker compose up -d --build`.
