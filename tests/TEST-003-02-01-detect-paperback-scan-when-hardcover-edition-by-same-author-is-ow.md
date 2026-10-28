# [TEST-003-02-01] Detect paperback scan when hardcover edition by same author is owned

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-003-02-01"
  issue_type: "Test"
  summary: "Detect paperback scan when hardcover edition by same author is owned"
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

      Scenario: Detect paperback scan when hardcover edition by same author is owned
        Given The user is on the Add Book / Scan screen and scans an ISBN, analyzes a cover, or enters title and author
        When The user scans the paperback edition of a work whose hardcover edition by the same author is already owned
        Then The system displays "You own this title in another edition" along with the owned ISBN, subtitle, collections, and locations

traceability:
  local_key: "TEST-003-02-01"
  use_case_key: "UC-003"
  sub_use_case_key: "SUC-003-02"
  source_spec: "openspec/specs/duplicate-detection/spec.md"
  source_requirement: "Requirement: Détection d'une autre édition"
  automated_tests:
    - "server/test/lookup-check.test.ts"
    - "server/test/normalize.test.ts"
```
