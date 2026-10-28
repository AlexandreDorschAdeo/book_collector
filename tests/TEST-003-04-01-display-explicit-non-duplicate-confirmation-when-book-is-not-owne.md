# [TEST-003-04-01] Display explicit non-duplicate confirmation when book is not owned

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-003-04-01"
  issue_type: "Test"
  summary: "Display explicit non-duplicate confirmation when book is not owned"
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
        target_key: "SUC-003-04"
        target_issue_type: "Sub Use Case"
        target_summary: "Duplicate and alternative edition detection - Immediate duplicate check feedback during scan and manual entry"
        target_status: "Nouveau"
        target_file: "../requirements/sub-use-cases/SUC-003-04-immediate-duplicate-feedback-in-scan-flow.md"
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

      Scenario: Display explicit non-duplicate confirmation when book is not owned
        Given The user is on the Add Book / Scan screen and scans an ISBN, analyzes a cover, or enters title and author
        When The user scans a book absent from all collections and having no alternative edition
        Then The system indicates that the book is not yet owned and offers to add it

traceability:
  local_key: "TEST-003-04-01"
  use_case_key: "UC-003"
  sub_use_case_key: "SUC-003-04"
  source_spec: "openspec/specs/duplicate-detection/spec.md"
  source_requirement: "Requirement: Indication immédiate dans le flux de scan"
  automated_tests:
    - "server/test/lookup-check.test.ts"
    - "server/test/normalize.test.ts"
```
