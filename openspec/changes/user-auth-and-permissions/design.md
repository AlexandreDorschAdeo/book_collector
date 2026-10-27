## Context

L'application doit pouvoir être exposée sur Internet sans VPN tout en protégeant la bibliothèque contre les accès non autorisés. Différents membres de la famille ou invités peuvent avoir des besoins différents : simple consultation, ajout de livres, modification, suppression, ou administration des comptes.

## Goals / Non-Goals

**Goals:**
- Protéger toutes les routes API et les couvertures par une authentification par session (`cookie HttpOnly` ou jeton `Bearer`), avec limitation de débit sur `/api/auth/login` pour résister aux attaques par force brute sur Internet.
- Créer automatiquement au démarrage un utilisateur `admin` (mot de passe initial `1234`) disposant de toutes les permissions (`canAddBooks`, `canEditBooks`, `canDeleteBooks`, `canManageUsers`).
- Appliquer les 4 permissions côté serveur (`403 Forbidden`) et adapter l'interface web pour n'afficher que les actions autorisées.
- Permettre aux utilisateurs disposant du droit `canManageUsers` d'ajouter, modifier (droits / mot de passe) et supprimer des utilisateurs depuis l'interface, et permettre à chaque utilisateur de changer son propre mot de passe.

**Non-Goals:**
- Authentification fédérée externe (OAuth2 / OIDC) ou envoi d'e-mails de récupération de mot de passe (la réinitialisation se fait par un utilisateur ayant le droit de gérer les utilisateurs).

## Decisions

### 1. Modèle de données SQLite (`app_user` & `user_session`)
- Table `app_user` :
  - `id INTEGER PRIMARY KEY AUTOINCREMENT`
  - `username TEXT NOT NULL UNIQUE COLLATE NOCASE`
  - `password_hash TEXT NOT NULL` (format `scrypt$<salt_hex>$<hash_hex>`)
  - `can_add_books INTEGER NOT NULL DEFAULT 0`
  - `can_edit_books INTEGER NOT NULL DEFAULT 0`
  - `can_delete_books INTEGER NOT NULL DEFAULT 0`
  - `can_manage_users INTEGER NOT NULL DEFAULT 0`
  - `created_at TEXT NOT NULL DEFAULT (datetime('now'))`
- Table `user_session` :
  - `token TEXT PRIMARY KEY` (jeton aléatoire 256 bits en hexadécimal)
  - `user_id INTEGER NOT NULL REFERENCES app_user(id) ON DELETE CASCADE`
  - `expires_at TEXT NOT NULL` (durée de vie glissante de 30 jours)
  - `created_at TEXT NOT NULL DEFAULT (datetime('now'))`
- **Seed initial** : dans `runMigrations(db)`, si `SELECT COUNT(*) FROM app_user` vaut `0`, insertion de `admin` avec le hachage de `1234` et les 4 permissions à `1`.

### 2. Sécurité pour exposition Internet derrière Nginx (Proxmox LXC + Docker)
- **Reverse Proxy Nginx (`trustProxy: true`)** :
  - Fastify est configuré avec `trustProxy: true` afin d'exploiter les en-têtes `X-Forwarded-For` et `X-Forwarded-Proto` transmis par Nginx.
  - Cela garantit que la limitation anti-force brute isole chaque IP cliente réelle sur Internet (et ne bloque pas l'IP interne du proxy Nginx) et que le cookie de session active automatiquement l'attribut `Secure` lorsque l'accès externe se fait en HTTPS.
- **Exposition Docker pour LXC Proxmox** :
  - Le service `app` expose directement `${APP_PORT:-3000}:3000` dans `docker-compose.yml` pour que Nginx puisse faire un `proxy_pass http://<IP-LXC>:3000;` sans conflit de ports `80`/`443` si Nginx tourne sur le même hôte ou un conteneur voisin (le profil Caddy local reste optionnel).
  - Documentation d'un bloc `server { ... }` Nginx clé en main dans `README.md` (incluant `client_max_body_size 15M;` pour l'envoi des photos de couverture/codes-barres depuis smartphone).
- **Cookie & En-tête** : lors de `POST /api/auth/login`, le serveur retourne un cookie `bc_session=<token>; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000` (avec `; Secure` si `req.protocol === 'https'` ou `X-Forwarded-Proto: https`) ainsi que le jeton et le profil utilisateur dans le corps JSON.
- **Limitation anti-force brute** : compteur en mémoire par adresse IP cliente (`req.ip`) limitant les échecs de connexion (max 10 échecs sur 15 minutes avant `429 Too Many Requests`).
- **En-têtes de sécurité HTTP** : ajout de `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN` et `Referrer-Policy: same-origin`.

### 3. Matrice des autorisations
| Action | Permission requise |
|---|---|
| Consulter la bibliothèque, les collections et les couvertures (`GET /api/books`, `GET /api/collections`, `GET /api/covers/*`, `GET /api/check`) | Utilisateur authentifié |
| Ajouter un livre, scanner/rechercher un ISBN ou une couverture, créer une collection (`POST /api/books`, `GET /api/lookup`, `POST /api/lookup-cover`, `POST /api/collections`) | `canAddBooks` |
| Modifier un livre, rattacher/déplacer/retirer d'une collection, renommer une collection (`PUT /api/books/:id`, `POST /api/books/:id/collections`, `POST /api/books/:id/move`, `DELETE /api/books/:id/collections/:cid`, `PUT /api/collections/:id`) | `canEditBooks` |
| Supprimer un livre ou une collection (`DELETE /api/books/:id`, `DELETE /api/collections/:id`) | `canDeleteBooks` |
| Lister/créer/modifier/supprimer des utilisateurs, modifier le paramétrage IA (`GET/POST/PUT/DELETE /api/users*`, `GET/PUT /api/settings`) | `canManageUsers` |

## Risks / Trade-offs

- **[Mot de passe initial `admin` / `1234` faible sur Internet]** → L'interface affiche un avertissement invitant à modifier le mot de passe initial dans « ⚙️ Paramétrage » et permet à tout utilisateur de changer son mot de passe à tout moment.
- **[Verrouillage accidentel du dernier administrateur]** → Le serveur interdit de supprimer ou de retirer `canManageUsers` au dernier utilisateur possédant ce droit (`400 Bad Request`).
