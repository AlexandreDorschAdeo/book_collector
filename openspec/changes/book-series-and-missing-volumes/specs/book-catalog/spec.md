# Spec Delta

## MODIFIED Requirements

### Requirement: Enregistrer un livre
Le système SHALL permettre d'enregistrer un livre avec un titre obligatoire, un sous-titre optionnel, une série optionnelle, un numéro de tome optionnel (entier positif), au moins un auteur avec son rôle (auteur, scénariste ou dessinateur), un type (livre, BD, manga ou comic book), au moins une collection, un ISBN optionnel, une maison d'édition optionnelle et une image de couverture optionnelle.

#### Scenario: Ajout valide avec scénariste et dessinateur
- **WHEN** l'utilisateur enregistre une BD avec un titre, un sous-titre, un scénariste, un dessinateur et une collection
- **THEN** le livre est ajouté à cette collection avec son sous-titre et les rôles de ses auteurs

#### Scenario: Ajout avec maison d'édition et couverture
- **WHEN** l'utilisateur enregistre un livre avec une maison d'édition et une image de couverture
- **THEN** le livre est enregistré avec sa maison d'édition et sa couverture associée

#### Scenario: Ajout avec série et numéro de tome
- **WHEN** l'utilisateur enregistre un manga avec la série « One Piece » et le numéro de tome « 12 »
- **THEN** le livre est enregistré et affiché avec la série « One Piece » et le numéro de tome 12

#### Scenario: Champs obligatoires manquants
- **WHEN** l'utilisateur valide sans titre, sans au moins un auteur ou sans collection
- **THEN** le système refuse l'enregistrement et signale les champs manquants

### Requirement: Rechercher dans toutes les collections
Le système SHALL proposer une recherche textuelle sur titre, sous-titre, série, auteurs, maison d'édition et ISBN, insensible à la casse et aux accents, portant sur toutes les collections.

#### Scenario: Recherche transversale
- **WHEN** l'utilisateur saisit « uderzo », le nom d'une série ou le nom d'une maison d'édition alors que des livres correspondants existent dans deux collections
- **THEN** les résultats incluent les livres des deux collections, chacun indiquant ses collections et leurs lieux, sans répéter un livre présent dans plusieurs collections

#### Scenario: Aucun résultat
- **WHEN** la recherche ne correspond à aucun livre
- **THEN** le système affiche un message indiquant qu'aucun livre n'a été trouvé

### Requirement: Modifier plusieurs livres en lot
Le système SHALL permettre, depuis l'écran dédié aux actions groupées, d'appliquer simultanément les mêmes valeurs sur un ou plusieurs champs choisis (type, maison d'édition, série, sous-titre, auteurs, collections) à tous les livres sélectionnés, avec possibilité d'extraire automatiquement le numéro de tome depuis le titre ou sous-titre existant de chaque livre lors de l'affectation d'une série.

#### Scenario: Application d'un même type et éditeur à une sélection
- **WHEN** l'utilisateur sélectionne quatre livres, active uniquement les champs « Type » (avec la valeur « Manga ») et « Maison d'édition » (avec la valeur « Glénat »), puis valide la modification en lot
- **THEN** les quatre livres voient leur type passer à « Manga » et leur maison d'édition à « Glénat », tandis que leurs titres, ISBN, auteurs et collections respectifs restent inchangés

#### Scenario: Application d'auteurs ou de collections en lot
- **WHEN** l'utilisateur sélectionne plusieurs livres et applique une liste d'auteurs ou de collections commune via le formulaire de modification en lot
- **THEN** tous les livres sélectionnés reçoivent les auteurs ou collections définis en une seule transaction

#### Scenario: Affectation d'une série en lot avec détection automatique du tome
- **WHEN** l'utilisateur sélectionne des livres intitulés « One Piece - Tome 1 » et « One Piece - Tome 4 », active le champ « Série » avec la valeur « One Piece » et coche l'extraction automatique du numéro de tome
- **THEN** les livres sélectionnés sont rattachés à la série « One Piece » avec respectivement les numéros de tome 1 et 4
