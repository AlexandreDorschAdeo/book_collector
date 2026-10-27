# Tasks

## 1. API Backend : Déplacement et modification en lot de livres

- [x] 1.1 Ajouter dans `server/src/app.ts` (et `server/src/repository.ts` si nécessaire) la route `POST /api/books/bulk-move` protégée par `canEditBooks` pour déplacer en une transaction SQLite une liste de `bookIds` vers `toCollectionId` (avec retrait optionnel de `fromCollectionId`), et vérifier son comportement via de nouveaux tests dans `server/test/books.test.ts` (`npm test --workspace=server`).
- [x] 1.2 Ajouter dans `server/src/app.ts` la route `POST /api/books/bulk-update` protégée par `canEditBooks` permettant d'appliquer en une transaction SQLite les champs sélectionnés (`type`, `publisher`, `subtitle`, `authors`, `collectionIds`) à une liste de `bookIds` tout en recalculant les clés normalisées et l'index FTS, et vérifier son comportement via des tests unitaires/intégration dans `server/test/books.test.ts` (`npm test --workspace=server`).
- [x] 1.3 Exposer les méthodes `bulkMoveBooks` et `bulkUpdateBooks` dans le client HTTP `web/src/api.ts` et vérifier la compilation TypeScript (`npm run build --workspace=web`).

## 2. Identité visuelle « Chouette érudite & Livre » et Navigation compacte sur une ligne

- [x] 2.1 Remplacer `web/public/icon.svg` par l'emblème vectoriel « Chouette érudite moderne + livre ouvert » (tête de chouette aux grands yeux dorés émergeant au-dessus d'un livre ouvert bleu ciel sur fond ardoise foncé) et l'afficher dans l'en-tête de `web/src/App.tsx` ainsi que dans `web/src/components/LoginScreen.tsx`, en vérifiant que l'icône est présente et valide.
- [x] 2.2 Refondre la barre de navigation principale dans `web/src/App.tsx` et `web/src/styles.css` pour que tous les boutons (`Ajouter un livre`, `Bibliothèque`, `Actions groupées`, `Collections`, `Paramétrage`) tiennent sur une seule ligne horizontale avec icônes seules sur mobile (`< 640px`, avec `aria-label` et `title`) et icônes + libellé court sur tablette/PC (`>= 640px`), et vérifier avec les tests dans `web/src/App.test.tsx` (`npm test --workspace=web`).

## 3. Fenêtres modales centrées avec focus automatique dans la Bibliothèque

- [x] 3.1 Transformer les formulaires inline « Modifier le livre » et « Déplacer » de `web/src/components/CatalogScreen.tsx` en fenêtres modales centrées (`role="dialog"`, `aria-modal="true"`) dotées d'une prise de focus automatique sur le premier champ à l'ouverture, d'une fermeture par touche `Escape` ou bouton « Annuler », et d'un défilement interne sans perte de la position dans la liste, puis vérifier ce comportement par un test dans `web/src/App.test.tsx` (`npm test --workspace=web`).

## 4. Écran dédié « Actions groupées » (Sélection multiple, déplacement et modification en lot)

- [x] 4.1 Créer le composant `web/src/components/BulkActionsScreen.tsx` et l'intégrer dans `web/src/App.tsx` sous l'onglet « Actions groupées » (visible si `canEditBooks`), avec recherche/filtres, cases à cocher par livre, bouton « Tout sélectionner / Tout désélectionner », modale/panneau de déplacement en lot et modale/panneau de modification en lot par champs activables (`type`, `publisher`, `subtitle`, `authors`, `collectionIds`), puis vérifier le flux complet avec des tests dans `web/src/App.test.tsx` (`npm test --workspace=web`).
