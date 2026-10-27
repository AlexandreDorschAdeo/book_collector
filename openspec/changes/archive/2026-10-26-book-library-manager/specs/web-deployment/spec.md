# Spec Delta

## Purpose

Rendre l'application accessible depuis un PC, une tablette et un smartphone, déployable simplement par Docker avec des données conservées.

## ADDED Requirements

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
