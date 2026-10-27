# Spec Delta

## ADDED Requirements

### Requirement: Navigation principale unifiée
Le système SHALL afficher dans la barre de navigation supérieure les entrées « Ajouter un livre », « Bibliothèque » et « Collections », et SHALL centraliser la création de nouveaux livres dans l'écran « Ajouter un livre » sans bouton d'ajout redondant sur la page « Bibliothèque ».

#### Scenario: Libellés du menu supérieur
- **WHEN** l'utilisateur consulte l'en-tête de l'application
- **THEN** le menu principal présente les boutons « Ajouter un livre », « Bibliothèque » et « Collections »

#### Scenario: Page d'accueil Bibliothèque sans bouton d'ajout redondant
- **WHEN** l'utilisateur affiche la page d'accueil « Bibliothèque »
- **THEN** la liste des livres et les filtres de recherche s'affichent sans bouton « Ajouter un livre » dans l'en-tête de la liste
