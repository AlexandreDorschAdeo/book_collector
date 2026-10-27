## Context

L'application permet actuellement d'ajouter un livre soit en scannant son code-barre ISBN (`📷 Scanner le code-barre`), soit en saisissant l'ISBN manuellement, soit en remplissant les champs à la main avec la possibilité de prendre une photo de couverture (`CoverPickerModal`).
L'objectif est de permettre à l'utilisateur de partir directement d'une **photo de la couverture** pour :
1. Conserver cette photo (recadrée) comme image de couverture du livre.
2. Extraire automatiquement les informations visibles sur la couverture (titre, sous-titre/tome, auteurs, éditeur).
3. Rechercher le livre dans les catalogues bibliographiques (**BnF SRU**, **Google Books**, **Open Library**) afin de récupérer l'ISBN, les rôles précis (`scénariste`, `dessinateur`, `auteur`), la maison d'édition et le type (`livre`, `bd`, `manga`, `comic`).
4. Déclencher immédiatement la détection de doublon (`exact_isbn` ou `same_title_author`).

## Goals / Non-Goals

**Goals:**
- Fournir un moteur d'analyse de couverture **hybride** :
  - **Mode local par défaut (sans clé API)** : OCR embarqué via `tesseract.js` (`fra+eng`) avec nettoyage et extraction des lignes significatives de la couverture.
  - **Mode IA Vision optionnel** : support de `GEMINI_API_KEY` (Gemini Flash), `OPENAI_API_KEY` (GPT-4o-mini) ou `OLLAMA_URL` (modèle vision local) avec repli transparent sur l'OCR local en cas d'erreur.
- Implémenter la recherche textuelle multi-sources (BnF SRU CQL `bib.anywhere all "..."`, Google Books `q=...`, Open Library `search.json?q=...`) qui retourne une liste dédupliquée de candidats enrichis avec leur statut de doublon local.
- Intégrer l'analyse directement dans l'écran « Ajouter un livre » : dès qu'une couverture est photographiée/recadrée ou via un bouton « 🔍 Identifier depuis la couverture », pré-remplir le formulaire et proposer les correspondances trouvées.

**Non-Goals:**
- Imposer un compte payant ou une clé API externe pour que la fonctionnalité marche.
- Remplacer la photo prise par l'utilisateur par une couverture distante sans son accord (la photo prise par l'utilisateur reste prioritaire comme couverture du livre).

## Decisions

### 1. Pipeline hybride d'extraction des indices de couverture (`server/src/coverLookup.ts`)
- **Entrée** : `POST /api/lookup-cover` avec `{ imageDataUrl: string }`.
- **Étape A — Analyse de l'image** :
  1. Si `GEMINI_API_KEY`, `OPENAI_API_KEY` ou `OLLAMA_URL` est défini, envoi de l'image base64 au modèle multimodal avec un schéma JSON strict `{ title, subtitle, writer, illustrator, publisher, isbn, searchQuery }`.
  2. Sinon (ou en repli si l'appel Vision échoue), exécution de `tesseract.js` (`fra` + `eng`) sur l'image de couverture, filtrage du bruit (lignes trop courtes, caractères parasites, mentions génériques) pour produire `extractedText` et `searchQuery` (ainsi qu'une estimation de titre/auteur sur les lignes principales).
- **Étape B — Recherche bibliographique multi-sources par requête texte** :
  - **BnF SRU** : requête CQL `bib.anywhere all "<mots-clés>" and bib.doctype all "a"` (jusqu'à 5 notices UNIMARC analysées via le parseur `parseBnfUnimarcXml` existant, avec extraction de l'ISBN dans la zone `010 $a`).
  - **Google Books API** : `https://www.googleapis.com/books/v1/volumes?q=<query>&maxResults=5` (extraction de l'ISBN-13 depuis `industryIdentifiers`, titre, sous-titre, auteurs, éditeur, couverture).
  - **Open Library Search API** : `https://openlibrary.org/search.json?q=<query>&limit=5`.
  - Fusion et déduplication des candidats par ISBN (ou par clé `normalizeText(title)|normalizeText(writer)`).
- **Étape C — Vérification des doublons locaux** :
  - Pour chaque candidat retourné (ainsi que pour les indices bruts extraits), exécution de `checkBookOwnership(db, { isbn, title, authors })` afin d'indiquer immédiatement si le livre est déjà possédé ou présent dans une autre édition.

### 2. Expérience utilisateur dans « Ajouter un livre » (`ScanScreen.tsx` & `CoverPickerModal.tsx`)
- Dans le bloc couverture (`CoverPickerModal.tsx`) et dans la barre de scan :
  - Lorsqu'une photo de couverture est validée après recadrage, l'application déclenche automatiquement (si le titre est encore vide) ou via un bouton **« 🔍 Identifier le livre depuis cette couverture »** l'appel à `POST /api/lookup-cover`.
  - Le candidat le plus pertinent pré-remplit automatiquement les champs (`Titre`, `Sous-titre`, `Scénariste`, `Dessinateur`, `Maison d'édition`, `ISBN`, `Type`) et affiche la bannière de doublon correspondante, tout en conservant la photo recadrée comme couverture.
  - Si plusieurs candidats sont trouvés, un sélecteur compact sous la barre d'analyse permet de basculer d'un candidat à l'autre en un tap.

## Risks / Trade-offs

- **[Polices très stylisées sur certaines BD/mangas en mode OCR seul]** → L'OCR Tesseract excelle sur les couvertures de romans, essais et BD classiques, mais peut manquer des lettrages cursifs ou graphiques complexes. Si l'OCR trouve partiellement les mots (ex. nom de l'auteur + un mot du titre ou éditeur), la recherche BnF/Google Books retrouve souvent l'ouvrage ; sinon l'utilisateur peut configurer une clé Vision gratuite (ex. Gemini Flash) ou compléter un mot.
- **[Temps d'initialisation de Tesseract au premier appel]** → Le worker ou les données de langue `fra`/`eng` sont mis en cache sur le serveur (`/data` ou mémoire) pour que les analyses suivantes soient rapides.
