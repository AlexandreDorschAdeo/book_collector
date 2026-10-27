# book-catalog Specification

## Purpose

Gérer le catalogue des livres possédés (livres, BD, mangas, comics), les lister par collection et les retrouver par recherche dans toutes les collections.

## Requirements

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

### Requirement: Appartenance à plusieurs collections
Le système SHALL permettre à un livre d'appartenir à plusieurs collections et SHALL exiger qu'il appartienne à au moins une collection en permanence.

#### Scenario: Ajout à une seconde collection
- **WHEN** l'utilisateur ajoute à « Maison de campagne » un livre déjà présent dans « Salon »
- **THEN** le livre apparaît dans les deux collections, comme un seul livre

#### Scenario: Retrait de la dernière collection
- **WHEN** l'utilisateur tente de retirer un livre de sa seule collection
- **THEN** le système refuse et propose de le déplacer vers une autre collection ou de le supprimer

### Requirement: Modifier, déplacer et supprimer un livre
Le système SHALL permettre de modifier les informations d'un livre ou de le déplacer d'une collection vers une autre dans une fenêtre modale centrée avec prise de focus automatique, et de le supprimer après confirmation, tout en conservant la position de défilement dans la liste.

#### Scenario: Ouverture en modale avec focus automatique
- **WHEN** l'utilisateur clique sur « Modifier » ou « Déplacer » sur une fiche de livre située en bas de la liste
- **THEN** le formulaire correspondant s'ouvre dans une fenêtre modale visible immédiatement au centre de l'écran avec le focus clavier placé dans la modale, sans obliger l'utilisateur à remonter en haut de la page

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
Le système SHALL proposer une recherche textuelle sur titre, sous-titre, auteurs, maison d'édition et ISBN, insensible à la casse et aux accents, portant sur toutes les collections.

#### Scenario: Recherche transversale
- **WHEN** l'utilisateur saisit « uderzo » ou le nom d'une maison d'édition alors que des livres correspondants existent dans deux collections
- **THEN** les résultats incluent les livres des deux collections, chacun indiquant ses collections et leurs lieux, sans répéter un livre présent dans plusieurs collections

#### Scenario: Aucun résultat
- **WHEN** la recherche ne correspond à aucun livre
- **THEN** le système affiche un message indiquant qu'aucun livre n'a été trouvé

### Requirement: Persistance des données
Le système SHALL conserver les collections et les livres après un redémarrage de l'application.

#### Scenario: Redémarrage
- **WHEN** l'application est redémarrée
- **THEN** toutes les collections et tous les livres précédemment enregistrés sont toujours disponibles

### Requirement: Déplacer plusieurs livres en lot
Le système SHALL proposer un écran dédié permettant de sélectionner plusieurs livres et de les déplacer simultanément vers une collection cible, avec retrait optionnel d'une collection source, en une seule opération atomique.

#### Scenario: Déplacement groupé entre deux collections
- **WHEN** l'utilisateur sélectionne trois livres dans l'écran d'actions groupées, choisit la collection source « Salon » et la collection cible « Bureau », puis valide le déplacement
- **THEN** les trois livres sont ajoutés à « Bureau » et retirés de « Salon » en une seule opération

#### Scenario: Sélection vide refusée au déplacement groupé
- **WHEN** l'utilisateur tente de lancer un déplacement en lot sans avoir coché de livre
- **THEN** l'action de déplacement est désactivée ou refusée avec un message explicite

### Requirement: Modifier plusieurs livres en lot
Le système SHALL permettre, depuis l'écran dédié aux actions groupées, d'appliquer simultanément les mêmes valeurs sur un ou plusieurs champs choisis (type, maison d'édition, sous-titre/série, auteurs, collections) à tous les livres sélectionnés, sans altérer les champs non cochés.

#### Scenario: Application d'un même type et éditeur à une sélection
- **WHEN** l'utilisateur sélectionne quatre livres, active uniquement les champs « Type » (avec la valeur « Manga ») et « Maison d'édition » (avec la valeur « Glénat »), puis valide la modification en lot
- **THEN** les quatre livres voient leur type passer à « Manga » et leur maison d'édition à « Glénat », tandis que leurs titres, ISBN, auteurs et collections respectifs restent inchangés

#### Scenario: Application d'auteurs ou de collections en lot
- **WHEN** l'utilisateur sélectionne plusieurs livres et applique une liste d'auteurs ou de collections commune via le formulaire de modification en lot
- **THEN** tous les livres sélectionnés reçoivent les auteurs ou collections définis en une seule transaction

