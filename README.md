# Ma Bibliothèque (Book Collector)

Application web auto-hébergée de gestion de bibliothèque de livres physiques (livres, BD, mangas, comics), utilisable sur PC, tablette et smartphone avec scan de code-barre ISBN et détection immédiate des doublons (même ISBN ou autre édition du même titre et auteur).

## Authentification et gestion des utilisateurs

L'application est protégée par authentification obligatoire pour pouvoir être exposée sur Internet sans VPN :
- **Compte administrateur par défaut** créé automatiquement au premier démarrage :
  - Identifiant : **`admin`**
  - Mot de passe initial : **`1234`** *(à modifier dès la première connexion dans **⚙️ Paramétrage > Mon mot de passe**)*
- **Autorisations granulaires par utilisateur** (configurables dans **⚙️ Paramétrage > Utilisateurs et autorisations**) :
  - **Ajouter des livres** (`canAddBooks`) : accès à *Ajouter un livre*, création de livres et de collections.
  - **Modifier des livres** (`canEditBooks`) : modification des fiches de livres, déplacement entre collections et édition des collections.
  - **Supprimer des livres** (`canDeleteBooks`) : suppression de livres et de collections.
  - **Ajouter / gérer des utilisateurs** (`canManageUsers`) : création/modification/suppression de comptes, attribution des droits et paramétrage IA Vision.
- **Protection brute-force** : limitation automatique du nombre de tentatives de connexion par adresse IP (`X-Forwarded-For` pris en charge derrière Nginx).

## Déploiement sur Proxmox (Docker dans un LXC derrière un reverse-proxy Nginx HTTPS)

Le conteneur `app` expose directement son port HTTP sur `${APP_PORT:-3000}:3000` et active `trustProxy: true` pour fonctionner derrière un reverse-proxy **Nginx** qui assure la terminaison HTTPS.

### 1. Lancer uniquement le conteneur applicatif dans le LXC

```bash
docker compose up -d --build app
```

L'application écoute alors sur `http://<IP_DU_LXC>:3000`.

### 2. Exemple de configuration Nginx (HTTPS)

```nginx
server {
    listen 443 ssl http2;
    server_name bibliotheque.exemple.fr;

    ssl_certificate     /etc/letsencrypt/live/bibliotheque.exemple.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bibliotheque.exemple.fr/privkey.pem;

    # Autoriser l'envoi de photos de couverture depuis un smartphone (jusqu'à 15 Mo)
    client_max_body_size 15M;

    location / {
        proxy_pass http://127.0.0.1:3000; # ou http://<IP_DU_LXC>:3000
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> Grâce à l'en-tête `X-Forwarded-Proto https` transmis par Nginx, le serveur marque automatiquement le cookie de session `bc_session` avec l'attribut `Secure` et les navigateurs mobiles autorisent l'accès à l'appareil photo.

## Démarrage rapide avec Docker (réseau local avec Caddy)

```bash
docker compose up -d --build
```

L'application est alors exposée :
- en HTTP direct sur le port `3000` (pour un reverse-proxy externe tel que Nginx),
- et en HTTPS local via Caddy sur le port `443` (ex. `https://<IP-DU-SERVEUR>`).
L'endpoint de santé répond sur `/api/health`.

## Développement local (sans Docker)

```bash
# Installer et compiler
npm --prefix server install
npm --prefix web install
npm run build

# Lancer les tests
npm test

# Démarrer le serveur en servant le front compilé
STATIC_DIR=../web/dist npm --prefix server start
```

## Certificat HTTPS sur le réseau local (accès caméra mobile)

Les navigateurs mobiles exigent HTTPS pour autoriser l'accès à la caméra (`getUserMedia`). Caddy génère automatiquement une autorité de certification locale (`tls internal`).

### 1. Récupérer le certificat racine de Caddy

```bash
docker compose cp caddy:/data/caddy/pki/authorities/local/root.crt ./caddy-root.crt
```

