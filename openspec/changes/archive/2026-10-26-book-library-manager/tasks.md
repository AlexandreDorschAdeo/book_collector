# Tasks

## 1. Socle du projet et déploiement

- [x] 1.1 Initialiser un monorepo `server/` (Fastify, TypeScript, Vitest) et `web/` (React, Vite) ; vérifier que `npm test` et `npm run build` passent dans chacun
- [x] 1.2 Créer un `Dockerfile` multi-étapes (build du front, serveur Node sert l'API et les fichiers statiques) ; vérifier que l'image se construit et répond sur `/api/health`
- [x] 1.3 Créer `docker-compose.yml` avec le service app, un volume `data` pour le fichier SQLite et un reverse proxy Caddy en HTTPS (`tls internal`) ; vérifier que `docker compose up -d` rend l'app accessible en HTTPS
- [x] 1.4 Rédiger le `README.md` (démarrage, installation du certificat racine sur iOS/Android/PC, sauvegarde du volume) ; vérifier en suivant les étapes à froid

## 2. Base de données et collections

- [x] 2.1 Créer le schéma SQLite et les migrations (`collection`, `book`, index FTS5) ; vérifier par un test de migration sur base vide
- [x] 2.2 Implémenter l'API des collections (CRUD, unicité nom+lieu insensible à la casse, refus de suppression si un livre n'a pas d'autre collection, compteur de livres) ; vérifier avec des tests d'API couvrant les scénarios de `collection-management`
- [x] 2.3 Construire l'écran de gestion des collections (liste avec lieu et compteurs, création, édition, suppression) ; vérifier par tests de composants et contrôle manuel mobile

## 3. Catalogue de livres

- [x] 3.1 Implémenter l'API des livres (titre, sous-titre, auteurs avec rôles auteur/scénariste/dessinateur, type livre/BD/manga/comic, appartenance à au moins une collection, modification, déplacement, suppression) ; vérifier avec des tests d'API couvrant `book-catalog`
- [x] 3.2 Implémenter la liste par collection avec tri et filtre par type, et la recherche globale FTS5 insensible casse/accents ; vérifier avec des tests (ex. « uderzo », « asterix » trouvant « Astérix »)
- [x] 3.3 Construire les écrans front : liste d'une collection, fiche livre, formulaire d'ajout/édition, barre de recherche globale avec collection et lieu affichés ; vérifier par tests de composants et contrôle manuel PC/tablette/mobile
- [x] 3.4 Vérifier la persistance : redémarrer puis recréer le conteneur avec le même volume et constater que les données subsistent

## 4. ISBN et métadonnées

- [x] 4.1 Implémenter la validation et la normalisation ISBN-10/13 (tirets, clé de contrôle, conversion en ISBN-13) ; vérifier par tests unitaires avec cas valides et invalides
- [x] 4.2 Implémenter le service de métadonnées (BnF SRU, Open Library et Google Books en repli, extraction de `title`, `subtitle` et `authors` avec rôles scénariste/dessinateur/auteur, cache en base, sans couverture) ; vérifier par tests avec réponses simulées pour trouvé, introuvable et source en panne
- [x] 4.3 Exposer `GET /api/lookup?isbn=` ; vérifier par tests d'API

## 5. Détection de doublons

- [x] 5.1 Implémenter la normalisation des clés titre/auteur (casse, accents, ponctuation, articles initiaux, tome conservé) ; vérifier par tests unitaires dont « Astérix le Gaulois » et « One Piece tome 1/2 »
- [x] 5.2 Implémenter `GET /api/check` (`sameIsbn`, `otherEditions` avec auteur commun et ISBN différent, saisie sans ISBN) ; vérifier par tests d'API couvrant tous les scénarios de `duplicate-detection`

## 6. Scan et ajout depuis le téléphone

- [x] 6.1 Implémenter le composant de scan (`BarcodeDetector`, repli ZXing, gestion du refus de caméra, saisie manuelle d'ISBN) ; vérifier par tests de composants et essai réel sur iOS Safari et Android Chrome
- [x] 6.2 Construire l'écran de scan : sélection de la collection, lookup, formulaire pré-rempli, bandeau « déjà possédé » / « autre édition » / « pas encore possédé » avec collections et lieux, choix entre ajouter le livre existant à la collection sélectionnée ou créer un exemplaire supplémentaire ; vérifier par tests de composants et parcours manuel
- [x] 6.3 Permettre l'enchaînement de scans avec la même collection conservée ; vérifier en ajoutant trois livres à la suite

## 7. PWA et finitions

- [x] 7.1 Ajouter manifest, icônes et service worker pour l'installation sur l'écran d'accueil ; vérifier avec l'audit PWA de Lighthouse en HTTPS
- [x] 7.2 Vérification de bout en bout depuis `docker compose up` : créer deux collections de lieux différents, scanner un livre, le rescanner (déjà possédé), scanner une autre édition, rechercher dans toutes les collections, depuis PC, tablette et smartphone

## Workflow follow-up

- Archiver le changement une fois la revue terminée (`/opsx-archive`).
