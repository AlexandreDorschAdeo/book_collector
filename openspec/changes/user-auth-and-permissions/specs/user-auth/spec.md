## ADDED Requirements

### Requirement: Authentification obligatoire pour l'accès à l'application
Le système SHALL exiger qu'un utilisateur s'authentifie par identifiant et mot de passe avant de pouvoir consulter ou modifier la bibliothèque, afin de protéger l'application lors d'un accès depuis Internet sans VPN.

#### Scenario: Accès non authentifié
- **WHEN** un visiteur non connecté accède à l'application web ou appelle une route protégée de l'API
- **THEN** l'API refuse l'accès avec un code `401` et l'interface web affiche uniquement l'écran de connexion

#### Scenario: Connexion et déconnexion
- **WHEN** l'utilisateur saisit un identifiant et un mot de passe valides
- **THEN** une session authentifiée est ouverte et l'utilisateur accède à l'application selon ses droits jusqu'à sa déconnexion

### Requirement: Utilisateur administrateur initial par défaut
Le système SHALL créer automatiquement, lors de l'initialisation d'une base sans utilisateur, un compte `admin` avec le mot de passe `1234` disposant de l'ensemble des droits (`canAddBooks`, `canEditBooks`, `canDeleteBooks`, `canManageUsers`).

#### Scenario: Première ouverture de l'application
- **WHEN** la base de données est initialisée pour la première fois
- **THEN** l'utilisateur `admin` peut se connecter avec le mot de passe `1234` et possède tous les droits

### Requirement: Contrôle granulaire des autorisations sur les livres
Le système SHALL vérifier les permissions individuelles de l'utilisateur connecté pour l'ajout de livres (`canAddBooks`), la modification de livres (`canEditBooks`) et la suppression de livres (`canDeleteBooks`), aussi bien côté serveur que dans l'interface.

#### Scenario: Utilisateur autorisé uniquement à ajouter des livres
- **WHEN** un utilisateur disposant uniquement du droit `canAddBooks` est connecté
- **THEN** il peut consulter la bibliothèque et ajouter un livre, mais les actions de modification et de suppression sont masquées dans l'interface et rejetées (`403`) par l'API

#### Scenario: Utilisateur autorisé à modifier sans supprimer
- **WHEN** un utilisateur disposant du droit `canEditBooks` mais pas `canDeleteBooks` est connecté
- **THEN** il peut modifier les fiches existantes mais toute tentative de suppression d'un livre est rejetée (`403`)

### Requirement: Gestion des utilisateurs et de leurs droits
Le système SHALL permettre aux utilisateurs disposant de la permission `canManageUsers` d'ajouter de nouveaux utilisateurs, de définir ou modifier leurs autorisations (`canAddBooks`, `canEditBooks`, `canDeleteBooks`, `canManageUsers`), de réinitialiser leur mot de passe et de supprimer un compte utilisateur (en interdisant la suppression du dernier administrateur).

#### Scenario: Création d'un nouvel utilisateur avec droits choisis
- **WHEN** un administrateur crée un utilisateur depuis l'écran « ⚙️ Paramétrage » en sélectionnant ses autorisations et son mot de passe
- **THEN** le nouvel utilisateur est enregistré avec son mot de passe haché et peut se connecter immédiatement avec les droits définis

#### Scenario: Protection du dernier administrateur
- **WHEN** un administrateur tente de supprimer le dernier compte possédant le droit `canManageUsers` ou de lui retirer ce droit
- **THEN** le système refuse l'opération et conserve au moins un compte capable de gérer les utilisateurs
