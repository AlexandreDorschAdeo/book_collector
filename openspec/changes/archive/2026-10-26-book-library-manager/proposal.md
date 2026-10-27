# Proposal

## Why

Gérer une bibliothèque de livres physiques (romans, BD, mangas, comics) répartie dans plusieurs lieux est fastidieux : on rachète parfois un livre déjà possédé, ou une autre édition du même titre. Une application auto-hébergée, utilisable depuis un smartphone en magasin (scan du code-barre ISBN), permet de savoir immédiatement ce que l'on possède déjà.

## What Changes

- Nouvelle application web responsive (PC, tablette, smartphone), installable en PWA, livrée sous forme de conteneur Docker (docker compose).
- Ajout d'un livre en scannant le code-barre ISBN avec la caméra du téléphone, avec récupération automatique du titre, du sous-titre et des auteurs (avec distinction scénariste / dessinateur lorsque disponible) et saisie manuelle en repli.
- Types de livre : livre, BD, manga, comic book.
- Gestion de plusieurs collections, chacune associée à un lieu (ex. « Salon », « Maison de campagne »).
- Liste des livres de chaque collection et recherche transversale dans toutes les collections.
- Contrôle de doublon immédiat au scan : livre déjà possédé (même ISBN) ou même titre et même auteur dans une édition différente.

## Capabilities

### New Capabilities
- `collection-management`: création, modification et suppression de collections localisées, et appartenance des livres à une ou plusieurs collections.
- `book-catalog`: ajout, consultation, modification, suppression et affectation des livres à une ou plusieurs collections (avec leur type), liste par collection et recherche dans toutes les collections.
- `isbn-scan-lookup`: scan du code-barre ISBN depuis le navigateur, saisie manuelle de l'ISBN, et récupération des métadonnées du livre.
- `duplicate-detection`: détection, dès l'identification d'un livre, d'un exemplaire déjà possédé ou d'une autre édition du même titre et du même auteur.
- `web-deployment`: application responsive et installable, déployable par Docker avec données persistantes.

### Modified Capabilities
<!-- Aucune : projet vierge. -->

## Impact

- Projet vierge : tout le code est nouveau (backend API, base de données, front web, `Dockerfile`, `docker-compose.yml`).
- Dépendances externes : API publiques de métadonnées ISBN (catalogue SRU de la BnF pour les rôles scénariste/dessinateur et le francophone, Open Library, Google Books).
- Contrainte : l'accès caméra d'un navigateur mobile exige un contexte sécurisé (HTTPS), donc le déploiement doit fournir du HTTPS sur le réseau local.
- Hors périmètre (hors MVP) : couvertures, éditeur, année, résumé, nombre de pages et autres métadonnées secondaires ; multi-utilisateurs/authentification, prêt de livres, synchronisation hors ligne complète, import/export.

## Hypothèses

- Usage mono-utilisateur (ou foyer unique) sur réseau local, sans comptes ; la protection d'accès éventuelle relève de l'infrastructure.
- Un livre appartient à au moins une collection (il peut figurer dans plusieurs) ; un livre déjà possédé peut être ajouté à une autre collection sans créer de doublon, ou enregistré comme exemplaire distinct après confirmation.
- Interface en français.
