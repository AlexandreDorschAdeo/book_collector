# Proposal

## Why

Sur smartphone et tablette, l'expérience actuelle présente plusieurs frictions majeures : les boutons du menu supérieur prennent trop de place et passent sur plusieurs lignes, cliquer sur « Modifier » ou « Déplacer » un livre affiche le formulaire tout en haut de la page sans y amener l'écran ni le focus (obligeant à remonter manuellement), et il est fastidieux de déplacer ou corriger plusieurs livres un par un. De plus, l'application manque d'une identité visuelle distinctive (icône chouette + livre).

## What Changes

- **Barre de navigation compacte sur une seule ligne** : refonte de l'en-tête et du menu principal (`App.tsx`, `styles.css`) pour que tous les boutons tiennent sur une seule ligne. Chaque entrée dispose d'une icône dédiée et d'un libellé court : sur mobile (`< 640px`), seules les icônes sont affichées (avec `aria-label` et `title` accessibles) ; sur tablette et PC (`>= 640px`), l'icône et le texte court s'affichent côte à côte.
- **Identité visuelle « Chouette érudite & Livre »** : création d'une nouvelle icône SVG vectorielle représentant une tête de chouette stylisée aux grands yeux dorés émergeant au-dessus d'un livre ouvert bleu ciel sur fond ardoise foncé (`web/public/icon.svg` pour le favicon et la PWA, ainsi que dans l'en-tête de l'application et l'écran de connexion).
- **Modales centrées avec focus automatique pour « Modifier » et « Déplacer »** : remplacement des formulaires inline affichés en haut de la page `Bibliothèque` par des fenêtres modales centrées par-dessus la liste (`role="dialog"`, `aria-modal="true"`), avec focus automatique à l'ouverture, fermeture par touche `Échap` ou clic sur l'arrière-plan, défilement interne sur petit écran et conservation de la position de défilement dans la liste des livres.
- **Écran dédié « Actions groupées » (déplacement et modification en lot)** : ajout d'un onglet dédié dans la navigation principale (accessible aux utilisateurs disposant du droit `canEditBooks`) permettant de filtrer et cocher plusieurs livres (ou de tout sélectionner/désélectionner) afin de :
  - **Déplacer la sélection en lot** vers une collection cible (avec retrait optionnel d'une collection d'origine), en une seule opération.
  - **Modifier la sélection en lot** en appliquant la même donnée aux champs choisis par l'utilisateur (Type, Maison d'édition, Sous-titre / Série, Auteurs, Collections) sur tous les livres cochés via de nouveaux endpoints API transactionnels (`POST /api/books/bulk-move` et `POST /api/books/bulk-update`).

## Capabilities

### New Capabilities

*(Aucune nouvelle capacité séparée : les évolutions enrichissent directement `book-catalog` et `web-deployment`.)*

### Modified Capabilities

- `book-catalog`: ouverture des formulaires d'édition et de déplacement unitaires en fenêtre modale centrée avec focus automatique, et ajout du déplacement et de la modification par lot sur une sélection multiple de livres.
- `web-deployment`: barre de navigation principale compacte sur une seule ligne (icônes seules sur mobile `< 640px`, icônes + texte sur tablette/PC, incluant l'entrée « Actions groupées ») et nouvelle icône « Chouette érudite & Livre » pour l'en-tête, le favicon et la PWA.

## Impact

- **Backend (`server/`)** :
  - `server/src/app.ts` et `server/src/repository.ts` : ajout des routes transactionnelles `POST /api/books/bulk-move` et `POST /api/books/bulk-update` protégées par la permission `canEditBooks`.
  - `server/test/books.test.ts` : tests unitaires et d'intégration pour le déplacement et la modification en lot.
- **Frontend (`web/`)** :
  - `web/public/icon.svg` : nouveau logo SVG chouette + livre ouvert.
  - `web/src/App.tsx` : intégration du logo dans l'en-tête, barre de navigation compacte avec icônes SVG et nouvel onglet « Actions groupées ».
  - `web/src/components/CatalogScreen.tsx` : transformation des formulaires de modification et de déplacement en fenêtres modales centrées avec focus automatique.
  - `web/src/components/BulkActionsScreen.tsx` (nouveau) : écran de sélection multiple, déplacement en lot et modification de champs en lot.
  - `web/src/api.ts` et `web/src/styles.css` : méthodes API `bulkMoveBooks` / `bulkUpdateBooks`, styles responsives de la barre de navigation sur une ligne, des modales et de l'écran d'actions groupées.
