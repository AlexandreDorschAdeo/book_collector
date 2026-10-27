# web-deployment Specification

## Purpose

Rendre l'application accessible depuis un PC, une tablette et un smartphone, déployable simplement par Docker avec des données conservées.

## Requirements

### Requirement: Interface web responsive
Le système SHALL fournir une interface web en français utilisable sur écrans d'ordinateur, de tablette et de smartphone, avec des commandes adaptées au tactile.

#### Scenario: Usage mobile
- **WHEN** l'utilisateur ouvre l'application sur un smartphone
- **THEN** la navigation, les listes et les formulaires sont utilisables sans défilement horizontal ni zoom

### Requirement: Installable sur l'écran d'accueil
Le système SHALL pouvoir être installé comme application web progressive sur l'écran d'accueil d'un appareil mobile.

#### Scenario: Installation
- **WHEN** l'utilisateur accède à l'application en HTTPS depuis un navigateur mobile compatible
- **THEN** le navigateur permet d'ajouter l'application à l'écran d'accueil

### Requirement: Déploiement Docker
Le système SHALL se lancer avec une seule commande `docker compose up` et exposer l'interface web sur le réseau local.

#### Scenario: Démarrage
- **WHEN** l'utilisateur exécute `docker compose up -d` sur une machine disposant de Docker
- **THEN** l'application est accessible depuis un navigateur du réseau local

### Requirement: Accès HTTPS pour la caméra
Le système SHALL être servi en HTTPS afin que les navigateurs mobiles autorisent l'accès à la caméra, et SHALL documenter l'installation du certificat sur les appareils.

#### Scenario: Scan depuis le téléphone
- **WHEN** l'utilisateur ouvre l'application en HTTPS sur son téléphone et lance le scan
- **THEN** le navigateur demande l'autorisation d'utiliser la caméra

### Requirement: Volume de données persistant
Le système SHALL stocker ses données dans un volume Docker conservé lors de la recréation du conteneur.

#### Scenario: Recréation du conteneur
- **WHEN** le conteneur est supprimé puis recréé avec le même volume
- **THEN** les collections et les livres sont toujours présents

### Requirement: Navigation principale unifiée
Le système SHALL afficher dans la barre de navigation supérieure les entrées « Ajouter un livre », « Bibliothèque » et « Collections », et SHALL centraliser la création de nouveaux livres dans l'écran « Ajouter un livre » sans bouton d'ajout redondant sur la page « Bibliothèque ».

#### Scenario: Libellés du menu supérieur
- **WHEN** l'utilisateur consulte l'en-tête de l'application
- **THEN** le menu principal présente les boutons « Ajouter un livre », « Bibliothèque » et « Collections »

#### Scenario: Page d'accueil Bibliothèque sans bouton d'ajout redondant
- **WHEN** l'utilisateur affiche la page d'accueil « Bibliothèque »
- **THEN** la liste des livres et les filtres de recherche s'affichent sans bouton « Ajouter un livre » dans l'en-tête de la liste
