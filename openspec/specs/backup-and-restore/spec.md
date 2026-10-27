# backup-and-restore Specification

## Purpose

Assurer la sauvegarde quotidienne automatique des données de la bibliothèque les jours où des livres sont ajoutés ou modifiés, permettre le téléchargement des fichiers de sauvegarde et offrir une restauration complète (livres, collections, couvertures, utilisateurs et paramètres).

## Requirements

### Requirement: Sauvegarde quotidienne automatique lors d'ajouts ou modifications de livres
Le système SHALL créer ou mettre à jour automatiquement un fichier de sauvegarde daté du jour (format `backup-YYYY-MM-DD.json`) chaque jour où au moins un livre est ajouté ou modifié (création, modification unitaire ou en lot, déplacement unitaire ou en lot, ajout ou suppression de couverture). Aucun fichier quotidien ne doit être généré les jours sans ajout ni modification de livres.

#### Scenario: Ajout ou modification d'un livre dans la journée
- **WHEN** un utilisateur ajoute un nouveau livre ou modifie un livre existant un jour donné (`YYYY-MM-DD`)
- **THEN** le système crée ou met à jour le fichier de sauvegarde `backup-YYYY-MM-DD.json` dans le répertoire des sauvegardes avec l'état courant de la bibliothèque

#### Scenario: Plusieurs modifications le même jour
- **WHEN** plusieurs livres sont ajoutés, modifiés ou déplacés au cours de la même journée (`YYYY-MM-DD`)
- **THEN** le système met à jour l'unique sauvegarde quotidienne `backup-YYYY-MM-DD.json` afin qu'elle reflète le dernier état du jour sans dupliquer les fichiers de la même date

#### Scenario: Journée sans ajout ni modification de livres
- **WHEN** aucune opération d'ajout ou de modification de livre n'a lieu au cours d'une journée
- **THEN** aucun nouveau fichier de sauvegarde quotidienne n'est généré automatiquement pour cette journée

### Requirement: Rétention glissante des 7 derniers jours de sauvegarde
Le système SHALL conserver automatiquement au maximum les 7 derniers fichiers de sauvegarde quotidienne sur le serveur et supprimer les fichiers quotidiens plus anciens lors de la création d'une nouvelle sauvegarde quotidienne.

#### Scenario: Purge au-delà de 7 jours de sauvegarde
- **WHEN** une 8e sauvegarde quotidienne automatique est enregistrée alors que 7 sauvegardes quotidiennes antérieures existent déjà
- **THEN** le système conserve les 7 sauvegardes quotidiennes les plus récentes et supprime automatiquement la plus ancienne

### Requirement: Contenu intégral et autonome du fichier de sauvegarde
Le système SHALL inclure dans chaque fichier de sauvegarde l'intégralité des données de la bibliothèque : les livres et leurs liaisons aux collections, les fichiers d'images de couvertures encodés en base64, les collections, le cache de métadonnées, les comptes utilisateurs avec leurs permissions et les paramètres de l'application.

#### Scenario: Sauvegarde complète des entités et couvertures
- **WHEN** une sauvegarde est générée
- **THEN** le fichier produit contient l'ensemble des collections, livres, associations livre-collection, images de couvertures, utilisateurs et paramètres applicatifs

### Requirement: Consultation, création manuelle et téléchargement d'une sauvegarde
Le système SHALL permettre à un utilisateur disposant des droits d'administration de consulter la liste des sauvegardes présentes sur le serveur, de déclencher manuellement une sauvegarde immédiate et de télécharger tout fichier de sauvegarde sur son appareil.

#### Scenario: Liste et création manuelle depuis l'écran Paramétrage
- **WHEN** un administrateur ouvre l'écran « Paramétrage » et clique sur « Créer une sauvegarde maintenant »
- **THEN** le système génère ou actualise immédiatement la sauvegarde sur le serveur et l'affiche dans la liste avec sa date, sa taille et le nombre de livres

#### Scenario: Téléchargement d'un fichier de sauvegarde
- **WHEN** un administrateur clique sur l'action « Télécharger » d'une sauvegarde listée
- **THEN** le navigateur télécharge le fichier de sauvegarde complet correspondant

### Requirement: Restauration d'une sauvegarde depuis le serveur ou par import de fichier
Le système SHALL permettre à un administrateur de restaurer intégralement la bibliothèque soit à partir d'une sauvegarde stockée sur le serveur, soit en important un fichier de sauvegarde valide depuis son appareil, en remplaçant les livres, collections, images de couvertures, comptes utilisateurs et paramètres, puis en reconstruisant l'index de recherche.

#### Scenario: Restauration depuis une sauvegarde du serveur
- **WHEN** un administrateur sélectionne « Restaurer » sur une sauvegarde de la liste et confirme l'opération
- **THEN** le système restaure les livres, collections, fichiers d'images de couvertures, utilisateurs et paramètres à l'état exact de cette sauvegarde et reconstruit l'index plein texte

#### Scenario: Restauration par import d'un fichier de sauvegarde externe
- **WHEN** un administrateur sélectionne un fichier de sauvegarde valide depuis son appareil et lance la restauration
- **THEN** le système valide le fichier, restaure l'intégralité des données et des images de couvertures contenues dans le fichier et affiche une confirmation

#### Scenario: Rejet d'un fichier de sauvegarde invalide
- **WHEN** un administrateur tente d'importer et restaurer un fichier corrompu ou dont la structure est invalide
- **THEN** le système refuse la restauration avec un message d'erreur explicite et conserve intactes les données existantes
