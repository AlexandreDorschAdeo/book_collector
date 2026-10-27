## MODIFIED Requirements

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

## ADDED Requirements

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
