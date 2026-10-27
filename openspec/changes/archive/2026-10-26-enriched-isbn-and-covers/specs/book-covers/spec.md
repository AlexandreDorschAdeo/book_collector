# Spec Delta

## Purpose

Associer une image de couverture à chaque livre, récupérée automatiquement à partir de l'ISBN, importée depuis un fichier ou photographiée avec recadrage, et la conserver localement pour l'afficher dans le catalogue.

## ADDED Requirements

### Requirement: Récupération automatique de la couverture par ISBN
Le système SHALL proposer automatiquement une image de couverture lors de la recherche par ISBN lorsqu'une source bibliographique en fournit une, et SHALL stocker une copie locale de cette image lors de l'enregistrement du livre.

#### Scenario: Couverture trouvée par ISBN
- **WHEN** l'utilisateur scanne ou saisit un ISBN pour lequel une couverture est disponible auprès d'une source
- **THEN** l'aperçu de la couverture s'affiche dans le formulaire d'ajout et l'image est enregistrée localement à la validation

#### Scenario: Aucune couverture trouvée
- **WHEN** aucune source ne fournit de couverture pour l'ISBN recherché
- **THEN** le formulaire affiche un emplacement vide permettant d'importer un fichier ou de prendre une photo

### Requirement: Ajout de couverture par fichier image
Le système SHALL permettre d'ajouter ou de remplacer la couverture d'un livre en sélectionnant un fichier image depuis un ordinateur, une tablette ou un smartphone.

#### Scenario: Sélection d'un fichier image
- **WHEN** l'utilisateur choisit un fichier image valide (JPEG, PNG ou WebP) dans le formulaire d'ajout ou d'édition
- **THEN** l'image est prévisualisée, peut être recadrée, et est enregistrée comme couverture du livre

### Requirement: Prise de photo et recadrage de la couverture
Le système SHALL permettre de photographier une couverture directement depuis l'appareil photo et de recadrer l'image avant de l'enregistrer.

#### Scenario: Capture et recadrage depuis le téléphone
- **WHEN** l'utilisateur déclenche la prise de photo de la couverture, ajuste la zone de recadrage et valide
- **THEN** seule la zone recadrée est conservée comme image de couverture du livre

### Requirement: Affichage et suppression de la couverture
Le système SHALL afficher la miniature de couverture dans les listes de livres, les résultats de recherche et la fiche détail, et SHALL permettre de retirer ou remplacer la couverture d'un livre existant.

#### Scenario: Affichage dans la liste et la fiche
- **WHEN** un livre possède une couverture enregistrée
- **THEN** sa miniature apparaît dans la liste de sa collection, dans la recherche globale et sur sa fiche détail

#### Scenario: Suppression de la couverture
- **WHEN** l'utilisateur supprime la couverture d'un livre lors de son édition
- **THEN** le livre est conservé sans couverture et un visuel de remplacement par défaut est affiché
