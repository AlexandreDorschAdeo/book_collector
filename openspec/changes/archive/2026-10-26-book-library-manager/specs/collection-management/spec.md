# Spec Delta

## Purpose

Permettre d'organiser les livres physiques en plusieurs collections, chacune située à un lieu donné (pièce, maison, etc.).

## ADDED Requirements

### Requirement: Créer une collection
Le système SHALL permettre de créer une collection avec un nom obligatoire et un lieu optionnel.

#### Scenario: Création réussie
- **WHEN** l'utilisateur crée une collection « BD » au lieu « Salon »
- **THEN** la collection apparaît dans la liste des collections avec son nom et son lieu

#### Scenario: Nom manquant
- **WHEN** l'utilisateur valide la création sans nom
- **THEN** le système refuse la création et indique que le nom est obligatoire

### Requirement: Unicité du nom de collection
Le système SHALL refuser deux collections ayant le même nom et le même lieu, sans tenir compte de la casse.

#### Scenario: Doublon refusé
- **WHEN** l'utilisateur crée « bd » au lieu « Salon » alors que « BD » au lieu « Salon » existe
- **THEN** le système refuse la création avec un message explicite

### Requirement: Modifier et supprimer une collection
Le système SHALL permettre de renommer une collection, de changer son lieu et de la supprimer.

#### Scenario: Suppression d'une collection vide
- **WHEN** l'utilisateur supprime une collection ne contenant aucun livre
- **THEN** la collection disparaît de la liste

#### Scenario: Suppression d'une collection contenant des livres présents ailleurs
- **WHEN** l'utilisateur supprime une collection dont tous les livres appartiennent aussi à une autre collection
- **THEN** la collection est supprimée et ses livres restent disponibles dans leurs autres collections

#### Scenario: Suppression refusée pour livre orphelin
- **WHEN** l'utilisateur tente de supprimer une collection contenant un livre qui n'appartient à aucune autre collection
- **THEN** le système refuse la suppression et demande d'abord d'affecter ce livre à une autre collection ou de le supprimer

### Requirement: Aperçu des collections
Le système SHALL afficher la liste des collections avec leur lieu et le nombre de livres qu'elles contiennent.

#### Scenario: Compteurs
- **WHEN** l'utilisateur ouvre la liste des collections
- **THEN** chaque collection affiche son nombre de livres à jour
