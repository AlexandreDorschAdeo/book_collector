# Spec Delta

## Purpose

Gérer le catalogue des livres possédés (livres, BD, mangas, comics), les lister par collection et les retrouver par recherche dans toutes les collections.

## ADDED Requirements

### Requirement: Enregistrer un livre
Le système SHALL permettre d'enregistrer un livre avec un titre obligatoire, un sous-titre optionnel, au moins un auteur avec son rôle (auteur, scénariste ou dessinateur), un type (livre, BD, manga ou comic book), au moins une collection et un ISBN optionnel, sans gestion de couverture.

#### Scenario: Ajout valide avec scénariste et dessinateur
- **WHEN** l'utilisateur enregistre une BD avec un titre, un sous-titre, un scénariste, un dessinateur et une collection
- **THEN** le livre est ajouté à cette collection avec son sous-titre et les rôles de ses auteurs

#### Scenario: Champs obligatoires manquants
- **WHEN** l'utilisateur valide sans titre, sans au moins un auteur ou sans collection
- **THEN** le système refuse l'enregistrement et signale les champs manquants

### Requirement: Appartenance à plusieurs collections
Le système SHALL permettre à un livre d'appartenir à plusieurs collections et SHALL exiger qu'il appartienne à au moins une collection en permanence.

#### Scenario: Ajout à une seconde collection
- **WHEN** l'utilisateur ajoute à « Maison de campagne » un livre déjà présent dans « Salon »
- **THEN** le livre apparaît dans les deux collections, comme un seul livre

#### Scenario: Retrait de la dernière collection
- **WHEN** l'utilisateur tente de retirer un livre de sa seule collection
- **THEN** le système refuse et propose de le déplacer vers une autre collection ou de le supprimer

### Requirement: Modifier, déplacer et supprimer un livre
Le système SHALL permettre de modifier les informations d'un livre, de le déplacer d'une collection vers une autre et de le supprimer après confirmation.

#### Scenario: Déplacement
- **WHEN** l'utilisateur déplace un livre de « Salon » vers « Maison de campagne »
- **THEN** le livre apparaît dans la seconde collection et disparaît de la première, sans changer ses autres collections

#### Scenario: Suppression
- **WHEN** l'utilisateur confirme la suppression d'un livre présent dans deux collections
- **THEN** le livre disparaît des deux collections

### Requirement: Lister les livres d'une collection
Le système SHALL afficher les livres d'une collection, triables par titre, auteur ou date d'ajout, et filtrables par type.

#### Scenario: Liste filtrée
- **WHEN** l'utilisateur ouvre une collection et filtre sur le type « BD »
- **THEN** seuls les livres de type BD de cette collection sont affichés

### Requirement: Rechercher dans toutes les collections
Le système SHALL proposer une recherche textuelle sur titre, sous-titre, auteurs et ISBN, insensible à la casse et aux accents, portant sur toutes les collections.

#### Scenario: Recherche transversale
- **WHEN** l'utilisateur saisit « uderzo » alors que des livres d'Albert Uderzo existent dans deux collections
- **THEN** les résultats incluent les livres des deux collections, chacun indiquant ses collections et leurs lieux, sans répéter un livre présent dans plusieurs collections

#### Scenario: Aucun résultat
- **WHEN** la recherche ne correspond à aucun livre
- **THEN** le système affiche un message indiquant qu'aucun livre n'a été trouvé

### Requirement: Persistance des données
Le système SHALL conserver les collections et les livres après un redémarrage de l'application.

#### Scenario: Redémarrage
- **WHEN** l'application est redémarrée
- **THEN** toutes les collections et tous les livres précédemment enregistrés sont toujours disponibles
