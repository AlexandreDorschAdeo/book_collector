# Spec Delta

## MODIFIED Requirements

### Requirement: Récupération des métadonnées
Le système SHALL récupérer automatiquement, à partir de l'ISBN, le titre, le sous-titre (incluant le titre de série ou numéro de tome lorsqu'il est distinct), les auteurs (avec leurs rôles scénariste, dessinateur ou auteur lorsqu'ils sont connus), la maison d'édition et l'image de couverture, et les pré-remplir dans le formulaire modifiable.

#### Scenario: Livre trouvé
- **WHEN** l'ISBN est connu d'au moins une source de métadonnées
- **THEN** le formulaire d'ajout est pré-rempli avec le titre, le sous-titre, les auteurs, la maison d'édition et l'aperçu de couverture disponibles, et l'utilisateur peut modifier ces champs avant validation

#### Scenario: Livre introuvable ou source indisponible
- **WHEN** aucune source ne renvoie de résultat ou que les sources sont injoignables
- **THEN** le système propose un formulaire vierge avec l'ISBN déjà renseigné pour saisie manuelle

## ADDED Requirements

### Requirement: Fusion multi-sources des métadonnées ISBN
Le système SHALL interroger plusieurs sources bibliographiques complémentaires et fusionner leurs réponses afin de compléter les champs manquants d'une source par ceux d'une autre.

#### Scenario: Complément entre sources
- **WHEN** une première source fournit le titre, la maison d'édition et les rôles scénariste/dessinateur mais pas de couverture, et qu'une seconde source fournit une image de couverture pour ce même ISBN
- **THEN** le résultat retourné combine les métadonnées complètes de la première source et la couverture de la seconde
