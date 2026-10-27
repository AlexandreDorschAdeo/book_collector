# Spec Delta

## MODIFIED Requirements

### Requirement: Récupération des métadonnées
Le système SHALL récupérer automatiquement, à partir de l'ISBN, le titre, le sous-titre, la série et le numéro de tome (extraits des zones de série ou détectés dans le titre/sous-titre), les auteurs (avec leurs rôles scénariste, dessinateur ou auteur), la maison d'édition et l'image de couverture, et les pré-remplir dans le formulaire modifiable.

#### Scenario: Livre trouvé
- **WHEN** l'ISBN est connu d'au moins une source de métadonnées
- **THEN** le formulaire d'ajout est pré-rempli avec le titre, le sous-titre, la série, le numéro de tome, les auteurs, la maison d'édition et l'aperçu de couverture disponibles, et l'utilisateur peut modifier ces champs avant validation

#### Scenario: Détection automatique de la série et du numéro de tome
- **WHEN** les métadonnées d'un ISBN contiennent une mention de série ou un motif de tome tel que « One Piece - Tome 12 » ou une zone UNIMARC de série avec numéro de volume
- **THEN** le système pré-remplit automatiquement le champ « Série » (ex. « One Piece ») et le champ « N° de tome » (ex. « 12 ») dans le formulaire

#### Scenario: Livre introuvable ou source indisponible
- **WHEN** aucune source ne renvoie de résultat ou que les sources sont injoignables
- **THEN** le système propose un formulaire vierge avec l'ISBN déjà renseigné pour saisie manuelle
