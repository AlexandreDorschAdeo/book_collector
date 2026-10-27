## 1. Backend : Analyse hybride d'image de couverture et recherche bibliographique

- [x] 1.1 Créer `server/src/coverLookup.ts` avec l'extraction hybride d'indices depuis une image base64 (OCR local `tesseract.js` par défaut + support optionnel IA Vision via `GEMINI_API_KEY`, `OPENAI_API_KEY` ou `OLLAMA_URL` avec repli automatique sur l'OCR).
- [x] 1.2 Implémenter dans `server/src/coverLookup.ts` et `server/src/metadata.ts` la recherche bibliographique textuelle multi-sources (BnF SRU avec extraction de l'ISBN `010$a`, Google Books `volumes?q=`, Open Library `search.json?q=`), la déduplication des candidats et l'enrichissement de chaque candidat avec `checkBookOwnership`.
- [x] 1.3 Exposer la route `POST /api/lookup-cover` dans `server/src/app.ts` et ajouter les tests unitaires et d'intégration (`server/test/cover-lookup.test.ts`).

## 2. Frontend : Identification depuis la photo de couverture dans « Ajouter un livre »

- [x] 2.1 Ajouter `lookupCover(imageDataUrl)` dans `web/src/api.ts` et mettre à jour `CoverPickerModal.tsx` et `ScanScreen.tsx` pour analyser la photo de couverture (automatiquement à la capture si le formulaire est vierge, ou via le bouton « 🔍 Identifier depuis la couverture »).
- [x] 2.2 Afficher dans `ScanScreen.tsx` l'état d'analyse, le pré-remplissage automatique du meilleur résultat (titre, sous-titre, auteurs, éditeur, ISBN, alerte de doublon) tout en conservant la photo de couverture, ainsi que la liste compacte des autres candidats éventuels pour changer de sélection en un clic.
- [x] 2.3 Ajouter les tests composants dans `web/src/App.test.tsx` pour vérifier le flux complet d'identification par photo de couverture, de sélection d'un candidat et de détection de doublon.

## 3. Configuration Docker et vérification

- [x] 3.1 Mettre à jour `docker-compose.yml` et `README.md` pour documenter le mode OCR local par défaut et les variables optionnelles d'IA Vision (`GEMINI_API_KEY`, `OPENAI_API_KEY`, `OLLAMA_URL`), puis valider avec `npm run build`, `npm test` et `docker compose up -d --build`.
