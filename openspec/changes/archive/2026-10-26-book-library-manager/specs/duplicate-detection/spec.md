# Spec Delta

## Purpose

Informer immédiatement l'utilisateur, lors d'un scan, qu'il possède déjà le livre ou une autre édition du même ouvrage, afin d'éviter les achats en double.

## ADDED Requirements

### Requirement: Détection d'un livre déjà possédé
Le système SHALL signaler, dès l'identification d'un ISBN, qu'un livre portant le même ISBN-13 est déjà possédé, en indiquant sa ou ses collections et lieux.

#### Scenario: Même ISBN
- **WHEN** l'utilisateur scanne un ISBN déjà présent dans la collection « Salon »
- **THEN** le système affiche « Vous possédez déjà ce livre » avec la collection « Salon » et son lieu, avant toute validation d'ajout

#### Scenario: Ajout à une autre collection
- **WHEN** l'utilisateur choisit d'ajouter le livre déjà possédé à la collection sélectionnée, qui ne le contient pas
- **THEN** le livre existant est rattaché à cette collection sans créer de nouveau livre

#### Scenario: Ajout d'un second exemplaire
- **WHEN** l'utilisateur confirme explicitement vouloir enregistrer un exemplaire supplémentaire
- **THEN** un nouveau livre distinct est créé avec le même ISBN

### Requirement: Détection d'une autre édition
Le système SHALL signaler les livres possédés ayant le même auteur et le même titre que le livre scanné mais un ISBN différent, en les présentant comme une édition différente.

#### Scenario: Édition différente
- **WHEN** l'utilisateur scanne l'édition poche d'un titre dont l'édition reliée du même auteur est possédée
- **THEN** le système affiche « Vous possédez ce titre dans une autre édition » avec l'ISBN, le sous-titre éventuel, la ou les collections et leurs lieux pour l'exemplaire possédé

#### Scenario: Titre identique, auteur différent
- **WHEN** un livre possédé a le même titre mais un auteur différent
- **THEN** le système ne le signale pas comme autre édition

### Requirement: Comparaison tolérante du titre et de l'auteur
Le système SHALL comparer l'intitulé complet (titre et sous-titre) et les auteurs (quel que soit leur rôle) sans tenir compte de la casse, des accents, de la ponctuation ni des articles initiaux, et SHALL traiter des sous-titres ou numéros de tome différents comme des titres différents.

#### Scenario: Variantes typographiques
- **WHEN** le livre possédé est « Astérix le Gaulois » et le livre scanné « ASTERIX LE GAULOIS »
- **THEN** les deux sont considérés comme le même titre

#### Scenario: Tomes différents
- **WHEN** le livre possédé est « One Piece, tome 1 » et le livre scanné « One Piece, tome 2 » du même auteur
- **THEN** le système ne les signale pas comme une même œuvre

### Requirement: Indication immédiate dans le flux de scan
Le système SHALL afficher le résultat du contrôle de doublon en même temps que les métadonnées du livre scanné, avant que l'utilisateur ne valide l'ajout, et SHALL indiquer explicitement lorsqu'aucun doublon n'existe.

#### Scenario: Aucun doublon
- **WHEN** l'utilisateur scanne un livre absent de toutes les collections et sans autre édition
- **THEN** le système affiche que le livre n'est pas encore possédé et propose de l'ajouter

#### Scenario: Contrôle sur saisie manuelle
- **WHEN** l'utilisateur renseigne manuellement titre et auteur d'un livre sans ISBN
- **THEN** le système applique la détection d'autre édition sur ces valeurs
