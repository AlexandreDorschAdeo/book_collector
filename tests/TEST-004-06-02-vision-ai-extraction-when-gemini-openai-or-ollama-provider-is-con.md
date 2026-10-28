# [TEST-004-06-02] Vision AI extraction when Gemini, OpenAI, or Ollama provider is configured

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-004-06-02"
  issue_type: "Test"
  summary: "Vision AI extraction when Gemini, OpenAI, or Ollama provider is configured"
  status: "Validated"
  priority: "High"
  project:
    key: "BOOK"
    name: "Book Collector"
  components: []
  affected_versions: []
  fix_versions: []
  labels:
    - "openspec"
    - "xray"
    - "isbn-scan-lookup"
  reporter: null
  assignee: null
  resolution: "Non résolu"
  votes: 0
  time_tracking:
    original_estimate: null
    remaining_estimate: null
    time_spent: null
  attachments: []
  custom_fields:
    test_level: "Acceptance test"
    sanity_check: "Yes"
    regression_test: "Yes"
  issue_links:
    tests:
      - link_type: "Test"
        relationship: "tests"
        target_key: "SUC-004-06"
        target_issue_type: "Sub Use Case"
        target_summary: "ISBN barcode and cover metadata lookup - Hybrid local OCR / Vision AI cover analysis and multi-source text search"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-004-06-hybrid-ocr-vision-cover-analysis.md"
      - link_type: "Test"
        relationship: "tests"
        target_key: "UC-004"
        target_issue_type: "Use Case"
        target_summary: "ISBN barcode and cover metadata lookup"
        target_status: "Prêt"
        target_file: "../requirements/use-cases/UC-004-isbn-barcode-and-cover-metadata-lookup.md"

xray:
  test_type: "Cucumber"
  gherkin: |
    Feature: ISBN barcode and cover metadata lookup

      Scenario: Vision AI extraction when Gemini, OpenAI, or Ollama provider is configured
        Given The user is authenticated with canAddBooks permission
        When A Vision AI provider is configured in Settings or environment and a cover image is analyzed
        Then The system extracts title, authors, and publisher via the Vision model and enriches metadata and ISBN from bibliographic providers

traceability:
  local_key: "TEST-004-06-02"
  use_case_key: "UC-004"
  sub_use_case_key: "SUC-004-06"
  source_spec: "openspec/specs/isbn-scan-lookup/spec.md"
  source_requirement: "Requirement: Analyse hybride de couverture et recherche multi-sources par texte"
  automated_tests:
    - "server/test/isbn.test.ts"
    - "server/test/metadata.test.ts"
    - "server/test/cover-lookup.test.ts"
```
