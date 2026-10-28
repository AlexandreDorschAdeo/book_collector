# [TEST-003-01-02] Attach already owned book to a new collection without duplicating the record

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-003-01-02"
  issue_type: "Test"
  summary: "Attach already owned book to a new collection without duplicating the record"
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
    - "duplicate-detection"
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
        target_key: "SUC-003-01"
        target_issue_type: "Sub Use Case"
        target_summary: "Duplicate and alternative edition detection - Exact ISBN-13 duplicate detection and collection attachment"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-003-01-exact-isbn13-duplicate-detection.md"
      - link_type: "Test"
        relationship: "tests"
        target_key: "UC-003"
        target_issue_type: "Use Case"
        target_summary: "Duplicate and alternative edition detection"
        target_status: "Prêt"
        target_file: "../requirements/use-cases/UC-003-duplicate-and-edition-detection.md"

xray:
  test_type: "Cucumber"
  gherkin: |
    Feature: Duplicate and alternative edition detection

      Scenario: Attach already owned book to a new collection without duplicating the record
        Given The user is on the Add Book / Scan screen and scans an ISBN, analyzes a cover, or enters title and author
        When The user chooses to add the already owned book to a selected collection that does not yet contain it
        Then The existing book record is linked to the selected collection without creating a duplicate book entry

traceability:
  local_key: "TEST-003-01-02"
  use_case_key: "UC-003"
  sub_use_case_key: "SUC-003-01"
  source_spec: "openspec/specs/duplicate-detection/spec.md"
  source_requirement: "Requirement: Détection d'un livre déjà possédé"
  automated_tests:
    - "server/test/lookup-check.test.ts"
    - "server/test/normalize.test.ts"
```
