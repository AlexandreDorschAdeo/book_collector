# [TEST-003-01-03] Explicitly register a second physical copy with the same ISBN

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-003-01-03"
  issue_type: "Test"
  summary: "Explicitly register a second physical copy with the same ISBN"
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

      Scenario: Explicitly register a second physical copy with the same ISBN
        Given The user is on the Add Book / Scan screen and scans an ISBN, analyzes a cover, or enters title and author
        When The user explicitly confirms registering an additional copy of an already owned ISBN
        Then A new distinct book record is created with the same ISBN

traceability:
  local_key: "TEST-003-01-03"
  use_case_key: "UC-003"
  sub_use_case_key: "SUC-003-01"
  source_spec: "openspec/specs/duplicate-detection/spec.md"
  source_requirement: "Requirement: Détection d'un livre déjà possédé"
  automated_tests:
    - "server/test/lookup-check.test.ts"
    - "server/test/normalize.test.ts"
```
