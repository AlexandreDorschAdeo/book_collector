# Spec Delta

## Purpose

Identifier un livre à partir de son code-barre ISBN scanné avec la caméra d'un téléphone, ou saisi à la main, et pré-remplir ses informations.

## ADDED Requirements

### Requirement: Scan du code-barre ISBN
Le système SHALL permettre de scanner avec la caméra de l'appareil le code-barre EAN-13 (ISBN-13) d'un livre depuis le navigateur.

#### Scenario: Scan réussi
- **WHEN** l'utilisateur place un code-barre ISBN lisible devant la caméra
- **THEN** le système lit l'ISBN et lance automatiquement la recherche du livre

#### Scenario: Caméra refusée ou indisponible
- **WHEN** l'accès à la caméra est refusé ou impossible
- **THEN** le système l'indique et propose la saisie manuelle de l'ISBN

### Requirement: Saisie manuelle et normalisation de l'ISBN
Le système SHALL accepter la saisie manuelle d'un ISBN-10 ou ISBN-13, avec ou sans tirets, valider sa clé de contrôle et le normaliser en ISBN-13.

#### Scenario: ISBN-10 converti
- **WHEN** l'utilisateur saisit un ISBN-10 valide
- **THEN** le système l'utilise sous la forme ISBN-13 équivalente

#### Scenario: ISBN invalide
- **WHEN** l'utilisateur saisit un ISBN dont la clé de contrôle est incorrecte
- **THEN** le système refuse la valeur et signale l'erreur

### Requirement: Récupération des métadonnées
Le système SHALL récupérer automatiquement, à partir de l'ISBN, le titre, le sous-titre et les auteurs (avec leurs rôles scénariste, dessinateur ou auteur lorsqu'ils sont connus) et les pré-remplir dans le formulaire modifiable, sans récupérer de couverture.

#### Scenario: Livre trouvé
- **WHEN** l'ISBN est connu d'une source de métadonnées
- **THEN** le formulaire d'ajout est pré-rempli avec le titre, le sous-titre et les auteurs, et l'utilisateur peut modifier ces champs ou préciser le rôle de chaque auteur avant validation

#### Scenario: Livre introuvable ou source indisponible
- **WHEN** aucune source ne renvoie de résultat ou que les sources sont injoignables
- **THEN** le système propose un formulaire vierge avec l'ISBN déjà renseigné pour saisie manuelle

### Requirement: Enchaînement de scans
Le système SHALL permettre de scanner plusieurs livres à la suite sans quitter l'écran de scan, vers une collection sélectionnée.

#### Scenario: Scan suivant
- **WHEN** l'utilisateur vient d'ajouter un livre depuis l'écran de scan
- **THEN** l'écran de scan est de nouveau prêt, avec la même collection sélectionnée
