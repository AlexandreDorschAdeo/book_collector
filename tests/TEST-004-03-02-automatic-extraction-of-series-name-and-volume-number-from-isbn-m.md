# [TEST-004-03-02] Automatic extraction of series name and volume number from ISBN metadata

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-004-03-02"
  issue_type: "Test"
  summary: "Automatic extraction of series name and volume number from ISBN metadata"
  status: "Validated"
  priority: "Highest"
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
        target_key: "SUC-004-03"
        target_issue_type: "Sub Use Case"
        target_summary: "ISBN barcode and cover metadata lookup - Automatic metadata, author roles, series, and volume retrieval by ISBN"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-004-03-automatic-bibliographic-and-series-metadata-retrieval.md"
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

      Scenario: Automatic extraction of series name and volume number from ISBN metadata
        Given The user is authenticated with canAddBooks permission
        When The ISBN metadata contains a series mention or volume pattern such as "One Piece - Tome 12" or a UNIMARC series zone with volume number
        Then The system automatically pre-fills the "Series" field ("One Piece") and "Volume number" field (12) in the form

traceability:
  local_key: "TEST-004-03-02"
  use_case_key: "UC-004"
  sub_use_case_key: "SUC-004-03"
  source_spec: "openspec/changes/book-series-and-missing-volumes/specs/isbn-scan-lookup/spec.md"
  source_requirement: "Requirement: Récupération des métadonnées"
  automated_tests:
    - "server/test/isbn.test.ts"
    - "server/test/metadata.test.ts"
    - "server/test/cover-lookup.test.ts"
```
