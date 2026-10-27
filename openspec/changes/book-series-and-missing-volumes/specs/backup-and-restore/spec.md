# Spec Delta

## MODIFIED Requirements

### Requirement: Contenu intégral et autonome du fichier de sauvegarde
Le système SHALL inclure dans chaque fichier de sauvegarde l'intégralité des données de la bibliothèque : les livres (incluant série et numéro de tome) et leurs liaisons aux collections, les configurations de séries (dernier tome paru), les fichiers d'images de couvertures encodés en base64, les collections, le cache de métadonnées, les comptes utilisateurs avec leurs permissions et les paramètres de l'application.

#### Scenario: Sauvegarde complète des entités et couvertures
- **WHEN** une sauvegarde est générée
- **THEN** le fichier produit contient l'ensemble des collections, livres (avec série et numéro de tome), configurations de séries, associations livre-collection, images de couvertures, utilisateurs et paramètres applicatifs
