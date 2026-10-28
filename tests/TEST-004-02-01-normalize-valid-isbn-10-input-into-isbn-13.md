# [TEST-004-02-01] Normalize valid ISBN-10 input into ISBN-13

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-004-02-01"
  issue_type: "Test"
  summary: "Normalize valid ISBN-10 input into ISBN-13"
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
        target_key: "SUC-004-02"
        target_issue_type: "Sub Use Case"
        target_summary: "ISBN barcode and cover metadata lookup - Manual ISBN-10 / ISBN-13 entry, checksum validation, and ISBN-13 normalization"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-004-02-manual-isbn10-isbn13-normalization-and-validation.md"
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

      Scenario: Normalize valid ISBN-10 input into ISBN-13
        Given The user is authenticated with canAddBooks permission
        When The user enters a valid ISBN-10
        Then The system converts and processes it as its equivalent ISBN-13

traceability:
  local_key: "TEST-004-02-01"
  use_case_key: "UC-004"
  sub_use_case_key: "SUC-004-02"
  source_spec: "openspec/specs/isbn-scan-lookup/spec.md"
  source_requirement: "Requirement: Saisie manuelle et normalisation de l'ISBN"
  automated_tests:
    - "server/test/isbn.test.ts"
    - "server/test/metadata.test.ts"
    - "server/test/cover-lookup.test.ts"
```
