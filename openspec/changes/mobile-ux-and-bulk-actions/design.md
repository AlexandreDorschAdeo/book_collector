# Design

## Context

L'application web `Ma Bibliothèque` (React + Vite côté client, Fastify + SQLite `better-sqlite3` côté serveur) est fréquemment utilisée sur smartphone et tablette pour consulter et ranger des livres physiques. Actuellement :
- `App.tsx` affiche un `.app-header` avec `.app-nav` contenant des boutons larges en `flex-wrap: wrap`, ce qui étale le menu sur 2 ou 3 lignes sur écran mobile.
- Dans `CatalogScreen.tsx`, cliquer sur « Modifier » ou « Déplacer » affiche un `<form className="card ...">` en haut de la liste sans changer le focus ni ouvrir de fenêtre modale ; un utilisateur ayant fait défiler sa bibliothèque ne voit pas que le formulaire s'est ouvert.
- Le serveur n'expose que des routes unitaires (`PUT /api/books/:id`, `POST /api/books/:id/move`) et l'interface ne permet pas de sélectionner plusieurs livres pour les déplacer ou harmoniser une donnée commune (type, éditeur, série/sous-titre, auteurs, collections).
- `web/public/icon.svg` contient uniquement un pictogramme de livre générique sans la mascotte souhaitée (tête de chouette + livre).

Voir `proposal.md` pour la motivation et les capacités impactées (`book-catalog`, `web-deployment`).

## Goals / Non-Goals

**Goals:**
- Garantir que les boutons du menu principal tiennent sur une seule ligne horizontale sur smartphone, tablette et PC grâce à un design compact à icônes + libellés adaptatifs.
- Afficher les formulaires « Modifier » et « Déplacer » sous forme de fenêtres modales centrées par-dessus la liste avec prise de focus automatique et conservation de la position de défilement.
- Fournir une icône SVG « Chouette érudite moderne + livre ouvert » dans `/icon.svg`, dans l'en-tête et sur l'écran de connexion.
- Permettre la sélection multiple de livres dans un onglet dédié « Actions groupées » et l'exécution atomique de déplacements ou de modifications partiels en lot côté serveur.

**Non-Goals:**
- Modifier en lot le titre individuel, l'ISBN individuel ou la couverture individuelle (ces attributs sont propres à chaque édition/ouvrage).
- Introduire une bibliothèque UI lourde externe pour les modales ou les icônes (des composants React légers et des SVG inline suffisent et préservent la rapidité du bundle).

## Decisions

### 1. Barre de navigation compacte sur une seule ligne
- **Choix** : Chaque bouton de `.app-nav` contient une icône SVG/visuelle (`aria-hidden="true"`) et un `<span className="nav-label">`. Le bouton porte toujours un `aria-label` et un `title` complets (`Ajouter un livre`, `Bibliothèque`, `Actions groupées`, `Collections`, `Paramétrage`).
- **Responsive CSS** :
  - `.app-nav` utilise `display: flex; flex-wrap: nowrap; gap: 0.35rem;` avec des boutons compacts.
  - Sur mobile (`@media (max-width: 639px)`), `.nav-label` est masqué visuellement (`display: none`) pour que les 5 boutons d'icônes tiennent confortablement sur une seule ligne (`min-width: 44px; min-height: 44px` pour respecter les cibles tactiles).
  - Sur tablette et PC (`>= 640px`), `.nav-label` est affiché à côté de l'icône sur une seule ligne.
  - La barre supérieure combine sur une ligne la marque (icône chouette + titre) et les contrôles utilisateur (badge compact + bouton déconnexion icône/texte), tandis que `.app-nav` occupe une ligne dédiée fluide et centrée/étirée sur mobile ou intégrée sur grand écran.
- **Alternative écartée** : Menu hamburger déroulant — ajoute un clic supplémentaire à chaque changement d'onglet alors que 5 icônes tiennent directement sur une ligne de 320px+.

### 2. Identité visuelle « Chouette érudite moderne & Livre » (`icon.svg` + composant `OwlBookIcon`)
- **Choix** : Créer un SVG vectoriel 128×128 sur fond ardoise foncé (`#1e293b`, `rx="28"`) combinant :
  - Dans la moitié inférieure : un livre ouvert stylisé bleu ciel (`#38bdf8` / `#0284c7`) aux pages incurvées avec une reliure centrale.
  - Au-dessus du livre : une tête de chouette géométrique moderne (plumes ardoise clair/indigo `#64748b` / `#94a3b8`, aigrettes marquées, deux grands disques oculaires dorés `#fbbf24` / `#f59e0b` aux pupilles sombres avec reflet blanc, et un bec losange ambré `#f97316` pointant vers la reliure du livre).
- **Réutilisation** : Le fichier `web/public/icon.svg` sert de favicon et d'icône PWA (`manifest.webmanifest`), et est affiché dans `.brand` (`App.tsx`) ainsi que dans `LoginScreen.tsx`.

