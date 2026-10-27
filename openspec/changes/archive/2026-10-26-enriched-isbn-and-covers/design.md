# Design

## Context

L'application dispose déjà d'un serveur Fastify + SQLite (`server/`) et d'un front React/Vite (`web/`) déployés via Docker Compose avec un volume persistant `/data`. Actuellement, `server/src/metadata.ts` interroge séquentiellement la BnF (UNIMARC), Open Library (`api/books`) et Google Books (`volumes`), mais :
- n'extrait que `200$a/$e/$h/$i` et `700-702` dans l'UNIMARC (en ignorant la série/numéro de tome en zone `461`, la maison d'édition en `210$c`/`214$c`, et l'identifiant ARK en `003` pour les couvertures BnF) ;
- n'interroge pas le catalogue francophone **SUDOC (ABES)**, pourtant très riche sur les éditions françaises et les BD/mangas ;
- n'expose ni maison d'édition (`publisher`) ni image de couverture (`coverUrl` / `coverPath`).

Voir `proposal.md` pour la motivation complète.

## Goals / Non-Goals

**Goals:**
- Maximiser le taux de découverte et la qualité des métadonnées ISBN (titre, sous-titre/série/tome, auteurs avec rôles scénariste/dessinateur/auteur, maison d'édition, couverture) grâce à une interrogation parallèle et une fusion par priorité.
- Permettre trois modes d'ajout de couverture : automatique via l'ISBN, par fichier (PC/tablette/smartphone) et par prise de photo directe avec recadrage interactif.
- Conserver les images de couverture localement dans le volume Docker (`/data/covers`) pour éviter les liens externes cassés ou les blocages de contenu mixte/CORS.

**Non-Goals:**
- Reconnaissance optique (OCR) de la couverture pour deviner le titre sans ISBN.
- Édition avancée d'image au-delà du recadrage (filtres, rotation fine multi-calques).

## Decisions

### 1. Pipeline multi-sources ISBN en parallèle avec fusion champ par champ
- **Choix** : Interroger en parallèle (`Promise.allSettled` avec timeout individuel de 4,5 s) quatre sources complémentaires :
  1. **BnF SRU UNIMARC** (`catalogue.bnf.fr/api/SRU`, requête sur ISBN-13 et ISBN-10) :
     - Titre et sous-titre : zone `200` (`$a`, `$e`, `$h`, `$i`) complétée par la zone `461` (`$t` titre de série, `$v` numéro de tome) lorsque l'ouvrage fait partie d'une série de BD/manga.
     - Maison d'édition : zone `214$c` ou `210$c`.
     - Auteurs et rôles : zones `700`/`701`/`702` (`$4` : `690`/`090` → `writer`, `440`/`350` → `illustrator`, sinon `author`).
     - Couverture : si la zone `003` contient l'identifiant ARK (`ark:/12148/cb...`), construire l'URL de vignette BnF (`https://catalogue.bnf.fr/couverture?appName=NE&idArk=<ark>&couverture=1`) et vérifier qu'elle renvoie une vraie image.
  2. **SUDOC / ABES** (`https://www.sudoc.fr/services/isbn2ppn/<isbn>` puis récupération XML UNIMARC `https://www.sudoc.fr/<ppn>.xml`) :
     - Même richesse UNIMARC francophone (titre, série/tome, éditeur `210$c`/`214$c`, rôles `700-702$4`).
  3. **Open Library** (`api/books?bibkeys=ISBN:...&jscmd=data` + `search.json?isbn=...`) :
     - Récupère `title`, `subtitle`, `authors`, `publishers[0].name`, et l'URL de couverture `https://covers.openlibrary.org/b/isbn/<isbn13>-L.jpg?default=false`.
  4. **Google Books** (`googleapis.com/books/v1/volumes?q=isbn:...`, avec clé optionnelle `GOOGLE_BOOKS_API_KEY`) :
     - Récupère `title`, `subtitle`, `authors`, `publisher`, et `imageLinks.thumbnail` / `smallThumbnail` (passé en HTTPS).
- **Règle de fusion** :
  - Priorité pour `title`, `subtitle` et `publisher` : BnF → SUDOC → Open Library → Google Books.
  - Priorité pour `authors` : privilégier la liste qui distingue les rôles (`writer`/`illustrator`) issue de BnF ou SUDOC ; à défaut, utiliser Open Library ou Google Books.
  - Priorité pour `coverUrl` : première couverture valide disponible parmi Open Library Covers (`?default=false`), Google Books (`imageLinks`), ou BnF ARK.
- **Pourquoi** : L'interrogation parallèle plafonne le temps de réponse au timeout d'une seule source tout en combinant la précision francophone (BnF/SUDOC pour les rôles BD et éditeurs) avec la couverture d'images d'Open Library et Google Books.

### 2. Stockage local des couvertures et format d'échange
- **Choix** :
  - Les couvertures validées sont enregistrées sous forme de fichiers image dans un dossier dédié `<DATA_DIR>/covers/<bookId>-<timestamp>.<ext>` (par défaut `/data/covers/` dans le volume Docker) et servies par `GET /api/covers/:filename`.
  - Le formulaire d'ajout/édition peut fournir soit :
    - `coverDataUrl` : une Data URL (`data:image/jpeg;base64,...` ou `webp`/`png`, max 5 Mo) produite par le composant de recadrage/sélection de fichier côté client ;
    - `coverSourceUrl` : l'URL distante trouvée lors du lookup ISBN, que le serveur télécharge et persiste localement lors de `POST /api/books` ou `PUT /api/books/:id` ;
    - `removeCover: true` : pour supprimer la couverture existante.
- **Pourquoi** : Le redimensionnement et le recadrage sur `<canvas>` dans le navigateur produisent directement un JPEG optimisé (~80–200 Ko en `data:image/jpeg;base64,...`), ce qui évite d'alourdir le backend avec des bibliothèques natives de traitement d'image (`sharp`/`libvips`) et garantit que toutes les couvertures sont persistées dans le volume `/data`.

### 3. Capture photo et recadrage interactif sur `<canvas>`
- **Choix** : Créer un composant léger `CoverPickerModal.tsx` sans dépendance externe lourde :
  - Permet de choisir un fichier (`<input type="file" accept="image/*" />`) ou de prendre une photo directement via la caméra (`getUserMedia` ou `<input type="file" accept="image/*" capture="environment" />`).
  - Affiche l'image dans un éditeur de recadrage tactile/souris (zoom, déplacement et cadre au ratio livre 2:3 ou ajustable) et exporte la zone choisie via `canvas.toDataURL('image/jpeg', 0.85)` (dimension max 600×900 px).
- **Pourquoi** : Fonctionne de manière identique sur PC, tablette et smartphone, y compris hors-ligne une fois la page chargée, et produit des miniatures légères et homogènes.

### 4. Migration SQLite sans perte de données
- **Choix** : Dans `server/src/db.ts`, vérifier via `PRAGMA table_info(book)` la présence des colonnes `publisher TEXT` et `cover_path TEXT`, les ajouter par `ALTER TABLE book ADD COLUMN ...` si absentes, et reconstruire la table virtuelle `book_fts` et ses triggers pour indexer `publisher` en plus de `title`, `subtitle`, `authors_text` et `isbn13`.

## Risks / Trade-offs

- **[Couverture BnF générique « image non disponible »]** → La BnF renvoie parfois une petite image placeholder lorsque la couverture n'est pas numérisée ; privilégier Open Library (`?default=false` qui renvoie 404 si absente) et Google Books en priorité pour l'image, ou vérifier la taille/type de la réponse.
- **[Poids des photos prises sur smartphone (10+ Mo)]** → Le recadrage/redimensionnement sur `<canvas>` côté client (max 600×900 px, JPEG qualité 0.85) réduit l'image à moins de 200 Ko avant envoi au serveur.
