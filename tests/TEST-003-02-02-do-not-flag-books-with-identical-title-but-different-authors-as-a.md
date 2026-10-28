# [TEST-003-02-02] Do not flag books with identical title but different authors as alternative editions

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-003-02-02"
  issue_type: "Test"
  summary: "Do not flag books with identical title but different authors as alternative editions"
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
        target_key: "SUC-003-02"
        target_issue_type: "Sub Use Case"
        target_summary: "Duplicate and alternative edition detection - Alternative edition detection by matching author and title with different ISBN"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-003-02-alternative-edition-detection.md"
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

      Scenario: Do not flag books with identical title but different authors as alternative editions
        Given The user is on the Add Book / Scan screen and scans an ISBN, analyzes a cover, or enters title and author
        When An owned book has the same title as the scanned book but a different author
        Then The system does not flag the owned book as an alternative edition

traceability:
  local_key: "TEST-003-02-02"
  use_case_key: "UC-003"
  sub_use_case_key: "SUC-003-02"
  source_spec: "openspec/specs/duplicate-detection/spec.md"
  source_requirement: "Requirement: Détection d'une autre édition"
  automated_tests:
    - "server/test/lookup-check.test.ts"
    - "server/test/normalize.test.ts"
```
