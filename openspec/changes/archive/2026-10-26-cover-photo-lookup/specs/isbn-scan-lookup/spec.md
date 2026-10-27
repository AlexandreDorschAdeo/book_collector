## ADDED Requirements

### Requirement: Analyse hybride de couverture et recherche multi-sources par texte
Le système SHALL extraire les informations visibles sur une image de couverture via un moteur hybride (OCR local gratuit par défaut, ou modèle IA Vision si configuré) et SHALL interroger les sources bibliographiques (BnF, Google Books, Open Library) pour retourner les métadonnées complètes (ISBN, titre, sous-titre, auteurs/scénariste/dessinateur, maison d'édition) ainsi que la vérification des doublons.

#### Scenario: Extraction par OCR local par défaut
- **WHEN** aucune clé d'API Vision externe n'est configurée et qu'une image de couverture est soumise à l'analyse
- **THEN** le système extrait le texte de la couverture par OCR local et recherche les livres correspondants auprès de la BnF, Google Books et Open Library

#### Scenario: Extraction par IA Vision optionnelle
- **WHEN** un fournisseur IA Vision est configuré (`GEMINI_API_KEY`, `OPENAI_API_KEY` ou `OLLAMA_URL`) via l'écran « ⚙️ Paramétrage » ou l'environnement et qu'une image de couverture est soumise à l'analyse
- **THEN** le système identifie le titre, les auteurs et l'éditeur via le modèle Vision puis enrichit les données et l'ISBN auprès des sources bibliographiques

#### Scenario: Configuration depuis l'écran Paramétrage
- **WHEN** l'utilisateur clique sur le bouton « ⚙️ Paramétrage » dans le menu supérieur et enregistre ses clés ou URLs (`GEMINI_API_KEY`, `OPENAI_API_KEY`, `OLLAMA_URL`, `GOOGLE_BOOKS_API_KEY`)
- **THEN** le système sauvegarde ces paramètres dans la base SQLite persistante et les utilise immédiatement pour les analyses de couverture suivantes

#### Scenario: Vérification immédiate des doublons sur les résultats d'analyse
- **WHEN** un livre est identifié à partir de la photo de couverture
- **THEN** le système vérifie immédiatement si ce livre (par ISBN ou par couple titre + auteur normalisés) est déjà présent dans les collections de l'utilisateur et affiche l'alerte correspondante
