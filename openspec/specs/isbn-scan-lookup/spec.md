# isbn-scan-lookup Specification

## Purpose

Identifier un livre à partir de son code-barre ISBN scanné avec la caméra d'un téléphone, ou saisi à la main, et pré-remplir ses informations.

## Requirements

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
Le système SHALL récupérer automatiquement, à partir de l'ISBN, le titre, le sous-titre (incluant le titre de série ou numéro de tome lorsqu'il est distinct), les auteurs (avec leurs rôles scénariste, dessinateur ou auteur lorsqu'ils sont connus), la maison d'édition et l'image de couverture, et les pré-remplir dans le formulaire modifiable.

#### Scenario: Livre trouvé
- **WHEN** l'ISBN est connu d'au moins une source de métadonnées
- **THEN** le formulaire d'ajout est pré-rempli avec le titre, le sous-titre, les auteurs, la maison d'édition et l'aperçu de couverture disponibles, et l'utilisateur peut modifier ces champs avant validation

#### Scenario: Livre introuvable ou source indisponible
- **WHEN** aucune source ne renvoie de résultat ou que les sources sont injoignables
- **THEN** le système propose un formulaire vierge avec l'ISBN déjà renseigné pour saisie manuelle

### Requirement: Fusion multi-sources des métadonnées ISBN
Le système SHALL interroger plusieurs sources bibliographiques complémentaires et fusionner leurs réponses afin de compléter les champs manquants d'une source par ceux d'une autre.

#### Scenario: Complément entre sources
- **WHEN** une première source fournit le titre, la maison d'édition et les rôles scénariste/dessinateur mais pas de couverture, et qu'une seconde source fournit une image de couverture pour ce même ISBN
- **THEN** le résultat retourné combine les métadonnées complètes de la première source et la couverture de la seconde

### Requirement: Enchaînement de scans
Le système SHALL permettre de scanner plusieurs livres à la suite sans quitter l'écran de scan, vers une collection sélectionnée.

#### Scenario: Scan suivant
- **WHEN** l'utilisateur vient d'ajouter un livre depuis l'écran de scan
- **THEN** l'écran de scan est de nouveau prêt, avec la même collection sélectionnée

### Requirement: Analyse hybride de couverture et recherche multi-sources par texte
Le système SHALL extraire les informations visibles sur une image de couverture via un moteur hybride (OCR local gratuit par défaut, ou modèle IA Vision si configuré) et SHALL interroger les sources bibliographiques (BnF, Google Books, Open Library) pour retourner les métadonnées complètes (ISBN, titre, sous-titre, auteurs/scénariste/dessinateur, maison d'édition) ainsi que la vérification des doublons.

#### Scenario: Extraction par OCR local par défaut
- **WHEN** aucune clé d'API Vision externe n'est configurée et qu'une image de couverture est soumise à l'analyse
- **THEN** le système extrait le texte de la couverture par OCR local et recherche les livres correspondants auprès de la BnF, Google Books et Open Library

#### Scenario: Extraction par IA Vision optionnelle
- **WHEN** un fournisseur IA Vision est configuré (`GEMINI_API_KEY`, `OPENAI_API_KEY` ou `OLLAMA_URL`) via l'écran « ⚙️ Paramétrage » ou l'environnement et qu'une image de couverture est soumise à l'analyse
- **THEN** le système identifie le titre, les auteurs et l'éditeur via le modèle Vision puis enrichit les données et l'ISBN auprès des sources bibliographiques

#### Scenario: Configuration depuis l'écran Paramétrage
- **WHEN** l'utilisateur clique sur le bouton « ⚙️ Paramétrage » dans le menu supérieur et enregistre ses clés ou URLs (`GEMINI_API_KEY`, `OPENAI_API_KEY`, `OLLAMA_URL`, `GOOGLE_BOOKS_API_KEY`)
- **THEN** le système sauvegarde ces paramètres dans la base SQLite persistante et les utilise immédiatement pour les analyses de couverture suivantes

#### Scenario: Vérification immédiate des doublons sur les résultats d'analyse
- **WHEN** un livre est identifié à partir de la photo de couverture
- **THEN** le système vérifie immédiatement si ce livre (par ISBN ou par couple titre + auteur normalisés) est déjà présent dans les collections de l'utilisateur et affiche l'alerte correspondante
