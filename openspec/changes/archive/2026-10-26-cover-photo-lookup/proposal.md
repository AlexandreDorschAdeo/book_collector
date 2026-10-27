## Why

Certains livres (éditions anciennes, tirages spéciaux, BD/comics sans code-barre lisible ou dont le code-barre est masqué par une étiquette) sont difficiles ou plus lents à ajouter par simple scan ISBN. Permettre à l'utilisateur de photographier la couverture du livre sert un double objectif en un seul geste : conserver la photo comme couverture du livre ET analyser automatiquement cette image (via un moteur hybride : OCR local gratuit par défaut ou IA Vision optionnelle) pour rechercher les informations bibliographiques (titre, sous-titre, auteurs, maison d'édition, ISBN) et vérifier immédiatement les doublons.

## What Changes

- **Analyse hybride d'une photo de couverture (`POST /api/lookup-cover`)** :
  - **Par défaut (100 % local et gratuit, sans configuration)** : extraction du texte présent sur la couverture par OCR local (`tesseract.js`, français + anglais), filtrage intelligent des mots-clés pertinents (titre, auteur, tome, éditeur).
  - **Optionnel (IA Vision)** : si une variable d'environnement (`GEMINI_API_KEY`, `OPENAI_API_KEY` ou `OLLAMA_URL`) est renseignée, analyse multimodale de l'image pour extraire directement `{ title, subtitle, writer, illustrator, publisher, query }` même sur les typographies stylisées de BD/mangas/comics.
- **Recherche bibliographique multi-sources par texte et vérification de doublons** :
  - Interrogation parallèle de **BnF SRU** (recherche CQL plein texte), **Google Books** et **Open Library** à partir des indices extraits de la couverture.
  - Retour d'une liste de candidats correspondants (avec ISBN, titre, sous-titre, scénariste/dessinateur, maison d'édition, type et statut de doublon dans la bibliothèque locale).
- **Flux d'ajout depuis une photo de couverture dans l'interface (« Ajouter un livre »)** :
  - Lorsqu'une couverture est photographiée ou importée (ou via le bouton dédié « 🔍 Identifier depuis la couverture »), l'application analyse l'image, conserve la photo recadrée comme couverture du livre, pré-remplit la meilleure correspondance trouvée (ou les indices extraits), affiche l'alerte de doublon éventuelle et permet de choisir un autre candidat en un clic si plusieurs éditions correspondent.

## Capabilities

### New Capabilities
- *(Aucune nouvelle capacité racine : enrichissement de `book-covers` et `isbn-scan-lookup`)*

### Modified Capabilities
- `book-covers`: Permet d'analyser l'image de couverture photographiée ou importée afin d'identifier le livre tout en conservant cette image comme couverture.
- `isbn-scan-lookup`: Ajoute la recherche et l'identification bibliographique à partir de l'analyse d'une photo de couverture (moteur hybride OCR local / IA Vision + recherche BnF, Google Books et Open Library + détection de doublons).

## Impact

- **Backend (`server/`)** :
  - Nouveau module `server/src/coverLookup.ts` : pipeline hybride d'analyse d'image (OCR local `tesseract.js` / API Vision optionnelle Gemini, OpenAI ou Ollama) + recherche bibliographique textuelle multi-sources (BnF SRU, Google Books, Open Library) + vérification de doublons (`checkBookOwnership`).
  - Nouvelle route `POST /api/lookup-cover` dans `server/src/app.ts`.
- **Frontend (`web/`)** :
  - Ajout de l'action d'identification par photo de couverture dans `ScanScreen.tsx` / `CoverPickerModal.tsx` et affichage des propositions de livres trouvés avec leur statut de doublon.
- **Docker (`docker-compose.yml`, `README.md`)** :
  - Prise en charge optionnelle des variables `GEMINI_API_KEY`, `OPENAI_API_KEY` et `OLLAMA_URL`.
