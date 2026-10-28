# [TEST-003-04-02] Run alternative edition check on manual title and author entry without ISBN

```yaml
schema_version: "1.0"
standard: "IREB-CPRE / Xray-Gherkin"
artifact_type: "Test"

jira:
  key: "TEST-003-04-02"
  issue_type: "Test"
  summary: "Run alternative edition check on manual title and author entry without ISBN"
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

      Scenario: Run alternative edition check on manual title and author entry without ISBN
        Given The user is on the Add Book / Scan screen and scans an ISBN, analyzes a cover, or enters title and author
        When The user manually enters the title and author of a book without an ISBN
        Then The system executes alternative edition detection on the entered values

traceability:
  local_key: "TEST-003-04-02"
  use_case_key: "UC-003"
  sub_use_case_key: "SUC-003-04"
  source_spec: "openspec/specs/duplicate-detection/spec.md"
  source_requirement: "Requirement: Indication immédiate dans le flux de scan"
  automated_tests:
    - "server/test/lookup-check.test.ts"
    - "server/test/normalize.test.ts"
```
