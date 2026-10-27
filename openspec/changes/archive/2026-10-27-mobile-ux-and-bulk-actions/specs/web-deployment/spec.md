## MODIFIED Requirements

### Requirement: Navigation principale unifiée
Le système SHALL afficher les entrées de navigation (« Ajouter un livre », « Bibliothèque », « Actions groupées », « Collections », « Paramétrage ») sur une seule ligne horizontale compacte, avec icônes seules sur smartphone (`< 640px`, dotées de libellés accessibles) et icônes accompagnées d'un texte court sur tablette et ordinateur (`>= 640px`), sans bouton d'ajout redondant sur la page « Bibliothèque ».

#### Scenario: Menu compact sur une seule ligne sur mobile et tablette
- **WHEN** l'utilisateur consulte l'en-tête de l'application sur un smartphone ou une tablette
- **THEN** tous les boutons du menu principal tiennent sur une seule ligne avec leurs icônes dédiées et restent accessibles par leurs libellés (`Ajouter un livre`, `Bibliothèque`, `Actions groupées`, `Collections`, `Paramétrage`)

#### Scenario: Libellés du menu supérieur
- **WHEN** l'utilisateur consulte l'en-tête de l'application
- **THEN** le menu principal présente les entrées « Ajouter un livre », « Bibliothèque », « Actions groupées », « Collections » et « Paramétrage » selon les permissions de l'utilisateur

#### Scenario: Page d'accueil Bibliothèque sans bouton d'ajout redondant
- **WHEN** l'utilisateur affiche la page d'accueil « Bibliothèque »
- **THEN** la liste des livres et les filtres de recherche s'affichent sans bouton « Ajouter un livre » dans l'en-tête de la liste

## ADDED Requirements

### Requirement: Identité visuelle chouette et livre
Le système SHALL afficher une icône vectorielle représentant une tête de chouette érudite aux yeux dorés au-dessus d'un livre ouvert sur fond ardoise foncé, utilisée comme favicon, icône d'application web progressive (`/icon.svg`) et logo dans l'en-tête de l'application.

#### Scenario: Affichage du logo chouette et livre
- **WHEN** l'utilisateur charge l'application ou consulte son icône PWA / favicon
- **THEN** l'emblème vectoriel combinant la tête de chouette et le livre ouvert est affiché dans l'en-tête et servi via `/icon.svg`
