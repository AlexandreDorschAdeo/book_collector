# Spec Delta

## MODIFIED Requirements

### Requirement: Enregistrer un livre
Le système SHALL permettre d'enregistrer un livre avec un titre obligatoire, un sous-titre optionnel, au moins un auteur avec son rôle (auteur, scénariste ou dessinateur), un type (livre, BD, manga ou comic book), au moins une collection, un ISBN optionnel, une maison d'édition optionnelle et une image de couverture optionnelle.

#### Scenario: Ajout valide avec scénariste et dessinateur
- **WHEN** l'utilisateur enregistre une BD avec un titre, un sous-titre, un scénariste, un dessinateur et une collection
- **THEN** le livre est ajouté à cette collection avec son sous-titre et les rôles de ses auteurs

#### Scenario: Ajout avec maison d'édition et couverture
- **WHEN** l'utilisateur enregistre un livre avec une maison d'édition et une image de couverture
- **THEN** le livre est enregistré avec sa maison d'édition et sa couverture associée

#### Scenario: Champs obligatoires manquants
- **WHEN** l'utilisateur valide sans titre, sans au moins un auteur ou sans collection
- **THEN** le système refuse l'enregistrement et signale les champs manquants

### Requirement: Rechercher dans toutes les collections
Le système SHALL proposer une recherche textuelle sur titre, sous-titre, auteurs, maison d'édition et ISBN, insensible à la casse et aux accents, portant sur toutes les collections.

#### Scenario: Recherche transversale
- **WHEN** l'utilisateur saisit « uderzo » ou le nom d'une maison d'édition alors que des livres correspondants existent dans deux collections
- **THEN** les résultats incluent les livres des deux collections, chacun indiquant ses collections et leurs lieux, sans répéter un livre présent dans plusieurs collections

#### Scenario: Aucun résultat
- **WHEN** la recherche ne correspond à aucun livre
- **THEN** le système affiche un message indiquant qu'aucun livre n'a été trouvé
