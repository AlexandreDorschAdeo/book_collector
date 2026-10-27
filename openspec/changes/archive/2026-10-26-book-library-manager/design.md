# Design

## Context

Projet vierge, un seul utilisateur/foyer, déploiement sur un petit serveur du réseau local (NAS, mini-PC). Voir proposal.md pour la motivation et les specs pour les exigences. Contrainte structurante : `getUserMedia` (caméra) n'est disponible qu'en contexte sécurisé (HTTPS ou localhost).

## Goals / Non-Goals

**Goals:**
- Un seul `docker compose up` donnant une app complète en HTTPS.
- Scan fiable sur smartphone (iOS Safari et Android Chrome).
- Contrôle de doublon rapide (< 1 s hors appel réseau de métadonnées).

**Non-Goals:**
- Couvertures de livres et métadonnées secondaires (éditeur, date, résumé, nombre de pages, etc.) — hors MVP.
- Authentification, multi-utilisateurs, exposition sur Internet.
- Mode hors ligne avec synchronisation.
- Prêts, listes de souhaits, import/export.

## Decisions

1. **Backend Node.js (TypeScript) + Fastify, base SQLite (better-sqlite3)**, fichier dans un volume Docker.
   Pourquoi : un seul conteneur léger, zéro serveur de base à administrer, volume de données modeste. Alternatives : PostgreSQL (surdimensionné), Python/FastAPI (équivalent, mais un seul langage front/back simplifie).

2. **Front React + Vite en PWA responsive**, servi comme fichiers statiques par le backend.
   Pourquoi : une seule base de code pour PC/tablette/mobile, installable (manifest + service worker). Alternatives : application native (deux plateformes à maintenir), rendu serveur (scan caméra moins fluide).

3. **Scan via `BarcodeDetector` quand disponible, repli sur la bibliothèque ZXing (`@zxing/browser`)**.
   Pourquoi : Safari iOS ne supporte pas toujours `BarcodeDetector`. Saisie manuelle d'ISBN toujours disponible en dernier recours.

4. **HTTPS via un reverse proxy Caddy dans le docker compose** (`tls internal`, autorité locale). Le certificat racine de Caddy est à installer sur les téléphones, procédure documentée dans le README. Option : fournir ses propres certificats (ex. domaine + DNS-01).
   Alternatives : certificat auto-signé du backend (même contrainte de confiance, moins de gestion), tunnel public (hors périmètre, expose les données).

5. **Métadonnées côté serveur (MVP : titre, sous-titre, auteurs + rôles)** : le backend interroge le catalogue SRU de la BnF (UNIMARC, qui distingue titre/sous-titre et les rôles comme scénariste et dessinateur), puis Open Library et Google Books en repli, fusionne les champs manquants et met en cache en base. Aucune couverture ni métadonnée secondaire n'est récupérée en MVP. Le formulaire permet toujours d'ajuster le rôle de chaque auteur (`author`, `writer` / scénariste, `illustrator` / dessinateur).

6. **Modèle de données** : `collection(id, name, location)`, `book_collection(book_id, collection_id)` (relation plusieurs-à-plusieurs, clé primaire composite), `book(id, isbn13, title, subtitle, authors_json, type, title_key, author_key, created_at)` où `authors_json` stocke `[{ name, role }]`. `title_key` (calculé sur `title` + `subtitle`) et `author_key` sont des clés normalisées calculées à l'écriture (minuscules, sans accents ni ponctuation, sans article initial ; le sous-titre et le numéro de tome restent dans la clé du titre).
   Recherche : table virtuelle SQLite FTS5 sur titre, sous-titre, auteurs et ISBN avec tokenizer `remove_diacritics`.

7. **Détection de doublon** : endpoint `GET /api/check?isbn=…&title=…&author=…` renvoyant `{ sameIsbn: [...], otherEditions: [...] }`.
   - `sameIsbn` : égalité sur `isbn13` normalisé (ISBN-10 converti en ISBN-13).
   - `otherEditions` : égalité de `title_key` et `author_key` avec `isbn13` différent. Les auteurs sont comparés par recouvrement (au moins un auteur commun).
   L'écran de scan appelle cet endpoint dès que les métadonnées arrivent et affiche le résultat dans la même vue.

8. **Un livre appartient à au moins une collection** : la contrainte « au moins une » est vérifiée en transaction par l'API (retrait de collection, suppression de collection). Posséder le même livre à deux endroits se fait en rattachant un seul livre à plusieurs collections ; un exemplaire distinct (ligne séparée, même ISBN) n'est créé que sur confirmation explicite. Le résultat de `/api/check` liste, pour chaque livre trouvé, toutes ses collections et leurs lieux.

## Risks / Trade-offs

- [Mauvaise confiance du certificat sur les téléphones, caméra bloquée] → guide d'installation pas à pas, saisie manuelle d'ISBN en repli.
- [Métadonnées absentes ou différentes entre éditions, surtout mangas/comics] → formulaire toujours modifiable ; comparaison tolérante ; risque de faux négatifs sur titres traduits ou séries mal numérotées, acceptable et corrigeable à la main.
- [Faux positifs « autre édition » entre tomes] → numéro de tome conservé dans la clé de titre.
- [Limites ou indisponibilité des API publiques] → deux sources, cache local, repli sur saisie manuelle.
- [Pas d'authentification] → usage réseau local uniquement, documenté ; protection possible via le reverse proxy.
- [Perte de données SQLite] → volume dédié, sauvegarde simple par copie du fichier, documentée.
