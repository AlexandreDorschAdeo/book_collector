# [SUC-004-06] ISBN barcode and cover metadata lookup - Hybrid local OCR / Vision AI cover analysis and multi-source text search

```yaml
schema_version: "1.0"
standard: "IREB-CPRE"
artifact_level: 2

jira:
  key: "SUC-004-06"
  issue_type: "Sub Use Case"
  summary: "ISBN barcode and cover metadata lookup - Hybrid local OCR / Vision AI cover analysis and multi-source text search"
  status: "Nouveau"
  priority: "High"
  project:
    key: "BOOK"
    name: "Book Collector"
  components: []
  affected_versions: []
  fix_versions: []
  labels:
    - "openspec"
    - "ireb"
    - "isbn-scan-lookup"
  reporter: null
  assignee: null
  resolution: "Non résolu"
  votes: 0
  time_tracking:
    original_estimate: null
    remaining_estimate: null
    time_spent: null
  custom_fields:
    type_of_requirement: "Functional"
  description: >-
    The system SHALL extract visible text clues from a cover image using a hybrid engine (free local OCR by default, or configured Vision AI provider) and query bibliographic providers (BnF, Google Books, Open Library) to return candidate metadata along with duplicate detection results.
  issue_links:
    relates:
      - link_type: "Relates"
        direction: "relates to >>>"
        target_key: "UC-004"
        target_issue_type: "Use Case"
        target_summary: "ISBN barcode and cover metadata lookup"
        target_status: "Prêt"
        target_file: "../use-cases/UC-004-isbn-barcode-and-cover-metadata-lookup.md"
    tests:
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-004-06-01"
        target_summary: "Default local OCR extraction when no external Vision API key is configured"
        target_status: "Validated"
        target_file: "../../tests/TEST-004-06-01-default-local-ocr-extraction-when-no-external-vision-api-key-is-c.md"
        scenario:
          when: "No external Vision API key is configured and a cover image is submitted for analysis"
          then: "The system extracts text via local OCR and searches matching books across BnF, Google Books, and Open Library"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-004-06-02"
        target_summary: "Vision AI extraction when Gemini, OpenAI, or Ollama provider is configured"
        target_status: "Validated"
        target_file: "../../tests/TEST-004-06-02-vision-ai-extraction-when-gemini-openai-or-ollama-provider-is-con.md"
        scenario:
          when: "A Vision AI provider is configured in Settings or environment and a cover image is analyzed"
          then: "The system extracts title, authors, and publisher via the Vision model and enriches metadata and ISBN from bibliographic providers"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-004-06-03"
        target_summary: "Persist Vision AI and API keys from Settings screen into SQLite"
        target_status: "Validated"
        target_file: "../../tests/TEST-004-06-03-persist-vision-ai-and-api-keys-from-settings-screen-into-sqlite.md"
        scenario:
          when: "An administrator saves Vision AI provider settings and API keys in the Settings screen"
          then: "The system persists these settings in SQLite and applies them immediately to subsequent cover analyses"
      - link_type: "Test"
        relationship: "is tested by"
        target_key: "TEST-004-06-04"
        target_summary: "Immediate duplicate detection on cover analysis candidates"
        target_status: "Validated"
        target_file: "../../tests/TEST-004-06-04-immediate-duplicate-detection-on-cover-analysis-candidates.md"
        scenario:
          when: "A book candidate is identified from a cover photo"
          then: "The system immediately checks whether the candidate (by ISBN or normalized title + author) already exists in the user's collections and displays the duplicate alert"

ireb:
  category: "Functional - System Activity"
  obligation: "SHALL"
  actor: "Authenticated User (canAddBooks)"
  statement: >-
    The system SHALL extract visible text clues from a cover image using a hybrid engine (free local OCR by default, or configured Vision AI provider) and query bibliographic providers (BnF, Google Books, Open Library) to return candidate metadata along with duplicate detection results.
  traceability:
    local_key: "SUC-004-06"
    parent_use_case: "UC-004"
    source_spec: "openspec/specs/isbn-scan-lookup/spec.md"
    source_requirement: "Requirement: Analyse hybride de couverture et recherche multi-sources par texte"
```
