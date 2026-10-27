# Design: Simplification de la navigation et de la page d'accueil

## Context

Actuellement, `App.tsx` affiche trois onglets dans la barre de navigation supérieure : « Scanner ISBN », « Catalogue » et « Collections ». La vue par défaut (`CatalogScreen.tsx`) comporte en plus un bouton « Ajouter un livre » qui ouvre un second formulaire de création dépourvu du lecteur de code-barre et de la détection immédiate des doublons.

## Goals / Non-Goals

**Goals:**
- Renommer dans `App.tsx` le bouton de navigation « Scanner ISBN » en **« Ajouter un livre »** et « Catalogue » en **« Bibliothèque »**.
- Retirer le bouton **« Ajouter un livre »** sur la page d'accueil (`CatalogScreen.tsx`) afin d'éviter la duplication des formulaires d'ajout.
- Conserver dans `CatalogScreen.tsx` le formulaire d'édition uniquement lorsqu'un utilisateur clique sur « Modifier » sur un livre existant.

**Non-Goals:**
- Modifier les routes API ou le schéma SQLite.

## Decisions

1. **Unicité de l'écran d'ajout (`ScanScreen`)** :
   - L'onglet « Ajouter un livre » ouvre `ScanScreen`, qui permet à la fois de scanner un code-barre ISBN (ou de le saisir) et de renseigner manuellement un livre sans ISBN, avec vérification des doublons et sélection de couverture.
2. **Édition uniquement dans `CatalogScreen`** :
   - `CatalogScreen` n'expose plus de bouton « Ajouter un livre » dans son en-tête et utilise son formulaire intégré uniquement en mode édition (`editingBook !== null`).
