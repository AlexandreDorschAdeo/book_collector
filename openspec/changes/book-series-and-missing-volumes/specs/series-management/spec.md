# Spec Delta

## Purpose

Regrouper les livres d'une même histoire au sein d'une série ordonnée par numéro de tome et identifier automatiquement les tomes manquants pour faciliter les recherches en bouquinerie, sur les sites d'occasion ou pour des listes de cadeaux.

## ADDED Requirements

### Requirement: Regroupement des livres par série et numéro de tome
Le système SHALL regrouper automatiquement sous une même série tous les livres partageant le même nom de série (sans distinction de casse ni d'accents), triés par numéro de tome croissant.

#### Scenario: Regroupement insensible à la casse et aux accents
- **WHEN** deux livres sont enregistrés avec les séries « One Piece » (tome 1) et « one piece » (tome 2)
- **THEN** l'écran des séries les affiche dans une seule série « One Piece » avec les tomes 1 et 2 triés dans l'ordre

### Requirement: Calcul automatique des tomes manquants dans la numérotation
Le système SHALL calculer automatiquement les tomes manquants d'une série en identifiant tous les numéros entiers absents entre le tome 1 et le plus grand numéro de tome possédé (ou le dernier tome paru configuré pour la série s'il est supérieur).

#### Scenario: Détection des trous entre les tomes possédés
- **WHEN** une série « One Piece » contient les tomes 1, 2 et 5 sans dernier tome paru configuré
- **THEN** le système affiche les tomes 1, 2 et 5 comme possédés et signale les tomes 3 et 4 comme manquants

#### Scenario: Série complète jusqu'au dernier tome possédé
- **WHEN** une série « Blacksad » contient les tomes 1, 2 et 3 sans dernier tome paru configuré
- **THEN** le système indique que la série ne comporte aucun tome manquant connu

### Requirement: Configuration du dernier tome paru par série
Le système SHALL permettre de définir ou modifier, pour chaque série, le nombre total de tomes parus (dernier tome paru) afin d'inclure dans les tomes manquants tous les numéros situés après le dernier tome possédé jusqu'à ce total.

#### Scenario: Définition du dernier tome paru supérieur aux tomes possédés
- **WHEN** une série possède les tomes 1, 2 et 4 et que l'utilisateur définit le dernier tome paru à 7
- **THEN** le système affiche les tomes 3, 5, 6 et 7 dans la liste des tomes manquants de cette série

#### Scenario: Effacement du dernier tome paru
- **WHEN** l'utilisateur efface la valeur du dernier tome paru d'une série possédant les tomes 1, 2 et 4
- **THEN** le système recalcule les tomes manquants uniquement jusqu'au tome maximum possédé (seul le tome 3 reste signalé manquant)

### Requirement: Écran dédié aux séries, filtres et copie de liste de manquants
Le système SHALL proposer un écran dédié « Séries » permettant de rechercher une série, de filtrer uniquement les séries ayant des tomes manquants et de copier en un clic le récapitulatif des tomes manquants (pour recherche d'occasion ou liste de cadeaux).

#### Scenario: Filtrage des séries incomplètes
- **WHEN** l'utilisateur active le filtre « Séries avec tomes manquants » dans l'écran des séries
- **THEN** seules les séries présentant au moins un tome manquant restent affichées

#### Scenario: Copie de la liste des tomes manquants
- **WHEN** l'utilisateur clique sur l'action permettant de copier les tomes manquants d'une série (ou de toutes les séries incomplètes)
- **THEN** le système génère un texte synthétique listant le nom de la série et les numéros des tomes manquants prêt à être partagé ou consulté