### 2. Installer le certificat sur vos appareils

- **iOS (iPhone / iPad)** :
  1. Envoyez `caddy-root.crt` sur l'appareil (AirDrop, mail ou fichier) et ouvrez-le avec Safari.
  2. Allez dans **Réglages > Profil téléchargé** et installez le profil.
  3. Activez la confiance complète dans **Réglages > Général > Informations > Réglages des certificats de confiance**.
- **Android** :
  1. Copiez `caddy-root.crt` sur le téléphone.
  2. Ouvrez **Paramètres > Sécurité > Chiffrement et identifiants > Installer un certificat > Certificat CA** et sélectionnez le fichier.
- **PC (Windows / macOS)** :
  - **Windows** : double-cliquez sur `caddy-root.crt` → *Installer le certificat* → *Ordinateur local* → *Autorités de certification racines de confiance*.
  - **macOS** : ouvrez `caddy-root.crt` dans *Trousseaux d'accès* → double-cliquez sur le certificat → *Toujours faire confiance*.

## Sources ISBN et couvertures

Lors d'un scan ou d'une recherche ISBN, le serveur interroge en parallèle et fusionne les métadonnées issues de :
1. **BnF SRU (UNIMARC)** : titre, sous-titre, série et numéro de tome (zone `461`), auteurs avec rôles exacts (`070` auteur, `650` scénariste, `440` dessinateur/illustrateur), maison d'édition (`210$c` / `214$c`) et couverture BnF via l'identifiant ARK (`003`).
2. **SUDOC / ABES (UNIMARC)** : catalogue universitaire français (`isbn2ppn` + notice XML UNIMARC), avec extraction des rôles BD/manga/comics, série/tome et éditeur.
3. **Open Library** (API Books + API Search + Covers) : titre, sous-titre, auteurs, éditeur et couverture (`covers.openlibrary.org`).
4. **Google Books** : titre, sous-titre, auteurs, éditeur et miniature de couverture HTTPS. Vous pouvez définir la variable d'environnement optionnelle `GOOGLE_BOOKS_API_KEY` pour augmenter les quotas Google Books.

### Gestion des couvertures et identification par photo
- **Automatique par ISBN** : récupérée lors du scan ISBN et téléchargée localement à la validation.
- **Import de fichier ou appareil photo + recadrage** : prise de photo directe (`📷 Photo`) ou import (`📁 Fichier`) avec recadrage interactif (zoom et cadrage 2:3).
- **Identification automatique depuis la photo de couverture (`POST /api/lookup-cover`)** :
  - Lorsque vous prenez en photo une couverture sur **« Ajouter un livre »** (ou cliquez sur **« 🔍 Identifier depuis la couverture »**), le serveur conserve la photo comme couverture et analyse l'image pour pré-remplir le titre, le sous-titre, les auteurs, l'éditeur, l'ISBN et vérifier les doublons.
  - **Par défaut (100 % gratuit & local)** : OCR embarqué via `tesseract.js` (`fra+eng`) suivi d'une recherche multi-sources (BnF SRU, Google Books, Open Library).
  - **Optionnel (IA Vision)** : vous pouvez renseigner `GEMINI_API_KEY`, `OPENAI_API_KEY` ou `OLLAMA_URL` dans l'environnement Docker pour activer l'analyse multimodale sur les couvertures aux polices très stylisées (avec repli automatique sur l'OCR local).

## Sauvegarde et restauration des données

Les données SQLite (`/data/library.db`) et les images de couverture (`/data/covers`) sont stockées dans le volume Docker nommé `data`.

### Sauvegarder la base et les couvertures

```bash
docker compose cp app:/data/library.db ./backup-library.db
docker compose cp app:/data/covers ./backup-covers
```

### Restaurer la base et les couvertures

```bash
docker compose cp ./backup-library.db app:/data/library.db
docker compose cp ./backup-covers app:/data/covers
docker compose restart app
```
