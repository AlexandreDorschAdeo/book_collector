## ADDED Requirements

### Requirement: Identification d'un livre à partir d'une photo de couverture
Le système SHALL permettre d'analyser une photo de couverture (prise avec l'appareil photo ou importée depuis un fichier) pour rechercher automatiquement les informations du livre tout en conservant cette photo comme image de couverture.

#### Scenario: Photo de couverture analysée avec correspondance bibliographique
- **WHEN** l'utilisateur photographie ou importe une couverture sur l'écran « Ajouter un livre » et lance l'analyse de la couverture
- **THEN** le système conserve l'image comme couverture du livre, extrait les indices textuels de la couverture, recherche les correspondances bibliographiques et pré-remplit le formulaire avec le livre identifié ainsi que son statut de doublon

#### Scenario: Sélection parmi plusieurs candidats trouvés
- **WHEN** l'analyse de la photo de couverture renvoie plusieurs livres ou éditions possibles auprès des sources bibliographiques
- **THEN** le système pré-remplit la meilleure correspondance et permet à l'utilisateur de sélectionner un autre candidat proposé en un clic tout en gardant sa photo de couverture
