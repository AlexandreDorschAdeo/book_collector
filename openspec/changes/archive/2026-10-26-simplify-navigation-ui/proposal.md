# Proposal: Simplification de la navigation et de la page d'accueil

## Why

L'interface proposait deux points d'entrée distincts pour ajouter un livre : l'onglet « Scanner ISBN » dans le menu supérieur et un bouton « Ajouter un livre » sur la page « Catalogue ». Cette duplication créait de la confusion alors que l'écran de scan permet déjà aussi bien le scan par appareil photo que la saisie manuelle complète d'un livre. De plus, le libellé « Bibliothèque » est plus naturel que « Catalogue » pour désigner la page d'accueil listant les livres possédés.

## What Changes

- **Menu de navigation supérieur (`App.tsx`)** :
  - Renommer le bouton **« Scanner ISBN »** en **« Ajouter un livre »**.
  - Renommer le bouton **« Catalogue »** en **« Bibliothèque »**.
- **Page d'accueil / Bibliothèque (`CatalogScreen.tsx`)** :
  - Supprimer le bouton **« Ajouter un livre »** dans l'en-tête de la page d'accueil (la création d'un livre passe désormais exclusivement par l'onglet **« Ajouter un livre »** du menu supérieur, tandis que la modification, le déplacement et la suppression d'un livre existant restent accessibles sur chaque carte de la bibliothèque).

## Capabilities

### New Capabilities
- *(Aucune nouvelle capacité)*

### Modified Capabilities
- `web-deployment` : précise la structure de navigation principale (« Ajouter un livre », « Bibliothèque », « Collections ») et l'unicité du point d'entrée d'ajout de livre depuis le menu supérieur.

## Impact

- **Frontend (`web/`)** : `web/src/App.tsx`, `web/src/components/CatalogScreen.tsx`, `web/src/components/ScanScreen.tsx` et tests `web/src/App.test.tsx`.
- **Backend (`server/`)** : Aucun impact API ou base de données.