### 3. Fenêtres modales centrées avec focus automatique (`CatalogScreen.tsx`)
- **Choix** : Encapsuler les formulaires « Modifier le livre » et « Déplacer » dans une surcouche modale fixe (`.modal-backdrop`, `position: fixed; inset: 0; z-index: 1000; background: rgba(15, 23, 42, 0.6)`) contenant une carte `.modal-dialog` (`role="dialog"`, `aria-modal="true"`, `max-height: 90vh; overflow-y: auto`).
- **Gestion du focus** :
  - Lors de l'ouverture (`showForm` ou `movingBook`), un `useEffect` place automatiquement le focus sur le premier champ interactif de la modale (`#book-title` pour la modification, `#move-from` ou `#move-to` pour le déplacement) et permet la fermeture via la touche `Escape`.
  - La liste des livres en arrière-plan ne remonte pas en haut de page : lorsque l'utilisateur ferme ou valide la modale, il retrouve exactement l'endroit où il se trouvait dans sa bibliothèque.
- **Alternative écartée** : `scrollIntoView` vers un formulaire en haut de page — oblige l'utilisateur à refaire défiler toute sa bibliothèque vers le bas après chaque modification.

### 4. Écran dédié « Actions groupées » (`BulkActionsScreen.tsx`) et API transactionnelle par lot
- **Visibilité & Permissions** : L'onglet « Actions groupées » est affiché dans `.app-nav` lorsque `currentUser.canEditBooks` est vrai.
- **Sélection des livres** :
  - L'écran reprend les filtres rapides (recherche texte, filtre par collection, filtre par type, tri) et affiche la liste des livres avec une case à cocher par livre, un bouton « Tout sélectionner / Tout désélectionner » (pour les livres filtrés affichés) et un compteur `N livre(s) sélectionné(s)`.
  - Deux panneaux/modales d'action sont proposés dès qu'au moins un livre est sélectionné :
    1. **Déplacer la sélection** : choix d'une collection cible (`toCollectionId`, obligatoire) et d'une collection source à retirer (`fromCollectionId`, optionnel : « Toutes / Ne pas retirer » ou une collection spécifique).
    2. **Modifier la sélection** : chaque champ modifiable en lot possède une case d'activation (« Appliquer ce champ à la sélection ») afin de ne modifier que les données souhaitées :
       - `type` (`book` | `bd` | `manga` | `comic`)
       - `publisher` (Maison d'édition, chaîne ou vide pour effacer)
       - `subtitle` (Sous-titre / Série, chaîne ou vide pour effacer)
       - `authors` (Liste d'auteurs + rôles à appliquer à tous les livres cochés)
       - `collectionIds` (Remplacer les collections ou ajouter/retirer des collections)
- **Endpoints Backend (`server/src/app.ts`)** :
  - `POST /api/books/bulk-move` :
    - Payload : `{ bookIds: number[]; fromCollectionId?: number | null; toCollectionId: number }`
    - Exécution dans une transaction SQLite unique : vérifie que `bookIds` est non vide et que `toCollectionId` existe ; pour chaque livre existant, ajoute `(bookId, toCollectionId)` (`INSERT OR IGNORE`) et, si `fromCollectionId` est fourni et différent de `toCollectionId`, supprime `(bookId, fromCollectionId)`. Retourne `{ updatedCount: number, books: BookDto[] }`.
  - `POST /api/books/bulk-update` :
    - Payload : `{ bookIds: number[]; fields: { type?: BookType; publisher?: string | null; subtitle?: string | null; authors?: BookAuthor[]; collectionIds?: number[] } }`
    - Exécution dans une transaction SQLite unique : valide uniquement les champs présents dans `fields`, fusionne pour chaque livre sélectionné ses données existantes avec les champs fournis dans `fields`, recalcule `title_key`, `author_key`, `authors_text` et met à jour la table `book` (et `book_collection` si `collectionIds` est fourni), ce qui maintient automatiquement l'index FTS (`book_fts`) à jour via les triggers SQLite existants.

## Risks / Trade-offs

- **[Risque] Remplacement accidentel d'un champ sur plusieurs livres lors d'une modification en lot** → **Mitigation** : Dans le formulaire de modification en lot, chaque champ est désactivé par défaut et nécessite de cocher explicitement « Modifier ce champ » avant d'être inclus dans le payload `fields` envoyé à `POST /api/books/bulk-update`.
- **[Risque] Livre se retrouvant sans collection lors d'un déplacement en lot** → **Mitigation** : Dans `POST /api/books/bulk-move`, l'insertion dans `toCollectionId` est exécutée avant le retrait éventuel de `fromCollectionId` au sein de la même transaction SQLite, garantissant que chaque livre déplacé possède toujours au moins `toCollectionId`.
- **[Risque] Manque de clarté des icônes seules sur très petit écran** → **Mitigation** : Les icônes sont choisies pour être immédiatement reconnaissables (➕/📷 Ajouter, 📚 Bibliothèque, ☑️ Actions groupées, 🗂️ Collections, ⚙️ Paramétrage), accompagnées d'un `title` et d'un `aria-label` explicites, et le texte réapparaît dès `640px` (tablettes et smartphones en mode paysage).
